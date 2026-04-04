/**
 * Candle Aggregator
 * Maintains OHLCV candles for different timeframes
 */

type TimeFrame = '1m' | '5m' | '15m' | '1h' | '1d';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class CandleAggregator {
  private candles = new Map<string, Map<TimeFrame, CandleData>>();
  private readonly timeframes: Record<TimeFrame, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
  };

  /**
   * Add a tick to all relevant candle aggregations
   */
  addTick(symbol: string, price: number, volume: number, timestamp: number): void {
    Object.keys(this.timeframes).forEach(tf => {
      this.updateCandle(symbol, tf as TimeFrame, price, volume, timestamp);
    });
  }

  /**
   * Get current candle for a symbol and timeframe
   */
  getCandle(symbol: string, timeframe: TimeFrame): CandleData | null {
    const symbolCandles = this.candles.get(symbol);
    return symbolCandles?.get(timeframe) || null;
  }

  /**
   * Get all candles for a symbol
   */
  getCandles(symbol: string): Record<TimeFrame, CandleData | null> {
    const result: Record<TimeFrame, CandleData | null> = {} as any;
    Object.keys(this.timeframes).forEach(tf => {
      result[tf as TimeFrame] = this.getCandle(symbol, tf as TimeFrame);
    });
    return result;
  }

  private updateCandle(symbol: string, timeframe: TimeFrame, price: number, volume: number, timestamp: number): void {
    if (!this.candles.has(symbol)) {
      this.candles.set(symbol, new Map());
    }

    const symbolCandles = this.candles.get(symbol)!;
    const interval = this.timeframes[timeframe];
    const candleStart = Math.floor(timestamp / interval) * interval;

    let candle = symbolCandles.get(timeframe);

    if (!candle || candle.timestamp !== candleStart) {
      // Start new candle
      candle = {
        timestamp: candleStart,
        open: price,
        high: price,
        low: price,
        close: price,
        volume,
      };
    } else {
      // Update existing candle
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
      candle.close = price;
      candle.volume += volume;
    }

    symbolCandles.set(timeframe, candle);
  }

  /**
   * Clear all candle data
   */
  clear(): void {
    this.candles.clear();
  }
}