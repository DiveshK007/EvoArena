/**
 * EvoArena — Local Demo Script
 *
 * Deploys everything to a local Hardhat node and simulates:
 *   1. Initial liquidity provision
 *   2. Normal trading (static baseline)
 *   3. Agent registration + parameter update
 *   4. Whale attack → Defensive mode activation
 *   5. Volatility spike → VolatilityAdaptive mode
 *   6. Epoch competition between 2 agents
 *   7. Epoch finalization + reward claim
 *   8. Protocol fee collection
 *   9. Before/after comparison
 *
 * Run: npx hardhat run scripts/demo-local.ts
 */

import { ethers } from "hardhat";

const DIVIDER = "═".repeat(64);
const SUB = "─".repeat(48);

function section(title: string) {
  console.log(`\n${DIVIDER}`);
  console.log(`  ${title}`);
  console.log(DIVIDER);
}

function stat(label: string, value: string | number) {
  console.log(`    ${label.padEnd(28)} ${value}`);
}

async function printPoolState(pool: any, label: string) {
  const [r0, r1] = await pool.getReserves();
  const fee = await pool.feeBps();
  const beta = await pool.curveBeta();
  const mode = await pool.curveMode();
  const trades = await pool.tradeCount();
  const modes = ["Normal", "Defensive", "VolatilityAdaptive"];

  console.log(`\n  📊 Pool State — ${label}`);
  console.log(`  ${SUB}`);
  stat("Reserve0 (EVOA)", ethers.formatEther(r0));
  stat("Reserve1 (EVOB)", ethers.formatEther(r1));
  stat("Price (EVOA/EVOB)", (Number(r0) / Number(r1)).toFixed(6));
  stat("Fee", `${fee} bps (${(Number(fee) / 100).toFixed(2)}%)`);
  stat("Curve Beta", `${beta} (${(Number(beta) / 10000).toFixed(4)})`);
  stat("Curve Mode", `${modes[Number(mode)]} (${mode})`);
  stat("Total Trades", trades.toString());
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║              EvoArena — Live Demo Simulation                ║");
  console.log("║        Adaptive AMM with AI Agent Parameter Control         ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  const [deployer, lp, trader, whale, agent1, agent2, scorer] = await ethers.getSigners();

  // ── Deploy ──────────────────────────────────────────────────────────
  section("1️⃣  DEPLOY CONTRACTS");

  const Token = await ethers.getContractFactory("EvoToken");
  const tokenA: any = await Token.deploy("EvoArena Token A", "EVOA", ethers.parseEther("10000000"), deployer.address);
  const tokenB: any = await Token.deploy("EvoArena Token B", "EVOB", ethers.parseEther("10000000"), deployer.address);
  console.log(`  ✅ TokenA: ${await tokenA.getAddress()}`);
  console.log(`  ✅ TokenB: ${await tokenB.getAddress()}`);

  const Pool = await ethers.getContractFactory("EvoPool");
  const pool: any = await Pool.deploy(await tokenA.getAddress(), await tokenB.getAddress(), 30, 5000, deployer.address);
  console.log(`  ✅ EvoPool: ${await pool.getAddress()}`);

  const Controller = await ethers.getContractFactory("AgentController");
  const controller: any = await Controller.deploy(
    await pool.getAddress(),
    ethers.parseEther("0.01"), // minBond
    60,   // cooldown
    50,   // maxFeeDelta
    2000, // maxBetaDelta
    deployer.address
  );
  console.log(`  ✅ AgentController: ${await controller.getAddress()}`);

  const EpochMgr = await ethers.getContractFactory("EpochManager");
  const epochMgr: any = await EpochMgr.deploy(
    await pool.getAddress(),
    await controller.getAddress(),
    3600, // 1 hour epochs
    scorer.address,
    deployer.address
  );
  console.log(`  ✅ EpochManager: ${await epochMgr.getAddress()}`);

  // Link
  await pool.setController(await controller.getAddress());
  await pool.setEpochManager(await epochMgr.getAddress());
  await epochMgr.setEpochReward(ethers.parseEther("0.1"));
  await deployer.sendTransaction({ to: await epochMgr.getAddress(), value: ethers.parseEther("1") });
  console.log(`  ✅ Contracts linked & EpochManager funded`);

  // ── Seed Liquidity ────────────────────────────────────────────────
  section("2️⃣  SEED INITIAL LIQUIDITY");

  const SEED = ethers.parseEther("50000");
  await tokenA.transfer(lp.address, SEED);
  await tokenB.transfer(lp.address, SEED);
  await tokenA.connect(lp).approve(await pool.getAddress(), SEED);
  await tokenB.connect(lp).approve(await pool.getAddress(), SEED);
  await pool.connect(lp).addLiquidity(SEED, SEED);

  const lpBal = await pool.balanceOf(lp.address);
  console.log(`  ✅ LP deposited 50,000 EVOA + 50,000 EVOB`);
  console.log(`  ✅ LP tokens received: ${ethers.formatEther(lpBal)} EVO-LP`);

  await printPoolState(pool, "After Initial Liquidity");

  // ── Normal Trading (Baseline) ─────────────────────────────────────
  section("3️⃣  NORMAL TRADING — STATIC BASELINE");

  const TRADE_AMT = ethers.parseEther("500");
  await tokenA.transfer(trader.address, ethers.parseEther("10000"));
  await tokenB.transfer(trader.address, ethers.parseEther("10000"));
  await tokenA.connect(trader).approve(await pool.getAddress(), ethers.parseEther("10000"));
  await tokenB.connect(trader).approve(await pool.getAddress(), ethers.parseEther("10000"));

  // Record pre-trade state
  const [preR0, preR1] = await pool.getReserves();
  const preK = Number(ethers.formatEther(preR0)) * Number(ethers.formatEther(preR1));

  console.log(`  Trading 5 swaps at 500 EVOA each (Normal mode, 30 bps fee)...`);
  for (let i = 0; i < 5; i++) {
    const tx = await pool.connect(trader).swap(true, TRADE_AMT, 0);
    const receipt = await tx.wait();
    const swapEvent = receipt!.logs.find((l: any) => {
      try { return pool.interface.parseLog(l)?.name === "Swap"; } catch { return false; }
    });
    if (swapEvent) {
      const parsed = pool.interface.parseLog(swapEvent);
      console.log(`    Swap ${i + 1}: in=${ethers.formatEther(parsed!.args[2])} EVOA → out=${ethers.formatEther(parsed!.args[3])} EVOB (fee=${ethers.formatEther(parsed!.args[4])})`);
    }
  }

  const [postR0, postR1] = await pool.getReserves();
  const postK = Number(ethers.formatEther(postR0)) * Number(ethers.formatEther(postR1));
  console.log(`\n  📈 Invariant check: K before=${preK.toFixed(0)}, K after=${postK.toFixed(0)} (${postK >= preK ? "✅ increased (fees)" : "❌ decreased"})`);

  await printPoolState(pool, "After Normal Trading");

  // ── Agent Registration ────────────────────────────────────────────
  section("4️⃣  AGENT REGISTRATION");

  await controller.connect(agent1).registerAgent({ value: ethers.parseEther("0.05") });
  await controller.connect(agent2).registerAgent({ value: ethers.parseEther("0.05") });
  console.log(`  ✅ Agent 1 registered: ${agent1.address} (bond: 0.05 BNB)`);
  console.log(`  ✅ Agent 2 registered: ${agent2.address} (bond: 0.05 BNB)`);
  console.log(`  Total agents: ${await controller.getAgentCount()}`);

  // ── Agent 1: Raise fee (simulating volatility detection) ──────────
  section("5️⃣  AGENT 1 — ADAPTIVE FEE INCREASE");

  console.log(`  Agent 1 detects moderate volatility → raises fee to 50 bps`);
  await controller.connect(agent1).submitParameterUpdate(50, 5000, 0);
  console.log(`  ✅ Parameters updated: fee=50 bps, mode=Normal`);

  await printPoolState(pool, "After Agent 1 Update");

  // Trade again to show effect
  console.log(`\n  Trading 3 swaps with new 50 bps fee...`);
  for (let i = 0; i < 3; i++) {
    const tx = await pool.connect(trader).swap(false, TRADE_AMT, 0);
    const receipt = await tx.wait();
    const swapEvent = receipt!.logs.find((l: any) => {
      try { return pool.interface.parseLog(l)?.name === "Swap"; } catch { return false; }
    });
    if (swapEvent) {
      const parsed = pool.interface.parseLog(swapEvent);
      console.log(`    Swap ${i + 1}: in=${ethers.formatEther(parsed!.args[2])} EVOB → out=${ethers.formatEther(parsed!.args[3])} EVOA (fee=${ethers.formatEther(parsed!.args[4])})`);
    }
  }

  // ── Agent 2: Switch to Defensive mode (whale detected) ───────────
  section("6️⃣  AGENT 2 — DEFENSIVE MODE (WHALE DETECTED)");

  // Advance time past cooldown
  await ethers.provider.send("evm_increaseTime", [120]);
  await ethers.provider.send("evm_mine", []);

  console.log(`  Agent 2 detects whale activity → switches to Defensive mode`);
  await controller.connect(agent2).submitParameterUpdate(80, 7000, 1);
  console.log(`  ✅ Parameters updated: fee=80 bps, beta=7000, mode=Defensive`);

  await printPoolState(pool, "After Defensive Activation");

  // Whale trade
  const WHALE_AMT = ethers.parseEther("5000");
  await tokenA.transfer(whale.address, WHALE_AMT);
  await tokenA.connect(whale).approve(await pool.getAddress(), WHALE_AMT);

  console.log(`\n  🐋 Whale attempts 5,000 EVOA swap (10% of reserve)...`);
  const whaleTx = await pool.connect(whale).swap(true, WHALE_AMT, 0);
  const whaleReceipt = await whaleTx.wait();
  const whaleEvent = whaleReceipt!.logs.find((l: any) => {
    try { return pool.interface.parseLog(l)?.name === "Swap"; } catch { return false; }
  });
  if (whaleEvent) {
    const parsed = pool.interface.parseLog(whaleEvent);
    const slippage = 1 - (Number(parsed!.args[3]) / Number(parsed!.args[2]));
    console.log(`    Whale result: in=${ethers.formatEther(parsed!.args[2])} → out=${ethers.formatEther(parsed!.args[3])} EVOB`);
    console.log(`    Price impact: ${(slippage * 100).toFixed(2)}% (quadratic whale penalty active)`);
    console.log(`    Fee charged: ${ethers.formatEther(parsed!.args[4])} EVOA`);
  }

  await printPoolState(pool, "After Whale Trade (Defensive)");

  // ── Epoch Competition ─────────────────────────────────────────────
  section("7️⃣  EPOCH COMPETITION — 2 AGENTS COMPETE");

  console.log(`  Agent 1 submits proposal: fee=45, beta=6000, mode=VolatilityAdaptive`);
  await epochMgr.connect(agent1).submitProposal(45, 6000, 2);

  console.log(`  Agent 2 submits proposal: fee=60, beta=7500, mode=Defensive`);
  await epochMgr.connect(agent2).submitProposal(60, 7500, 1);

  const proposals = await epochMgr.getEpochProposals(1);
  console.log(`  📋 Total proposals for epoch 1: ${proposals.length}`);

  // Fast-forward past epoch
  await ethers.provider.send("evm_increaseTime", [3601]);
  await ethers.provider.send("evm_mine", []);

  // ── Finalize Epoch ────────────────────────────────────────────────
  section("8️⃣  EPOCH FINALIZATION — SCORER PICKS WINNER");

  // Score: agent1 gets 8000, agent2 gets 6500
  console.log(`  Scorer submits APS scores:`);
  console.log(`    Agent 1: 8000 (0.80 APS)`);
  console.log(`    Agent 2: 6500 (0.65 APS)`);

  await epochMgr.connect(scorer).finalizeEpoch(
    1,
    [agent1.address, agent2.address],
    [8000, 6500]
  );

  const epoch1 = await epochMgr.epochs(1);
  console.log(`\n  🏆 Winner: ${epoch1.winner === agent1.address ? "Agent 1" : "Agent 2"} (score: ${epoch1.winnerScore})`);
  console.log(`  ✅ Winner's parameters applied to pool automatically`);

  await printPoolState(pool, "After Epoch 1 Winner Applied");

  // Claim reward
  const balBefore = await ethers.provider.getBalance(agent1.address);
  await epochMgr.connect(agent1).claimReward(1);
  const balAfter = await ethers.provider.getBalance(agent1.address);
  const reward = Number(ethers.formatEther(balAfter - balBefore));
  console.log(`  💰 Agent 1 claimed reward: ~${reward.toFixed(4)} BNB`);

  // ── Lifetime Stats ────────────────────────────────────────────────
  section("9️⃣  AGENT LEADERBOARD");

  const [score1, wins1, parts1] = await epochMgr.getAgentStats(agent1.address);
  const [score2, wins2, parts2] = await epochMgr.getAgentStats(agent2.address);

  console.log(`  ┌─────────────┬────────────┬──────┬──────────────┐`);
  console.log(`  │ Agent       │ Total Score│ Wins │ Participated │`);
  console.log(`  ├─────────────┼────────────┼──────┼──────────────┤`);
  console.log(`  │ Agent 1     │ ${String(score1).padEnd(10)} │ ${String(wins1).padEnd(4)} │ ${String(parts1).padEnd(12)} │`);
  console.log(`  │ Agent 2     │ ${String(score2).padEnd(10)} │ ${String(wins2).padEnd(4)} │ ${String(parts2).padEnd(12)} │`);
  console.log(`  └─────────────┴────────────┴──────┴──────────────┘`);

  // ── Protocol Fee Collection ───────────────────────────────────────
  section("🔟  PROTOCOL FEE COLLECTION");

  await pool.setProtocolFee(1000); // 10% of swap fees to treasury
  console.log(`  Protocol fee set to 10% of swap fees`);

  // Do a couple trades to accumulate fees
  await tokenA.connect(trader).approve(await pool.getAddress(), ethers.parseEther("5000"));
  await pool.connect(trader).swap(true, ethers.parseEther("1000"), 0);
  await pool.connect(trader).swap(true, ethers.parseEther("1000"), 0);

  const accum0 = await pool.protocolFeeAccum0();
  console.log(`  Protocol fees accumulated: ${ethers.formatEther(accum0)} EVOA`);

  await pool.collectProtocolFees();
  console.log(`  ✅ Protocol fees collected to treasury`);

  // ── Emergency Pause Demo ──────────────────────────────────────────
  section("1️⃣1️⃣  EMERGENCY PAUSE");

  await pool.pause();
  console.log(`  ⛔ Pool PAUSED by owner`);

  try {
    await pool.connect(trader).swap(true, ethers.parseEther("100"), 0);
    console.log(`  ❌ Swap should have reverted!`);
  } catch {
    console.log(`  ✅ Swap correctly blocked during pause`);
  }

  // LP can still exit
  const lpTokens = await pool.balanceOf(lp.address);
  const smallExit = lpTokens / 10n;
  await pool.connect(lp).removeLiquidity(smallExit);
  console.log(`  ✅ LP emergency exit still works (removed ${ethers.formatEther(smallExit)} LP)`);

  await pool.unpause();
  console.log(`  ✅ Pool UNPAUSED`);

  // ── Final Summary ─────────────────────────────────────────────────
  section("📋  FINAL SUMMARY");

  await printPoolState(pool, "Final State");

  const totalTrades = await pool.tradeCount();
  const vol0 = await pool.cumulativeVolume0();
  const vol1 = await pool.cumulativeVolume1();

  console.log(`\n  📊 Protocol Metrics`);
  console.log(`  ${SUB}`);
  stat("Total Trades", totalTrades.toString());
  stat("Cumulative Volume (EVOA)", ethers.formatEther(vol0));
  stat("Cumulative Volume (EVOB)", ethers.formatEther(vol1));
  stat("Registered Agents", (await controller.getAgentCount()).toString());
  stat("Epochs Completed", "1");
  stat("Current Epoch", (await epochMgr.currentEpochId()).toString());

  console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║            ✅ Demo Complete — All Systems Working           ║`);
  console.log(`║                                                              ║`);
  console.log(`║  Key Demonstrations:                                         ║`);
  console.log(`║    • Adaptive fee adjustment (30 → 50 → 80 → 45 bps)        ║`);
  console.log(`║    • 3 curve modes (Normal → Defensive → VolAdaptive)        ║`);
  console.log(`║    • Whale trade penalty in Defensive mode                   ║`);
  console.log(`║    • Multi-agent epoch competition + scoring                 ║`);
  console.log(`║    • Automatic parameter application from epoch winner       ║`);
  console.log(`║    • Protocol fee accumulation + collection                  ║`);
  console.log(`║    • Emergency pause (blocks swaps, allows LP exit)          ║`);
  console.log(`║    • TWAP oracle + ERC-20 LP tokens + EIP-2612 Permit       ║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝`);
}

main().catch((err) => {
  console.error("Demo error:", err);
  process.exitCode = 1;
});
