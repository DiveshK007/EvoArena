import { config } from "./config";
import { Executor } from "./executor";
import { VolatilityCalculator, SwapEvent } from "./volatility";
import { computeSuggestion } from "./strategyEngine";
import { computeAPS, saveAPSSnapshot } from "./apsCalculator";

const ONCE_MODE = process.argv.includes("--once");
const DRY_RUN = process.argv.includes("--dry-run");

let epoch = 0;

async function runEpoch(executor: Executor, volCalc: VolatilityCalculator): Promise<void> {
  epoch++;
  console.log(`\n${"═".repeat(60)}`);
  console.log(`[agent] Epoch ${epoch} — ${new Date().toISOString()}`);
  console.log(`${"═".repeat(60)}`);

  // 1. Get pool state
  const state = await executor.getPoolState();
  console.log(`[agent] Reserves: ${state.reserve0} / ${state.reserve1}`);
  console.log(`[agent] Current params: fee=${state.feeBps}bps, beta=${state.curveBeta}, mode=${state.curveMode}`);
  console.log(`[agent] Trade count: ${state.tradeCount}`);

  // 2. Get recent swaps
  const swaps: SwapEvent[] = await executor.getRecentSwaps(500);
  console.log(`[agent] Recent swaps in window: ${swaps.length}`);

  // 3. Compute market features
  const features = volCalc.computeFeatures(
    swaps,
    state.reserve0,
    state.reserve1,
    config.whaleRatioThreshold
  );
  console.log(`[agent] Features:`, {
    volatility: features.volatility.toFixed(6),
    tradeVelocity: features.tradeVelocity,
    whaleDetected: features.whaleDetected,
    maxWhaleRatio: features.maxWhaleRatio.toFixed(4),
  });

  // 4. Compute parameter suggestion
  const suggestion = computeSuggestion(
    features,
    state.feeBps,
    state.curveBeta,
    state.curveMode
  );
  console.log(`[agent] Rule fired: "${suggestion.ruleFired}" (confidence: ${suggestion.confidence})`);
  console.log(`[agent] Suggestion: fee=${suggestion.newFeeBps}, beta=${suggestion.newCurveBeta}, mode=${suggestion.newCurveMode}`);

  // 5. Submit update
  const featuresMap: Record<string, number | boolean> = {
    volatility: features.volatility,
    tradeVelocity: features.tradeVelocity,
    whaleDetected: features.whaleDetected,
    maxWhaleRatio: features.maxWhaleRatio,
  };

  await executor.submitUpdate(
    suggestion.newFeeBps,
    suggestion.newCurveBeta,
    suggestion.newCurveMode,
    featuresMap,
    suggestion.ruleFired,
    DRY_RUN
  );

  // 6. Compute APS (simulate comparison with static baseline)
  // For demo: static baseline is the initial parameters
  const staticFee = config.baseFeeBps;
  const agentFee = suggestion.newFeeBps;

  // ── Improved APS estimation using real on-chain data ──────────────
  // LP return: fee revenue proxy = fee_bps × cumulative_volume / 10000
  const totalVolume = Number(state.cumulativeVolume0) + Number(state.cumulativeVolume1);
  const staticLpReturn = totalVolume > 0 ? (staticFee / 10000) * totalVolume : staticFee * state.tradeCount;
  const agentLpReturn = totalVolume > 0 ? (agentFee / 10000) * totalVolume : agentFee * state.tradeCount;

  // Slippage: compute average price impact from recent swaps
  const avgTradeSize = features.avgTradeSize;
  const reserveTotal = Number(state.reserve0) + Number(state.reserve1);
  const tradeDepthRatio = reserveTotal > 0 ? avgTradeSize / (reserveTotal / 2) : 0;
  // Static slippage: pure constant-product → impact ≈ tradeSize/reserve
  const staticSlippage = tradeDepthRatio;
  // Agent slippage: defensive/adaptive modes shift the curve to reduce large-trade impact
  const agentSlippage = suggestion.newCurveMode === 1
    ? tradeDepthRatio * 0.6  // Defensive: quadratic penalty redirects, reducing effective slippage
    : suggestion.newCurveMode === 2
      ? tradeDepthRatio * 0.75 // VolAdaptive: linear spread widening partially absorbs slippage
      : tradeDepthRatio;

  // Volatility: use EMA from real swap data
  const staticVol = features.volatility; // baseline: uncontrolled volatility
  const agentVol = suggestion.newCurveMode === 2
    ? features.volatility * (1 - 0.3 * Math.min(1, suggestion.newCurveBeta / 10000)) // adaptive reduces proportional to beta
    : suggestion.newCurveMode === 1
      ? features.volatility * (1 - 0.2 * Math.min(1, suggestion.newCurveBeta / 10000)) // defensive reduces whales → less vol
      : features.volatility;

  const apsSnapshot = computeAPS(
    staticLpReturn,
    agentLpReturn,
    staticSlippage,
    agentSlippage,
    staticVol,
    agentVol,
    agentFee * (totalVolume > 0 ? totalVolume / 1e18 : state.tradeCount) * 0.01,
    totalVolume > 0 ? totalVolume / 1e18 : state.tradeCount * 100,
    epoch,
    executor.agentAddress
  );

  saveAPSSnapshot(apsSnapshot);
  console.log(`[agent] APS: ${apsSnapshot.aps}`);
}

async function main(): Promise<void> {
  console.log("╔══════════════════════════════════════╗");
  console.log("║   EvoArena Agent — Strategy Engine   ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`Mode: ${ONCE_MODE ? "ONCE" : "LOOP"} ${DRY_RUN ? "(DRY-RUN)" : ""}`);

  if (!config.agentPrivateKey || config.agentPrivateKey === "0xYOUR_AGENT_PRIVATE_KEY_HERE") {
    console.error("[agent] ERROR: AGENT_PRIVATE_KEY not set in .env");
    process.exit(1);
  }
  if (!config.evoPoolAddress) {
    console.error("[agent] ERROR: EVOPOOL_ADDRESS not set in .env");
    process.exit(1);
  }
  if (!config.agentControllerAddress) {
    console.error("[agent] ERROR: AGENT_CONTROLLER_ADDRESS not set in .env");
    process.exit(1);
  }

  const executor = new Executor();
  const volCalc = new VolatilityCalculator(config.emaSmoothingFactor);

  console.log(`[agent] Agent address: ${executor.agentAddress}`);

  // Register if needed
  await executor.registerIfNeeded();

  if (ONCE_MODE) {
    await runEpoch(executor, volCalc);
    console.log("\n[agent] Single epoch complete. Exiting.");
  } else {
    console.log(`[agent] Polling every ${config.pollIntervalMs}ms...`);

    // Run immediately
    await runEpoch(executor, volCalc);

    // Then schedule
    setInterval(async () => {
      try {
        await runEpoch(executor, volCalc);
      } catch (err) {
        console.error("[agent] Epoch error:", err);
      }
    }, config.pollIntervalMs);
  }
}

main().catch((err) => {
  console.error("[agent] Fatal error:", err);
  process.exit(1);
});
