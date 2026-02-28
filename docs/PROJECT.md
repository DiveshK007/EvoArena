# EvoArena — Project Overview

## Problem

Traditional AMMs (Uniswap v2, PancakeSwap) use **static parameters** set at deployment:
- **Fixed fees** (e.g., 0.3%) regardless of market conditions
- **Static bonding curves** that don't adapt to volatility
- **No whale protection** — large trades cause massive slippage for everyone
- **Governance is slow** — parameter changes require DAO votes taking weeks/months

This leads to:
- **Impermanent loss** for LPs during volatile periods
- **Capital inefficiency** — fees are too high in calm markets, too low in volatile ones
- **MEV extraction** — no defense against sandwich attacks or front-running

## Solution

EvoArena introduces an **AI agent marketplace** where autonomous agents compete to control AMM parameters in real-time:

1. **Dynamic Fees**: Agents adjust swap fees based on volatility, trade velocity, and whale activity
2. **Adaptive Curves**: Three curve modes (Normal, Defensive, VolatilityAdaptive) selected by agents
3. **Competitive Incentives**: Agents stake bonds, compete in epochs, and earn rewards for performance
4. **On-chain Safety**: All parameter changes are bounded, rate-limited, and slashable
5. **Transparent Audit**: Every agent decision is logged to BNB Greenfield decentralized storage

## Impact

| Metric | Static AMM | EvoArena |
|--------|-----------|----------|
| Fee adjustment speed | Weeks (DAO vote) | Seconds (agent update) |
| Whale protection | None | Quadratic penalty curve |
| LP return optimization | Manual | AI-driven, continuous |
| Transparency | Etherscan only | Greenfield audit trail |
| Parameter governance | Centralized | Competitive marketplace |

## Business Model

| Revenue Stream | Description |
|---|---|
| **Protocol Fee** | Up to 20% of swap fees accrues to protocol treasury |
| **Agent Bonds** | Staked tBNB as slashable collateral — aligns agent incentives |
| **Epoch Rewards** | Top agents earn BNB rewards, creating a competitive market |
| **LP Fees** | LPs earn trading fees proportional to their share |

## Target Users

| Segment | Pain Point | EvoArena Solution |
|---|---|---|
| **DeFi LPs** | Impermanent loss in volatile markets | AI-optimized fees maximize LP returns |
| **DEX Protocols** | Slow governance for parameter changes | Real-time agent competition |
| **Quant Teams** | No permissionless strategy deployment | Register agent, post bond, compete |
| **BNB Ecosystem** | Lacks innovative AMM infrastructure | First AI-driven adaptive AMM on BNB Chain |

## Limitations & Future Work

- **Agent quality**: Current ML model uses simple linear regression — production would need LSTM/transformer models
- **Single pool**: MVP supports one token pair — multi-pool support planned for Phase 2
- **Oracle dependency**: TWAP oracle is internal — integration with Chainlink or Band Protocol would improve price accuracy
- **Gas costs**: Agent updates require on-chain transactions — opBNB L2 integration planned for Phase 3
- **Audit**: Smart contracts have 95%+ test coverage but have not undergone a professional security audit yet

## Roadmap

### Phase 1 — Hackathon MVP ✅ (Current)
- Adaptive AMM with 3 curve modes
- Agent registry with bonding, cooldown, slashing
- Epoch-based multi-agent competition
- Governance timelock
- Off-chain ML + rule-based agent
- Next.js frontend (7 pages)
- BNB Greenfield integration
- 152 tests, 95%+ coverage
- BSC Testnet deployment (6 verified contracts)
- Docker one-command setup

### Phase 2 — Mainnet (Q2 2026)
- Professional audit (CertiK / PeckShield)
- BSC Mainnet deployment
- Multi-pool support (any ERC-20 pair)
- The Graph subgraph deployment
- Agent SDK npm package

### Phase 3 — Ecosystem Growth (Q3 2026)
- Agent marketplace
- LP vault aggregator
- opBNB L2 integration
- Cross-chain expansion
- Mobile app

### Phase 4 — Decentralized Governance (Q4 2026)
- EVO governance token
- DAO-controlled parameters
- Community agent bounties
- Insurance fund for LP protection
- Partnership integrations (PancakeSwap, Venus, Alpaca Finance)
