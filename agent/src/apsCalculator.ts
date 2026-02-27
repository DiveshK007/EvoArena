import * as fs from "fs";
import * as path from "path";

/**
 * APS (Agent Performance Score) Calculator
 *
 * APS = 0.4 × LPReturnDelta + 0.3 × SlippageReduction + 0.2 × VolatilityCompression + 0.1 × FeeRevenue
 *
 * All components normalized to [0, 1] range where possible.
 */
export interface APSSnapshot {
  epoch: number;
  timestamp: string;
  lpReturnDelta: number;
  slippageReduction: number;
  volatilityCompression: number;
  feeRevenue: number;
  aps: number;
  agentAddress: string;
  details: {
    staticLpReturn: number;
    agentLpReturn: number;
    staticAvgSlippage: number;
    agentAvgSlippage: number;
    staticVolatility: number;
    agentVolatility: number;
    totalFeeRevenue: number;
    totalVolume: number;
  };
}

const WEIGHTS = {
  lpReturn: 0.4,
  slippage: 0.3,
  volatility: 0.2,
  feeRevenue: 0.1,
};

export function computeAPS(
  staticLpReturn: number,
  agentLpReturn: number,
  staticAvgSlippage: number,
  agentAvgSlippage: number,
  staticVolatility: number,
  agentVolatility: number,
  totalFeeRevenue: number,
  totalVolume: number,
  epoch: number,
  agentAddress: string
): APSSnapshot {
  // LP return delta (higher is better)
  const lpReturnDelta = staticLpReturn > 0
    ? (agentLpReturn - staticLpReturn) / staticLpReturn
    : 0;

  // Slippage reduction (positive = agent has less slippage)
  const slippageReduction = staticAvgSlippage > 0
    ? 1 - (agentAvgSlippage / staticAvgSlippage)
    : 0;

  // Volatility compression (positive = agent reduces volatility)
  const volatilityCompression = staticVolatility > 0
    ? (staticVolatility - agentVolatility) / staticVolatility
    : 0;

  // Fee revenue as fraction of volume
  const feeRevenue = totalVolume > 0
    ? totalFeeRevenue / totalVolume
    : 0;

  // Composite APS
  const aps =
    WEIGHTS.lpReturn * Math.max(0, lpReturnDelta) +
    WEIGHTS.slippage * Math.max(0, slippageReduction) +
    WEIGHTS.volatility * Math.max(0, volatilityCompression) +
    WEIGHTS.feeRevenue * Math.min(1, feeRevenue * 100); // scale fee to [0,1]

  const snapshot: APSSnapshot = {
    epoch,
    timestamp: new Date().toISOString(),
    lpReturnDelta,
    slippageReduction,
    volatilityCompression,
    feeRevenue,
    aps: Math.round(aps * 10000) / 10000, // 4 decimal places
    agentAddress,
    details: {
      staticLpReturn,
      agentLpReturn,
      staticAvgSlippage,
      agentAvgSlippage,
      staticVolatility,
      agentVolatility,
      totalFeeRevenue,
      totalVolume,
    },
  };

  return snapshot;
}

export function saveAPSSnapshot(snapshot: APSSnapshot): void {
  const dir = path.resolve(__dirname, "../state");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, "aps.json");

  let history: APSSnapshot[] = [];
  if (fs.existsSync(filePath)) {
    try {
      history = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      history = [];
    }
  }

  history.push(snapshot);
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
}
