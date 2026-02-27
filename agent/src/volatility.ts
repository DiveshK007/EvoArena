/**
 * Volatility calculator using Exponential Moving Average (EMA).
 *
 * σ_t = λ * |p_t - p_{t-1}| / p_{t-1}  +  (1 - λ) * σ_{t-1}
 *
 * Also tracks whale detection and trade velocity.
 */
export interface MarketFeatures {
  volatility: number;        // EMA volatility (fractional, e.g. 0.03 = 3%)
  tradeVelocity: number;     // trades per window
  whaleDetected: boolean;    // any single trade > threshold of reserve
  maxWhaleRatio: number;     // largest trade / reserve
  avgTradeSize: number;      // average trade size in window
  priceChangeAbs: number;    // absolute price change from start to end
}

export class VolatilityCalculator {
  private emaVolatility: number = 0;
  private lastPrice: number = 0;
  private lambda: number;

  constructor(lambda: number = 0.3) {
    this.lambda = lambda;
  }

  /**
   * Compute features from a batch of swap events and current reserves.
   */
  computeFeatures(
    swapEvents: SwapEvent[],
    reserve0: bigint,
    reserve1: bigint,
    whaleThreshold: number
  ): MarketFeatures {
    const reserveTotal = Number(reserve0) + Number(reserve1);
    const currentPrice = Number(reserve1) > 0
      ? Number(reserve0) / Number(reserve1)
      : 1;

    let maxWhaleRatio = 0;
    let whaleDetected = false;
    let totalTradeSize = 0;

    for (const ev of swapEvents) {
      const tradeSize = Number(ev.amountIn);
      const reserveIn = ev.zeroForOne ? Number(reserve0) : Number(reserve1);
      const ratio = reserveIn > 0 ? tradeSize / reserveIn : 0;

      if (ratio > maxWhaleRatio) maxWhaleRatio = ratio;
      if (ratio > whaleThreshold) whaleDetected = true;

      totalTradeSize += tradeSize;

      // Update EMA volatility with each trade
      if (this.lastPrice > 0) {
        const priceAtTrade = ev.zeroForOne
          ? (Number(reserve0) + tradeSize) / Number(reserve1)
          : Number(reserve0) / (Number(reserve1) + tradeSize);
        const pctChange = Math.abs(priceAtTrade - this.lastPrice) / this.lastPrice;
        this.emaVolatility = this.lambda * pctChange + (1 - this.lambda) * this.emaVolatility;
        this.lastPrice = priceAtTrade;
      } else {
        this.lastPrice = currentPrice;
      }
    }

    const priceChangeAbs = this.lastPrice > 0
      ? Math.abs(currentPrice - this.lastPrice) / this.lastPrice
      : 0;
    this.lastPrice = currentPrice;

    return {
      volatility: this.emaVolatility,
      tradeVelocity: swapEvents.length,
      whaleDetected,
      maxWhaleRatio,
      avgTradeSize: swapEvents.length > 0 ? totalTradeSize / swapEvents.length : 0,
      priceChangeAbs,
    };
  }

  getEmaVolatility(): number {
    return this.emaVolatility;
  }

  reset(): void {
    this.emaVolatility = 0;
    this.lastPrice = 0;
  }
}

export interface SwapEvent {
  sender: string;
  zeroForOne: boolean;
  amountIn: bigint;
  amountOut: bigint;
  feeAmount: bigint;
  blockNumber: number;
}
