// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IEvoPool
 * @notice Interface for the EvoArena adaptive AMM pool
 */
interface IEvoPool {
    enum CurveMode {
        Normal,           // Standard constant-product
        Defensive,        // Convex whale-defense (price impact ∝ trade²)
        VolatilityAdaptive // Dynamic fee widening based on σ
    }

    event Swap(
        address indexed sender,
        bool zeroForOne,
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeAmount
    );
    event LiquidityAdded(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 amount0, uint256 amount1, uint256 liquidity);
    event ParametersUpdated(uint256 newFeeBps, uint256 newCurveBeta, CurveMode newMode, address indexed agent);

    function getReserves() external view returns (uint256 reserve0, uint256 reserve1);
    function swap(bool zeroForOne, uint256 amountIn, uint256 minAmountOut) external returns (uint256 amountOut);
    function addLiquidity(uint256 amount0, uint256 amount1) external returns (uint256 liquidity);
    function removeLiquidity(uint256 liquidity) external returns (uint256 amount0, uint256 amount1);
    function feeBps() external view returns (uint256);
    function curveBeta() external view returns (uint256);
    function curveMode() external view returns (CurveMode);
}
