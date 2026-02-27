import { run } from "hardhat";
import * as fs from "fs";

async function main() {
  const raw = fs.readFileSync("deployment.json", "utf-8");
  const d = JSON.parse(raw);

  console.log("Verifying contracts on BscScan...\n");

  const contracts = [
    {
      name: "TokenA (EvoToken)",
      address: d.tokenA,
      constructorArguments: [
        "EvoArena Token A",
        "EVOA",
        "1000000000000000000000000", // 1M * 1e18
        d.deployer,
      ],
    },
    {
      name: "TokenB (EvoToken)",
      address: d.tokenB,
      constructorArguments: [
        "EvoArena Token B",
        "EVOB",
        "1000000000000000000000000",
        d.deployer,
      ],
    },
    {
      name: "EvoPool",
      address: d.evoPool,
      constructorArguments: [
        d.tokenA,
        d.tokenB,
        d.config.initialFeeBps,
        d.config.initialCurveBeta,
        d.deployer,
      ],
    },
    {
      name: "AgentController",
      address: d.agentController,
      constructorArguments: [
        d.evoPool,
        "10000000000000000", // 0.01 ether in wei
        d.config.cooldownSeconds,
        d.config.maxFeeDelta,
        d.config.maxBetaDelta,
        d.deployer,
      ],
    },
  ];

  for (const c of contracts) {
    console.log(`Verifying ${c.name} at ${c.address}...`);
    try {
      await run("verify:verify", {
        address: c.address,
        constructorArguments: c.constructorArguments,
      });
      console.log(`  ✅ ${c.name} verified!\n`);
    } catch (e: any) {
      if (e.message?.includes("Already Verified")) {
        console.log(`  ⏭  ${c.name} already verified\n`);
      } else {
        console.error(`  ❌ ${c.name} verification failed:`, e.message, "\n");
      }
    }
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
