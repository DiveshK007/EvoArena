import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  // RPC & keys
  rpcUrl: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545/",
  agentPrivateKey: process.env.AGENT_PRIVATE_KEY || "",

  // Contract addresses
  evoPoolAddress: process.env.EVOPOOL_ADDRESS || "",
  agentControllerAddress: process.env.AGENT_CONTROLLER_ADDRESS || "",

  // Agent behaviour
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || "30000", 10),
  baseFeeBps: parseInt(process.env.BASE_FEE_BPS || "30", 10),

  // Strategy thresholds
  volatilityHighThreshold: 0.03,   // 3 % → increase fee
  volatilityLowThreshold: 0.005,   // 0.5 % → reduce fee
  whaleRatioThreshold: 0.05,       // trade > 5 % of reserve → whale
  lowVolumeThreshold: 5,           // < 5 trades in window → low activity

  // Delta limits (must match on-chain AgentController)
  maxFeeDelta: 50,                 // bps per update
  maxBetaDelta: 2000,              // scaled 1e4 per update
  maxFeeBps: 500,                  // absolute cap

  // EMA
  emaSmoothingFactor: 0.3,        // λ for volatility EMA
};
