import { Candle } from '../types';

/**
 * Financial calculation utilities
 */

/**
 * Calculate simple return percentage
 */
export function calculateReturn(startValue: number, endValue: number): number {
  if (startValue === 0) return 0;
  return ((endValue - startValue) / startValue) * 100;
}

/**
 * Calculate profit/loss
 */
export function calculatePnL(quantity: number, entryPrice: number, exitPrice: number): number {
  return (exitPrice - entryPrice) * quantity;
}

/**
 * Calculate unrealised P&L percentage
 */
export function calculateUnrealisedPnLPct(currentPrice: number, costBasis: number): number {
  if (costBasis === 0) return 0;
  return ((currentPrice - costBasis) / costBasis) * 100;
}

/**
 * Calculate average price
 */
export function calculateAveragePrice(candles: Candle[]): number {
  if (candles.length === 0) return 0;
  const sum = candles.reduce((acc, candle) => acc + candle.close, 0);
  return sum / candles.length;
}

/**
 * Calculate volatility (standard deviation)
 */
export function calculateVolatility(candles: Candle[], period = 20): number {
  if (candles.length < period) return 0;

  const slice = candles.slice(-period);
  const closes = slice.map((c) => c.close);
  const mean = closes.reduce((a, b) => a + b) / closes.length;

  const squaredDiffs = closes.map((c) => Math.pow(c - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b) / closes.length;

  return Math.sqrt(variance);
}

/**
 * Calculate daily returns for Sharpe ratio
 */
export function calculateDailyReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i] - prices[i - 1]) / prices[i - 1];
    returns.push(dailyReturn);
  }
  return returns;
}

/**
 * Calculate Sharpe ratio
 * Assumes daily returns and annual Sharpe (252 trading days)
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate = 0.02): number {
  if (returns.length === 0) return 0;

  const mean = returns.reduce((a, b) => a + b) / returns.length;
  const squaredDiffs = returns.map((r) => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b) / returns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  const excessReturn = mean - riskFreeRate / 252;
  return (excessReturn / stdDev) * Math.sqrt(252);
}

/**
 * Calculate maximum drawdown
 */
export function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) return 0;

  let maxPrice = prices[0];
  let maxDrawdown = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > maxPrice) {
      maxPrice = prices[i];
    }
    const drawdown = (prices[i] - maxPrice) / maxPrice;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

/**
 * Calculate win rate from trade results
 */
export function calculateWinRate(trades: Array<{ pnl: number }>): number {
  if (trades.length === 0) return 0;
  const wins = trades.filter((t) => t.pnl > 0).length;
  return (wins / trades.length) * 100;
}
