#!/bin/bash
set -e

MODE="${1:-quick}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              EvoArena — One-Command Demo                    ║"
echo "║         Adaptive AMM with AI Agent Parameter Control        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$MODE" = "full" ]; then
  # ── Full mode: compile + test + live simulation ────────────────
  echo "▶ Step 1/4: Compile contracts"
  npx hardhat compile --quiet
  echo "✅ Compiled"
  echo ""

  echo "▶ Step 2/4: Run 128 unit tests"
  npx hardhat test
  echo ""

  echo "▶ Step 3/4: Live adaptive simulation"
  npx hardhat run scripts/demo-local.ts
  echo ""

  echo "▶ Step 4/4: Gas report"
  REPORT_GAS=true npx hardhat test --grep "should swap token0 for token1" 2>&1 | tail -40
  echo ""

elif [ "$MODE" = "quick" ]; then
  # ── Quick mode: just the live simulation ───────────────────────
  echo "▶ Running live adaptive simulation..."
  echo ""
  npx hardhat run scripts/demo-local.ts
  echo ""

elif [ "$MODE" = "test" ]; then
  # ── Test-only mode ─────────────────────────────────────────────
  npx hardhat test
  echo ""

else
  echo "Usage: ./demo.sh [quick|full|test]"
  echo ""
  echo "  quick  — Run live simulation only (default, ~5s)"
  echo "  full   — Compile + test + simulation + gas report (~30s)"
  echo "  test   — Run all 128 tests only"
  exit 1
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     Demo Complete! 🎉                       ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Next steps:                                                ║"
echo "║    • Start frontend:  cd frontend && npm run dev            ║"
echo "║    • Deploy testnet:  npx hardhat run scripts/deploy.ts \\   ║"
echo "║                       --network bscTestnet                  ║"
echo "║    • Run agent:       cd agent && npm run dev:once          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo "  3. Run agent live: cd agent && npm run dev:once"
echo "  4. Verify on BscScan: npx hardhat run scripts/verify.ts --network bscTestnet"
