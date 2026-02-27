// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEvoPool.sol";

/**
 * @title EvoPool
 * @author EvoArena Protocol
 * @notice Adaptive AMM with 3 curve modes: Normal, Defensive, VolatilityAdaptive.
 *         Parameters (feeBps, curveBeta, curveMode) are updated by a trusted
 *         AgentController contract. Uses a constant-product baseline with
 *         curve-mode-dependent modifications to price impact and fees.
 *
 * @dev curveBeta is stored scaled by 1e4, so 10000 = 1.0, 2000 = 0.2, etc.
 *      feeBps is in basis points (1 bps = 0.01%).
 */
contract EvoPool is IEvoPool, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ── Tokens ──────────────────────────────────────────────────────────
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    // ── Reserves ────────────────────────────────────────────────────────
    uint256 public reserve0;
    uint256 public reserve1;

    // ── LP accounting ───────────────────────────────────────────────────
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    // ── Tunable parameters (set by AgentController) ─────────────────────
    uint256 public override feeBps;       // e.g. 30 = 0.30 %
    uint256 public override curveBeta;    // scaled 1e4; 10000 = 1.0
    CurveMode public override curveMode;

    // ── Access ──────────────────────────────────────────────────────────
    address public controller; // AgentController address

    // ── Trade tracking (for off-chain agent) ────────────────────────────
    uint256 public tradeCount;
    uint256 public cumulativeVolume0;
    uint256 public cumulativeVolume1;

    // ── Constants ───────────────────────────────────────────────────────
    uint256 public constant MAX_FEE_BPS = 500;          // 5 %
    uint256 public constant BETA_SCALE  = 10_000;       // 1.0 = 10000
    uint256 private constant MINIMUM_LIQUIDITY = 1000;

    // ── Errors ──────────────────────────────────────────────────────────
    error ZeroAmount();
    error InsufficientOutput();
    error InsufficientLiquidity();
    error InvalidTokens();
    error OnlyController();
    error FeeTooHigh();
    error InvalidCurveMode();

    modifier onlyController() {
        if (msg.sender != controller) revert OnlyController();
        _;
    }

    constructor(
        address _token0,
        address _token1,
        uint256 _initialFeeBps,
        uint256 _initialCurveBeta,
        address _owner
    ) Ownable(_owner) {
        if (_token0 == _token1 || _token0 == address(0) || _token1 == address(0))
            revert InvalidTokens();
        if (_initialFeeBps > MAX_FEE_BPS) revert FeeTooHigh();

        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        feeBps = _initialFeeBps;
        curveBeta = _initialCurveBeta;
        curveMode = CurveMode.Normal;
    }

    // ── Admin ───────────────────────────────────────────────────────────

    /**
     * @notice Set the AgentController address (one-time or owner-updatable).
     */
    function setController(address _controller) external onlyOwner {
        controller = _controller;
    }

    // ── Views ───────────────────────────────────────────────────────────

    function getReserves() external view override returns (uint256, uint256) {
        return (reserve0, reserve1);
    }

    // ── Liquidity ───────────────────────────────────────────────────────

    /**
     * @notice Add liquidity in proportion to current reserves.
     *         First deposit sets the ratio. Returns LP shares.
     */
    function addLiquidity(
        uint256 amount0,
        uint256 amount1
    ) external override nonReentrant returns (uint256 liquidity) {
        if (amount0 == 0 || amount1 == 0) revert ZeroAmount();

        token0.safeTransferFrom(msg.sender, address(this), amount0);
        token1.safeTransferFrom(msg.sender, address(this), amount1);

        if (totalSupply == 0) {
            liquidity = _sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            // Lock minimum liquidity to prevent manipulation
            totalSupply = MINIMUM_LIQUIDITY;
            balanceOf[address(0)] = MINIMUM_LIQUIDITY;
        } else {
            uint256 liq0 = (amount0 * totalSupply) / reserve0;
            uint256 liq1 = (amount1 * totalSupply) / reserve1;
            liquidity = liq0 < liq1 ? liq0 : liq1;
        }

        if (liquidity == 0) revert InsufficientLiquidity();

        balanceOf[msg.sender] += liquidity;
        totalSupply += liquidity;

        reserve0 += amount0;
        reserve1 += amount1;

        emit LiquidityAdded(msg.sender, amount0, amount1, liquidity);
    }

    /**
     * @notice Remove liquidity by burning LP shares.
     */
    function removeLiquidity(
        uint256 liquidity
    ) external override nonReentrant returns (uint256 amount0, uint256 amount1) {
        if (liquidity == 0) revert ZeroAmount();
        if (balanceOf[msg.sender] < liquidity) revert InsufficientLiquidity();

        amount0 = (liquidity * reserve0) / totalSupply;
        amount1 = (liquidity * reserve1) / totalSupply;

        if (amount0 == 0 || amount1 == 0) revert InsufficientLiquidity();

        balanceOf[msg.sender] -= liquidity;
        totalSupply -= liquidity;

        reserve0 -= amount0;
        reserve1 -= amount1;

        token0.safeTransfer(msg.sender, amount0);
        token1.safeTransfer(msg.sender, amount1);

        emit LiquidityRemoved(msg.sender, amount0, amount1, liquidity);
    }

    // ── Swap ────────────────────────────────────────────────────────────

    /**
     * @notice Execute a swap. The curve mode and fee are applied.
     * @param zeroForOne  true = sell token0 for token1, false = opposite
     * @param amountIn    amount of input token
     * @param minAmountOut  minimum acceptable output (slippage guard)
     */
    function swap(
        bool zeroForOne,
        uint256 amountIn,
        uint256 minAmountOut
    ) external override nonReentrant returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();
        if (reserve0 == 0 || reserve1 == 0) revert InsufficientLiquidity();

        // Apply curve-mode adjustments to effective input
        uint256 effectiveIn = _applyCurve(amountIn, zeroForOne);

        // Deduct fee
        uint256 feeAmount = (effectiveIn * feeBps) / 10_000;
        uint256 amountInAfterFee = effectiveIn - feeAmount;

        // Constant-product math
        uint256 reserveIn  = zeroForOne ? reserve0 : reserve1;
        uint256 reserveOut = zeroForOne ? reserve1 : reserve0;

        // dy = reserveOut - (reserveIn * reserveOut) / (reserveIn + dx)
        amountOut = (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee);

        if (amountOut < minAmountOut) revert InsufficientOutput();

        // Transfer tokens
        if (zeroForOne) {
            token0.safeTransferFrom(msg.sender, address(this), amountIn);
            token1.safeTransfer(msg.sender, amountOut);
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            token1.safeTransferFrom(msg.sender, address(this), amountIn);
            token0.safeTransfer(msg.sender, amountOut);
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }

        // Track stats
        tradeCount++;
        if (zeroForOne) {
            cumulativeVolume0 += amountIn;
        } else {
            cumulativeVolume1 += amountIn;
        }

        emit Swap(msg.sender, zeroForOne, amountIn, amountOut, feeAmount);
    }

    // ── Parameter updates (called by AgentController) ───────────────────

    /**
     * @notice Update pool parameters. Only callable by the AgentController.
     * @dev Bounds are enforced in AgentController; pool does a final cap check.
     * @param _agent The address of the agent that proposed this update.
     */
    function updateParameters(
        uint256 _feeBps,
        uint256 _curveBeta,
        CurveMode _curveMode,
        address _agent
    ) external onlyController {
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        if (uint8(_curveMode) > 2) revert InvalidCurveMode();

        feeBps    = _feeBps;
        curveBeta = _curveBeta;
        curveMode = _curveMode;

        emit ParametersUpdated(_feeBps, _curveBeta, _curveMode, _agent);
    }

    // ── Internal: Curve application ─────────────────────────────────────

    /**
     * @notice Apply curve-mode adjustments to the effective input amount.
     *
     *   Normal:             effectiveIn = amountIn  (no change)
     *   Defensive:          effectiveIn = amountIn * (1 + beta * W²)
     *                       where W = amountIn / reserveIn  (whale ratio)
     *   VolatilityAdaptive: effectiveIn = amountIn * (1 + beta * amountIn / reserveIn)
     *                       (linear scaling with trade-size-to-depth ratio)
     *
     * @dev In Defensive mode a large trade gets penalised quadratically,
     *      discouraging whale-sized dumps.
     */
    function _applyCurve(
        uint256 amountIn,
        bool zeroForOne
    ) internal view returns (uint256 effectiveIn) {
        if (curveMode == CurveMode.Normal) {
            return amountIn;
        }

        uint256 reserveIn = zeroForOne ? reserve0 : reserve1;

        if (curveMode == CurveMode.Defensive) {
            // W = amountIn / reserveIn  (scaled 1e18 for precision)
            // penalty = beta * W^2  (beta is scaled 1e4)
            // effectiveIn = amountIn * (1 + penalty / 1e4)
            uint256 w = (amountIn * 1e18) / reserveIn;        // W scaled 1e18
            uint256 wSquared = (w * w) / 1e18;                 // W² scaled 1e18
            uint256 penalty = (curveBeta * wSquared) / 1e18;   // scaled 1e4
            effectiveIn = amountIn + (amountIn * penalty) / BETA_SCALE;
        } else {
            // VolatilityAdaptive: linear penalty
            // effectiveIn = amountIn * (1 + beta * amountIn / reserveIn / BETA_SCALE)
            uint256 ratio = (amountIn * BETA_SCALE) / reserveIn;
            uint256 penalty = (curveBeta * ratio) / (BETA_SCALE * BETA_SCALE);
            effectiveIn = amountIn + (amountIn * penalty) / BETA_SCALE;
        }
    }

    // ── Util ────────────────────────────────────────────────────────────

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
