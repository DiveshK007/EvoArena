# EvoArena — Adaptive AI-Driven Liquidity Infrastructure for BNB Chain

> A permissionless AI agent marketplace where autonomous agents compete to control AMM parameters, dynamically reshaping bonding curves, fees, and liquidity — outperforming static AMMs in capital efficiency and volatility control.

## 🏗 Architecture

```
┌────────────────────────────┐
│        Frontend UI         │  Next.js dashboard
└─────────────▲──────────────┘
              │
┌─────────────┴──────────────┐
│      Off-Chain Agent       │  Node.js strategy engine
│  (Volatility · Whale · Fee)│
└─────────────▲──────────────┘
              │  signed tx
┌─────────────┴──────────────┐
│    AgentController.sol     │  Bounds · Cooldown · Slash
└─────────────▲──────────────┘
              │
┌─────────────┴──────────────┐
│     EvoPool.sol (AMM)      │  Dynamic curve · Fee · Mode
└────────────────────────────┘
```

## 📦 Repository Structure

```
contracts/          Solidity smart contracts (Hardhat)
  EvoPool.sol       Adaptive AMM with 3 curve modes
  AgentController.sol  Agent registry, bounds, cooldown, slashing
  EvoToken.sol      Minimal ERC-20 for protocol coordination
  interfaces/       Contract interfaces
scripts/            Deploy & verification scripts
test/               Contract unit tests (Mocha + Chai)
agent/              Off-chain Node.js agent
  src/              Strategy engine, volatility, APS calculator
  state/            APS snapshots & update logs
  updates/          JSON summaries per parameter update
frontend/           Next.js dashboard
docs/               Architecture, demo script, agent spec
```

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- BSC Testnet (Chapel) RPC + funded wallet

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in PRIVATE_KEY, BSC_TESTNET_RPC, BSCSCAN_API_KEY
```

### 3. Compile contracts
```bash
npx hardhat compile
```

### 4. Run tests
```bash
npx hardhat test
```

### 5. Deploy to BSC Testnet
```bash
npx hardhat run scripts/deploy.ts --network bscTestnet
```

### 6. Run the agent (single epoch)
```bash
cd agent && npm install && npm run once
```

### 7. Start frontend
```bash
cd frontend && npm install && npm run dev
```

### 8. Full demo
```bash
./demo.sh
```

## 📊 APS (Agent Performance Score)

Each epoch the agent computes:

| Component | Weight | Formula |
|-----------|--------|---------|
| LP Return Δ | 0.40 | `(lpReturn_agent - lpReturn_static) / lpReturn_static` |
| Slippage Reduction | 0.30 | `1 - (avgSlippage_agent / avgSlippage_static)` |
| Volatility Compression | 0.20 | `(σ_static - σ_agent) / σ_static` |
| Fee Revenue | 0.10 | `feeRevenue_agent / totalVolume` |

```
APS = 0.4·LPΔ + 0.3·SlippageReduction + 0.2·VolatilityCompression + 0.1·FeeRevenue
```

## 🔐 Security Model

| Constraint | Default | Configurable |
|------------|---------|-------------|
| Max fee change per update | 50 bps | ✅ |
| Max curveBeta change | 2000 (0.2 scaled) | ✅ |
| Cooldown between updates | 5 minutes | ✅ |
| Minimum agent bond | 0.01 tBNB | ✅ |
| Max fee cap | 500 bps (5%) | ✅ |
| Emergency pause | Owner only | ✅ |

## 🔗 References

- [Optimal Dynamic Fees for AMMs](https://arxiv.org/abs/2106.14404)
- [Uniswap v3 Concentrated Liquidity](https://docs.uniswap.org/concepts/protocol/concentrated-liquidity)
- [Bancor IL Protection](https://docs.bancor.network/)
- [Autonomous AI Agents in DeFi](https://arxiv.org/abs/2312.08027)

## 📝 License

MIT — see [LICENSE](./LICENSE).
