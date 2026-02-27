// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IAgentController.sol";
import "./interfaces/IEvoPool.sol";
import "./EvoPool.sol";

/**
 * @title AgentController
 * @author EvoArena Protocol
 * @notice Manages agent registration, bonding, cooldown enforcement,
 *         parameter-delta limits, and slashing. Agents submit parameter
 *         updates which are validated and then forwarded to the EvoPool.
 *
 *  Security invariants enforced on-chain:
 *    - |ΔfeeBps|     ≤ maxFeeDelta   per update
 *    - |ΔcurveBeta|  ≤ maxBetaDelta  per update
 *    - cooldown      ≥ cooldownSeconds between updates
 *    - agent bond    ≥ minBond
 *    - feeBps        ≤ MAX_FEE_BPS (500 bps = 5 %)
 *    - curveMode     ∈ {0, 1, 2}
 */
contract AgentController is IAgentController, ReentrancyGuard, Ownable {

    // ── Linked pool ─────────────────────────────────────────────────────
    EvoPool public pool;

    // ── Governance-configurable bounds ──────────────────────────────────
    uint256 public minBond;            // wei
    uint256 public cooldownSeconds;    // seconds between updates
    uint256 public maxFeeDelta;        // max |Δfee| per update in bps
    uint256 public maxBetaDelta;       // max |ΔcurveBeta| per update (1e4 scaled)
    uint256 public constant MAX_FEE_BPS = 500; // 5 %

    // ── Agent state ─────────────────────────────────────────────────────
    mapping(address => AgentInfo) private agents;
    address[] public agentList;

    // ── Pause ───────────────────────────────────────────────────────────
    bool public paused;

    // ── Errors ──────────────────────────────────────────────────────────
    error NotRegistered();
    error AlreadyRegistered();
    error BondTooLow();
    error CooldownActive();
    error DeltaExceedsLimit();
    error FeeTooHigh();
    error InvalidCurveMode();
    error Paused();
    error InsufficientSlashAmount();
    error TransferFailed();

    modifier whenNotPaused() {
        if (paused) revert Paused();
        _;
    }

    modifier onlyRegistered() {
        if (!agents[msg.sender].active) revert NotRegistered();
        _;
    }

    constructor(
        address _pool,
        uint256 _minBond,
        uint256 _cooldownSeconds,
        uint256 _maxFeeDelta,
        uint256 _maxBetaDelta,
        address _owner
    ) Ownable(_owner) {
        pool = EvoPool(_pool);
        minBond = _minBond;
        cooldownSeconds = _cooldownSeconds;
        maxFeeDelta = _maxFeeDelta;
        maxBetaDelta = _maxBetaDelta;
    }

    // ── Admin ───────────────────────────────────────────────────────────

    function pause() external onlyOwner { paused = true; }
    function unpause() external onlyOwner { paused = false; }

    function setMinBond(uint256 _v) external onlyOwner { minBond = _v; }
    function setCooldown(uint256 _v) external onlyOwner { cooldownSeconds = _v; }
    function setMaxFeeDelta(uint256 _v) external onlyOwner { maxFeeDelta = _v; }
    function setMaxBetaDelta(uint256 _v) external onlyOwner { maxBetaDelta = _v; }

    // ── Agent Registration ──────────────────────────────────────────────

    /**
     * @notice Register as an agent by staking a bond in native BNB.
     */
    function registerAgent() external payable override nonReentrant whenNotPaused {
        if (agents[msg.sender].active) revert AlreadyRegistered();
        if (msg.value < minBond) revert BondTooLow();

        agents[msg.sender] = AgentInfo({
            agentAddress: msg.sender,
            bondAmount: msg.value,
            registeredAt: block.timestamp,
            lastUpdateTime: 0,
            active: true
        });

        agentList.push(msg.sender);

        emit AgentRegistered(msg.sender, msg.value);
    }

    // ── Parameter Submission ────────────────────────────────────────────

    /**
     * @notice Submit a parameter update for the linked EvoPool.
     *         Validates delta limits, cooldown, and absolute caps.
     */
    function submitParameterUpdate(
        uint256 newFeeBps,
        uint256 newCurveBeta,
        uint8 newCurveMode
    ) external override nonReentrant whenNotPaused onlyRegistered {
        AgentInfo storage agent = agents[msg.sender];

        // ── Cooldown check ──────────────────────────────────────────────
        if (
            agent.lastUpdateTime != 0 &&
            block.timestamp < agent.lastUpdateTime + cooldownSeconds
        ) revert CooldownActive();

        // ── Absolute caps ───────────────────────────────────────────────
        if (newFeeBps > MAX_FEE_BPS) revert FeeTooHigh();
        if (newCurveMode > 2) revert InvalidCurveMode();

        // ── Delta checks ────────────────────────────────────────────────
        uint256 currentFee  = pool.feeBps();
        uint256 currentBeta = pool.curveBeta();

        uint256 feeDiff  = newFeeBps > currentFee
            ? newFeeBps - currentFee
            : currentFee - newFeeBps;
        uint256 betaDiff = newCurveBeta > currentBeta
            ? newCurveBeta - currentBeta
            : currentBeta - newCurveBeta;

        if (feeDiff > maxFeeDelta) revert DeltaExceedsLimit();
        if (betaDiff > maxBetaDelta) revert DeltaExceedsLimit();

        // ── Apply ───────────────────────────────────────────────────────
        agent.lastUpdateTime = block.timestamp;

        pool.updateParameters(
            newFeeBps,
            newCurveBeta,
            IEvoPool.CurveMode(newCurveMode),
            msg.sender
        );

        emit AgentUpdateProposed(
            msg.sender,
            newFeeBps,
            newCurveBeta,
            newCurveMode,
            block.timestamp
        );
    }

    // ── Slashing ────────────────────────────────────────────────────────

    /**
     * @notice Slash an agent's bond. Owner-only for hackathon (guardian).
     */
    function slashAgent(
        address agent,
        uint256 amount,
        string calldata reason
    ) external override onlyOwner nonReentrant {
        AgentInfo storage info = agents[agent];
        if (!info.active) revert NotRegistered();
        if (amount > info.bondAmount) revert InsufficientSlashAmount();

        info.bondAmount -= amount;

        // Transfer slashed funds to owner (treasury)
        (bool ok, ) = owner().call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit AgentSlashed(agent, amount, reason);
    }

    // ── Views ───────────────────────────────────────────────────────────

    function getAgentInfo(address agent) external view override returns (AgentInfo memory) {
        return agents[agent];
    }

    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    // Allow contract to receive BNB (bond top-ups, etc.)
    receive() external payable {}
}
