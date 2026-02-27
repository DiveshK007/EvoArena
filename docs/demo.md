# EvoArena Demo Guide

## One-Command Demo

```bash
# Quick simulation (~5 seconds) — shows all adaptive features
./demo.sh

# Full demo: compile → 128 tests → live simulation → gas report
./demo.sh full

# Just run the tests
./demo.sh test
```

The demo script deploys all 4 contracts, seeds liquidity, executes trades, registers two competing AI agents, activates Defensive mode against a whale, runs an epoch competition, finalizes scoring, claims rewards, collects protocol fees, and demonstrates emergency pause — all in one command.

## What the Demo Shows

| Step | Feature | Before → After |
|------|---------|----------------|
| Normal Trading | Constant-product AMM baseline | 30 bps fee, Normal mode |
| Agent 1 Update | AI-driven fee adjustment | 30 → 50 bps (volatility detected) |
| Agent 2 Update | Defensive mode activation | 50 → 80 bps, Defensive curve |
| Whale Trade | Quadratic penalty | 12%+ price impact vs ~9% normal |
| Epoch Competition | 2 agents scored by APS | Winner's params auto-applied |
| Epoch Winner | Auto-apply best strategy | Fee → 45 bps, VolatilityAdaptive |
| Protocol Fees | Treasury collection | 10% of swap fees accumulated |
| Emergency Pause | Owner safety valve | Swaps blocked, LP exit allowed |

## Prerequisites

- Node.js ≥ 18
- `npm install` (root, agent, frontend)

## Local Demo (Hardhat)

```bash
npm install
npx hardhat run scripts/demo-local.ts   # same as ./demo.sh
```

## Full Testnet Demo (BSC Testnet)

### Step 1: Deploy to BSC Testnet

```bash
cp .env.example .env
# Edit .env: add PRIVATE_KEY, BSC_TESTNET_RPC, BSCSCAN_API_KEY

npx hardhat run scripts/deploy.ts --network bscTestnet
npx hardhat run scripts/verify.ts --network bscTestnet
```

### Step 2: Configure & Run Agent

```bash
cd agent
cp .env.example .env
# Edit: AGENT_PRIVATE_KEY, EVOPOOL_ADDRESS, AGENT_CONTROLLER_ADDRESS

npm install
npm run dev:once          # single epoch, live
```

### Step 3: Start Frontend

```bash
cd frontend
cp .env.example .env.local
# Add contract addresses from deployment.json

npm install && npm run dev
# Open http://localhost:3000
```

## Demo Narration Script (2–3 minutes)

### Opening (30s)
> "Every AMM on BNB is static — fees don't adapt, curves don't react, and whales nuke pools. EvoArena fixes this with autonomous AI agents that control liquidity parameters in real-time."

### Architecture (30s)
> "Our stack: EvoPool is the AMM with 3 curve modes — Normal, Defensive, and VolatilityAdaptive. AgentController enforces bounds, cooldowns, and slashing. The off-chain agent computes volatility, detects whales, and submits bounded parameter updates. EpochManager runs competitive epochs where agents' strategies are scored and the best one wins."

### Live Demo (60s)
1. Run `./demo.sh` — show the terminal output scrolling through all 11 steps
2. Point out fee changing from 30 → 50 → 80 → 45 bps
3. Show whale trade penalty: 12% price impact in Defensive mode
4. Show epoch winner auto-applied to pool
5. Show emergency pause blocking swaps but allowing LP exit

### Comparison (30s)
> "Static AMM: fixed 30bps, no whale defense, slippage spikes. EvoPool: dynamic fees, Defensive mode quadratically penalizes whales, VolatilityAdaptive widens spreads to protect LPs. Capital efficiency improves because the pool literally learns."

### Close (30s)
> "EvoArena turns liquidity into a competitive AI marketplace. Capital flows to performance. Weak strategies get outcompeted. This is the future of AMMs on BNB Chain."
