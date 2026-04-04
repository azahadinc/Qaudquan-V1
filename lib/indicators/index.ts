/**
 * Technical Indicators
 * Placeholder structure for Phase 4 - Technical Analysis Module
 * Will implement RSI, MACD, Bollinger Bands, Moving Averages, etc.
 */

import { Candle } from '../types';

export interface IndicatorResult {
  value: number;
  signal?: number;
  histogram?: number;
}

/**
 * Simple Moving Average (SMA)
 */
export function calculateSMA(candles: Candle[], period: number): number[] {
  const result: number[] = [];
  const window: number[] = [];

  for (let i = 0; i < candles.length; i += 1) {
    window.push(candles[i].close);

    if (window.length > period) {
      window.shift();
    }

    if (window.length < period) {
      result.push(NaN);
    } else {
      const sum = window.reduce((acc, value) => acc + value, 0);
      result.push(sum / period);
    }
  }

  return result;
}

/**
 * Exponential Moving Average (EMA)
 */
export function calculateEMA(candles: Candle[], period: number): number[] {
  const result: number[] = [];
  const k = 2 / (period + 1);
  let previousEMA: number | null = null;

  for (let i = 0; i < candles.length; i += 1) {
    const close = candles[i].close;
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }

    if (i === period - 1) {
      const sum = candles.slice(0, period).reduce((acc, candle) => acc + candle.close, 0);
      previousEMA = sum / period;
      result.push(previousEMA);
      continue;
    }

    previousEMA = (close - (previousEMA as number)) * k + (previousEMA as number);
    result.push(previousEMA);
  }

  return result;
}

/**
 * Relative Strength Index (RSI)
 */
export function calculateRSI(candles: Candle[], period: number = 14): number[] {
  const result: number[] = [];
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < candles.length; i += 1) {
    if (i === 0) {
      result.push(NaN);
      continue;
    }

    const change = candles[i].close - candles[i - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);

    if (i < period) {
      avgGain += gain;
      avgLoss += loss;
      result.push(NaN);
      continue;
    }

    if (i === period) {
      avgGain = (avgGain + gain) / period;
      avgLoss = (avgLoss + loss) / period;
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }

  return result;
}

/**
 * Moving Average Convergence Divergence (MACD)
 */
export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): IndicatorResult[] {
  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);
  const macdLine: number[] = [];

  for (let i = 0; i < candles.length; i += 1) {
    const fast = fastEMA[i];
    const slow = slowEMA[i];
    if (!Number.isFinite(fast) || !Number.isFinite(slow)) {
      macdLine.push(NaN);
    } else {
      macdLine.push(fast - slow);
    }
  }

  const signalLine = macdLine.map((_value, index) => {
    if (index < slowPeriod + signalPeriod - 1) {
      return NaN;
    }

    const slice = macdLine.slice(index - signalPeriod + 1, index + 1);
    const validSlice = slice.filter((value) => Number.isFinite(value));
    if (validSlice.length < signalPeriod) {
      return NaN;
    }

    const sum = validSlice.reduce((acc, current) => acc + current, 0);
    return sum / signalPeriod;
  });

  return macdLine.map((value, index) => ({
    value,
    signal: signalLine[index],
    histogram: Number.isFinite(value) && Number.isFinite(signalLine[index]) ? value - (signalLine[index] ?? 0) : NaN,
  }));
}

/**
 * Bollinger Bands
 */
export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDevs: number = 2
): Array<{ upper: number; middle: number; lower: number }> {
  const result: Array<{ upper: number; middle: number; lower: number }> = [];
  const window: number[] = [];

  for (let i = 0; i < candles.length; i += 1) {
    window.push(candles[i].close);
    if (window.length > period) window.shift();

    if (window.length < period) {
      result.push({ upper: NaN, middle: NaN, lower: NaN });
      continue;
    }

    const mean = window.reduce((acc, value) => acc + value, 0) / period;
    const variance = window.reduce((acc, value) => acc + (value - mean) ** 2, 0) / period;
    const deviation = Math.sqrt(variance);
    result.push({
      upper: mean + stdDevs * deviation,
      middle: mean,
      lower: mean - stdDevs * deviation,
    });
  }

  return result;
}

/**
 * Average True Range (ATR)
 */
export function calculateATR(candles: Candle[], period: number = 14): number[] {
  const result: number[] = [];
  const trValues: number[] = [];

  for (let i = 0; i < candles.length; i += 1) {
    if (i === 0) {
      result.push(NaN);
      continue;
    }

    const current = candles[i];
    const previous = candles[i - 1];
    const trueRange = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close),
    );
    trValues.push(trueRange);

    if (trValues.length < period) {
      result.push(NaN);
      continue;
    }

    if (trValues.length === period) {
      const sum = trValues.reduce((acc, value) => acc + value, 0);
      result.push(sum / period);
      continue;
    }

    const previousATR = result[result.length - 1];
    result.push(((previousATR as number) * (period - 1) + trueRange) / period);
  }

  return result;
}

/**
 * Stochastic Oscillator
 */
export function calculateStochastic(
  candles: Candle[],
  kPeriod: number = 14,
  dPeriod: number = 3
): Array<{ k: number; d: number }> {
  const result: Array<{ k: number; d: number }> = [];
  const kValues: number[] = [];

  for (let i = 0; i < candles.length; i += 1) {
    if (i < kPeriod - 1) {
      result.push({ k: NaN, d: NaN });
      continue;
    }

    const window = candles.slice(i - kPeriod + 1, i + 1);
    const highestHigh = Math.max(...window.map((c) => c.high));
    const lowestLow = Math.min(...window.map((c) => c.low));
    const k = highestHigh === lowestLow ? 50 : ((candles[i].close - lowestLow) / (highestHigh - lowestLow)) * 100;
    kValues.push(k);

    if (kValues.length < dPeriod) {
      result.push({ k, d: NaN });
      continue;
    }

    const d = kValues.slice(-dPeriod).reduce((acc, value) => acc + value, 0) / dPeriod;
    result.push({ k, d });
  }

  return result;
}
