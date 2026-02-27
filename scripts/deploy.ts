import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");

  // ── 1. Deploy tokens ──────────────────────────────────────────────
  const TokenFactory = await ethers.getContractFactory("EvoToken");

  const tokenA = await TokenFactory.deploy(
    "EvoArena Token A",
    "EVOA",
    ethers.parseEther("1000000"),
    deployer.address
  );
  await tokenA.waitForDeployment();
  const tokenAAddr = await tokenA.getAddress();
  console.log("TokenA deployed:", tokenAAddr);

  const tokenB = await TokenFactory.deploy(
    "EvoArena Token B",
    "EVOB",
    ethers.parseEther("1000000"),
    deployer.address
  );
  await tokenB.waitForDeployment();
  const tokenBAddr = await tokenB.getAddress();
  console.log("TokenB deployed:", tokenBAddr);

  // ── 2. Deploy EvoPool ─────────────────────────────────────────────
  const INITIAL_FEE_BPS = 30;      // 0.30%
  const INITIAL_CURVE_BETA = 5000; // 0.5

  const PoolFactory = await ethers.getContractFactory("EvoPool");
  const pool = await PoolFactory.deploy(
    tokenAAddr,
    tokenBAddr,
    INITIAL_FEE_BPS,
    INITIAL_CURVE_BETA,
    deployer.address
  );
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();
  console.log("EvoPool deployed:", poolAddr);

  // ── 3. Deploy AgentController ─────────────────────────────────────
  const MIN_BOND = ethers.parseEther("0.01");
  const COOLDOWN_SECONDS = 300; // 5 minutes
  const MAX_FEE_DELTA = 50;    // 50 bps
  const MAX_BETA_DELTA = 2000; // 0.2 scaled 1e4

  const ControllerFactory = await ethers.getContractFactory("AgentController");
  const controller = await ControllerFactory.deploy(
    poolAddr,
    MIN_BOND,
    COOLDOWN_SECONDS,
    MAX_FEE_DELTA,
    MAX_BETA_DELTA,
    deployer.address
  );
  await controller.waitForDeployment();
  const controllerAddr = await controller.getAddress();
  console.log("AgentController deployed:", controllerAddr);

  // ── 4. Link controller to pool ────────────────────────────────────
  await pool.setController(controllerAddr);
  console.log("Controller linked to pool");

  // ── 5. Seed initial liquidity ─────────────────────────────────────
  const SEED_AMOUNT = ethers.parseEther("10000");
  await tokenA.approve(poolAddr, SEED_AMOUNT);
  await tokenB.approve(poolAddr, SEED_AMOUNT);
  await pool.addLiquidity(SEED_AMOUNT, SEED_AMOUNT);
  console.log("Seeded liquidity: 10,000 EVOA + 10,000 EVOB");

  // ── 6. Save deployment addresses ──────────────────────────────────
  const deployment = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    tokenA: tokenAAddr,
    tokenB: tokenBAddr,
    evoPool: poolAddr,
    agentController: controllerAddr,
    config: {
      initialFeeBps: INITIAL_FEE_BPS,
      initialCurveBeta: INITIAL_CURVE_BETA,
      minBond: ethers.formatEther(MIN_BOND),
      cooldownSeconds: COOLDOWN_SECONDS,
      maxFeeDelta: MAX_FEE_DELTA,
      maxBetaDelta: MAX_BETA_DELTA,
      seedLiquidity: ethers.formatEther(SEED_AMOUNT),
    },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync("deployment.json", JSON.stringify(deployment, null, 2));
  console.log("\nDeployment saved to deployment.json");
  console.log(JSON.stringify(deployment, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
