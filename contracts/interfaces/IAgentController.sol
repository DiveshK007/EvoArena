// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IAgentController
 * @notice Interface for the EvoArena agent controller
 */
interface IAgentController {
    struct AgentInfo {
        address agentAddress;
        uint256 bondAmount;
        uint256 registeredAt;
        uint256 lastUpdateTime;
        bool active;
    }

    struct ParameterUpdate {
        uint256 newFeeBps;
        uint256 newCurveBeta;
        uint8 newCurveMode;
        uint256 timestamp;
    }

    event AgentRegistered(address indexed agent, uint256 bondAmount);
    event AgentDeregistered(address indexed agent, uint256 bondReturned);
    event AgentSlashed(address indexed agent, uint256 slashAmount, string reason);
    event BondTopUp(address indexed agent, uint256 amount, uint256 newTotal);
    event AgentUpdateProposed(
        address indexed agent,
        uint256 newFeeBps,
        uint256 newCurveBeta,
        uint8 newCurveMode,
        uint256 timestamp
    );

    function registerAgent() external payable;
    function deregisterAgent() external;
    function topUpBond() external payable;
    function submitParameterUpdate(
        uint256 newFeeBps,
        uint256 newCurveBeta,
        uint8 newCurveMode
    ) external;
    function slashAgent(address agent, uint256 amount, string calldata reason) external;
    function getAgentInfo(address agent) external view returns (AgentInfo memory);
}
