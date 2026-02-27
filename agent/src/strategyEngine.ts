import { config } from "./config";
import { MarketFeatures } from "./volatility";

/**
 * Deterministic rule engine.
 *
 * Maps market features → parameter suggestions.
 * All rules are explicit, bounded, and auditable.
 *
 * Rules:
 *   1. High volatility (σ > 3%)  →  feeBps += 20,  towards Defensive
 *   2. Whale detected             →  curveMode = Defensive, curveBeta += 500
 *   3. Low volume                 →  feeBps → baseFee, mode → Normal
 *   4. Moderate volatility        →  curveMode = VolatilityAdaptive
 *   5. Otherwise                  →  no change
 */
export interface ParameterSuggestion {
  newFeeBps: number;
  newCurveBeta: number;
  newCurveMode: number; // 0=Normal, 1=Defensive, 2=VolatilityAdaptive
  ruleFired: string;
  confidence: number;   // 0–1
}

export function computeSuggestion(
  features: MarketFeatures,
  currentFeeBps: number,
  currentCurveBeta: number,
  currentCurveMode: number
): ParameterSuggestion {
  let newFee = currentFeeBps;
  let newBeta = currentCurveBeta;
  let newMode = currentCurveMode;
  let ruleFired = "no-change";
  let confidence = 0.5;

  // ── Rule 1: High volatility ───────────────────────────────────────
  if (features.volatility > config.volatilityHighThreshold) {
    newFee = Math.min(currentFeeBps + 20, config.maxFeeBps);
    newMode = 2; // VolatilityAdaptive
    ruleFired = "high-volatility";
    confidence = 0.8;
  }

  // ── Rule 2: Whale detected (overrides mode) ───────────────────────
  if (features.whaleDetected) {
    newMode = 1; // Defensive
    newBeta = Math.min(currentCurveBeta + 500, 10000);
    ruleFired = features.volatility > config.volatilityHighThreshold
      ? "high-volatility+whale"
      : "whale-detected";
    confidence = 0.9;
  }

  // ── Rule 3: Low volume — relax back to base ───────────────────────
  if (features.tradeVelocity < config.lowVolumeThreshold && !features.whaleDetected) {
    newFee = config.baseFeeBps;
    newMode = 0; // Normal
    newBeta = 5000; // default 0.5
    ruleFired = "low-volume-relax";
    confidence = 0.7;
  }

  // ── Rule 4: Moderate volatility → adaptive ────────────────────────
  if (
    features.volatility > config.volatilityLowThreshold &&
    features.volatility <= config.volatilityHighThreshold &&
    !features.whaleDetected &&
    features.tradeVelocity >= config.lowVolumeThreshold
  ) {
    newFee = Math.min(currentFeeBps + 10, config.maxFeeBps);
    newMode = 2; // VolatilityAdaptive
    ruleFired = "moderate-volatility";
    confidence = 0.6;
  }

  // ── Clamp deltas to on-chain limits ───────────────────────────────
  const feeDelta = newFee - currentFeeBps;
  if (Math.abs(feeDelta) > config.maxFeeDelta) {
    newFee = feeDelta > 0
      ? currentFeeBps + config.maxFeeDelta
      : currentFeeBps - config.maxFeeDelta;
  }

  const betaDelta = newBeta - currentCurveBeta;
  if (Math.abs(betaDelta) > config.maxBetaDelta) {
    newBeta = betaDelta > 0
      ? currentCurveBeta + config.maxBetaDelta
      : currentCurveBeta - config.maxBetaDelta;
  }

  // Absolute bounds
  newFee = Math.max(0, Math.min(newFee, config.maxFeeBps));
  newBeta = Math.max(0, Math.min(newBeta, 10000));

  return { newFeeBps: newFee, newCurveBeta: newBeta, newCurveMode: newMode, ruleFired, confidence };
}
