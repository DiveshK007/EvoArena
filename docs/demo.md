# EvoArena Demo Script

## Prerequisites

- Node.js ≥ 18
- BSC Testnet wallet with tBNB (use [BNB Faucet](https://testnet.bnbchain.org/faucet-smart))
- BscScan API key (for verification)

## Quick Demo (Local Hardhat)

```bash
# 1. Install deps
npm install

# 2. Run all contract tests
npx hardhat test

# 3. Deploy locally
npx hardhat run scripts/deploy.ts

# 4. Check deployment.json for addresses
cat deployment.json
```

## Full Testnet Demo

### Step 1: Deploy to BSC Testnet

```bash
# Set up .env
cp .env.example .env
# Edit .env: add PRIVATE_KEY, BSC_TESTNET_RPC, BSCSCAN_API_KEY

# Deploy
npx hardhat run scripts/deploy.ts --network bscTestnet

# Verify on BscScan
npx hardhat run scripts/verify.ts --network bscTestnet
```

### Step 2: Configure Agent

```bash
cd agent
cp .env.example .env
# Edit .env:
#   AGENT_PRIVATE_KEY=<your agent wallet key>
#   EVOPOOL_ADDRESS=<from deployment.json>
#   AGENT_CONTROLLER_ADDRESS=<from deployment.json>

npm install
```

### Step 3: Run Agent (Single Epoch)

```bash
# Dry-run first (no transaction)
npm run dev:once -- --dry-run

# Live run (submits tx to testnet)
npm run dev:once
```

### Step 4: Start Frontend

```bash
cd ../frontend
cp .env.example .env.local
# Edit .env.local with addresses from deployment.json

npm install
npm run dev
# Open http://localhost:3000
```

### Step 5: Verify Results

1. Check BscScan for the `AgentUpdateProposed` event
2. Check frontend Pool page — fee/mode should reflect the update
3. Check `agent/updates/` for JSON summary files
4. Check `agent/state/aps.json` for APS snapshot

## Demo Narration (2–3 minutes)

### Opening (30s)
> "Every AMM on BNB is static. Fees don't adapt. Curves don't react. Whales nuke pools. EvoArena fixes this with autonomous AI agents that control liquidity parameters in real-time."

### Show Architecture (30s)
> "Here's our stack: EvoPool is the AMM with 3 curve modes — Normal, Defensive, and VolatilityAdaptive. AgentController enforces bounds, cooldowns, and slashing. Our off-chain agent computes volatility, detects whales, and submits bounded parameter updates."

### Live Demo (60s)
1. Show pool state on dashboard (fee=30bps, mode=Normal)
2. Click "Run Demo Epoch" on demo panel
3. Show agent log output — rule fired, params suggested
4. Show updated pool state — fee changed, mode switched
5. Show BscScan tx link

### Comparison (30s)
> "Static AMM: fixed 30bps fee, no whale defense, slippage spikes. EvoPool: dynamic fees up to 50bps during volatility, Defensive mode quadratically penalizes whale trades, VolatilityAdaptive widens spreads to protect LPs."

### Close (30s)
> "EvoArena turns liquidity into a competitive AI marketplace. Capital flows to performance. Weak strategies die. Strong ones dominate. This is the future of AMMs on BNB."

## Expected Transaction Hashes

After running the demo, transaction hashes will be in:
- `deployment.json` — contract deployments
- `agent/updates/*.json` — parameter update summaries
- Frontend demo log — visible on demo panel
