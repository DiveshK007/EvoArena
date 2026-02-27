# EvoArena — Gas Report

Generated with `REPORT_GAS=true npx hardhat test` against Hardhat 2.22+ (Solidity ^0.8.24, optimizer 200 runs).

## Core Operations

| Contract | Method | Min Gas | Max Gas | Avg Gas |
|----------|--------|---------|---------|---------|
| **EvoPool** | swap | 109,141 | 217,434 | **174,773** |
| **EvoPool** | addLiquidity | 108,677 | 247,024 | **234,337** |
| **EvoPool** | removeLiquidity | 92,699 | 148,787 | **133,565** |
| **EvoPool** | updateParameters | 56,374 | 61,974 | **59,734** |
| **EvoPool** | collectProtocolFees | — | — | **45,977** |
| **EvoPool** | setProtocolFee | — | — | **45,863** |
| **EvoPool** | pause | — | — | **45,564** |
| **EvoPool** | unpause | — | — | **23,702** |
| **AgentController** | registerAgent | 72,655 | 89,767 | **84,741** |
| **AgentController** | submitParameterUpdate | 63,012 | 145,024 | **117,428** |
| **AgentController** | slashAgent | — | — | ~60,000 |
| **AgentController** | depositTokenBond | — | — | ~55,000 |
| **AgentController** | withdrawTokenBond | — | — | **41,386** |
| **EpochManager** | submitProposal | 223,681 | 294,893 | **259,603** |
| **EpochManager** | finalizeEpoch | 328,434 | 410,452 | **383,017** |
| **EpochManager** | claimReward | — | — | **61,788** |
| **TimeLock** | queueTransaction | — | — | **55,268** |
| **TimeLock** | executeTransaction | — | — | **42,307** |
| **TimeLock** | cancelTransaction | — | — | **28,222** |

## Deployment Costs

| Contract | Gas | % of Block Limit |
|----------|-----|------------------|
| EvoPool | 2,444,553 | 4.1% |
| EpochManager | 1,755,959 | 2.9% |
| AgentController | 1,402,806 | 2.3% |
| TimeLock | 687,535 | 1.1% |
| EvoToken | 676,716 | 1.1% |
| **Total deployment** | **~6,967,569** | **~11.5%** |

## BSC Cost Estimates

At BSC gas price of ~3 Gwei and BNB = $600:

| Operation | Gas | Cost (BNB) | Cost (USD) |
|-----------|-----|-----------|------------|
| Swap | 174,773 | 0.000524 | **$0.31** |
| Add Liquidity | 234,337 | 0.000703 | **$0.42** |
| Remove Liquidity | 133,565 | 0.000401 | **$0.24** |
| Agent Parameter Update | 117,428 | 0.000352 | **$0.21** |
| Agent Registration | 84,741 | 0.000254 | **$0.15** |
| Submit Proposal | 259,603 | 0.000779 | **$0.47** |
| Finalize Epoch | 383,017 | 0.001149 | **$0.69** |

## Analysis

- **Swap cost (174K gas)** is competitive with Uniswap V2 (~150K) considering the extra adaptive curve logic, TWAP update, whale detection, and volume tracking.
- **addLiquidity (234K gas)** includes ERC-20 LP token minting and dual-token balance-diff accounting.
- **submitParameterUpdate (117K gas)** is well within a single-tx budget for an AI agent operating every 5 minutes.
- **finalizeEpoch (383K gas)** is the most expensive operation but is called once per epoch (typically hourly).
- All deployments fit in a single block with room to spare (11.5% total of 60M gas limit).
