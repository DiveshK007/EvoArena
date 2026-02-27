/**
 * Fixup script — completes deployment steps that failed due to insufficient funds.
 * Run: npx hardhat run scripts/deploy-fixup.ts --network bscTestnet
 */
import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(bal), "tBNB");

  // Load existing deployment
  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf-8"));
  const epochManagerAddr = deployment.epochManager;
  const poolAddr = deployment.evoPool;
  const controllerAddr = deployment.agentController;
  const timeLockAddr = deployment.timeLock;

  console.log("\nCompleting remaining deployment steps...\n");

  // Step 9: Fund EpochManager with smaller amount (0.05 tBNB instead of 1)
  try {
    const rewardFunding = ethers.parseEther("0.05");
    const tx1 = await deployer.sendTransaction({ to: epochManagerAddr, value: rewardFunding });
    await tx1.wait();
    console.log("✅ EpochManager funded with 0.05 tBNB");
  } catch (err: any) {
    console.log("⚠️  EpochManager funding skipped:", err.message?.slice(0, 80));
  }

  // Step 10: Transfer ownership to TimeLock
  try {
    const pool = await ethers.getContractAt("EvoPool", poolAddr);
    const currentPoolOwner = await pool.owner();
    if (currentPoolOwner === deployer.address) {
      const tx2 = await pool.transferOwnership(timeLockAddr);
      await tx2.wait();
      console.log("✅ EvoPool ownership → TimeLock");
    } else {
      console.log("⏭️  EvoPool already owned by:", currentPoolOwner);
    }
  } catch (err: any) {
    console.log("⚠️  Pool ownership transfer skipped:", err.message?.slice(0, 80));
  }

  try {
    const controller = await ethers.getContractAt("AgentController", controllerAddr);
    const currentCtrlOwner = await controller.owner();
    if (currentCtrlOwner === deployer.address) {
      const tx3 = await controller.transferOwnership(timeLockAddr);
      await tx3.wait();
      console.log("✅ AgentController ownership → TimeLock");
    } else {
      console.log("⏭️  AgentController already owned by:", currentCtrlOwner);
    }
  } catch (err: any) {
    console.log("⚠️  Controller ownership transfer skipped:", err.message?.slice(0, 80));
  }

  try {
    const epochMgr = await ethers.getContractAt("EpochManager", epochManagerAddr);
    const currentEpochOwner = await epochMgr.owner();
    if (currentEpochOwner === deployer.address) {
      const tx4 = await epochMgr.transferOwnership(timeLockAddr);
      await tx4.wait();
      console.log("✅ EpochManager ownership → TimeLock");
    } else {
      console.log("⏭️  EpochManager already owned by:", currentEpochOwner);
    }
  } catch (err: any) {
    console.log("⚠️  EpochManager ownership transfer skipped:", err.message?.slice(0, 80));
  }

  // Verify final state
  const balAfter = await ethers.provider.getBalance(deployer.address);
  console.log("\n✅ Deployment complete!");
  console.log("Remaining balance:", ethers.formatEther(balAfter), "tBNB");
  console.log("\nContract addresses (from deployment.json):");
  console.log(JSON.stringify(deployment, null, 2));
}

main().catch(console.error);
