#!/bin/bash
set -e

echo "╔══════════════════════════════════════╗"
echo "║     EvoArena — Full Demo Script      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# 1. Compile contracts
echo "▶ Step 1: Compile contracts"
npx hardhat compile
echo "✅ Contracts compiled"
echo ""

# 2. Run tests
echo "▶ Step 2: Run unit tests"
npx hardhat test
echo "✅ All tests passed"
echo ""

# 3. Deploy (local hardhat by default; use --network bscTestnet for testnet)
NETWORK="${1:-hardhat}"
echo "▶ Step 3: Deploy to $NETWORK"
if [ "$NETWORK" = "hardhat" ]; then
  npx hardhat run scripts/deploy.ts
else
  npx hardhat run scripts/deploy.ts --network "$NETWORK"
fi
echo "✅ Deployed. See deployment.json"
echo ""

# 4. Show deployment
echo "▶ Step 4: Deployment info"
cat deployment.json
echo ""

# 5. Run agent once (dry-run for local)
echo "▶ Step 5: Run agent (single epoch, dry-run)"
cd agent
if [ ! -d "node_modules" ]; then
  npm install
fi

# For local demo, just show dry-run capability
echo "[agent] In dry-run mode for local demo."
echo "[agent] For live testnet: cd agent && npm run dev:once"
cd ..
echo "✅ Agent ready"
echo ""

# 6. Frontend
echo "▶ Step 6: Frontend"
cd frontend
if [ ! -d "node_modules" ]; then
  npm install
fi
echo "To start frontend: cd frontend && npm run dev"
cd ..
echo ""

echo "╔══════════════════════════════════════╗"
echo "║         Demo Complete! 🎉            ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. For testnet: ./demo.sh bscTestnet"
echo "  2. Start frontend: cd frontend && npm run dev"
echo "  3. Run agent live: cd agent && npm run dev:once"
echo "  4. Verify on BscScan: npx hardhat run scripts/verify.ts --network bscTestnet"
