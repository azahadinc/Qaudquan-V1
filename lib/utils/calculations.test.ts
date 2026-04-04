import { describe, it, expect } from 'vitest';
import {
  calculateReturn,
  calculatePnL,
  calculateUnrealisedPnLPct,
  calculateVolatility,
  calculateMaxDrawdown,
} from './calculations';

describe('calculations', () => {
  describe('calculateReturn', () => {
    it('calculates return percentage correctly', () => {
      expect(calculateReturn(100, 110)).toBe(10);
      expect(calculateReturn(100, 90)).toBe(-10);
      expect(calculateReturn(100, 100)).toBe(0);
      expect(calculateReturn(0, 100)).toBe(0);
    });
  });

  describe('calculatePnL', () => {
    it('calculates profit/loss correctly', () => {
      expect(calculatePnL(10, 100, 110)).toBe(100); // $10 profit
      expect(calculatePnL(10, 100, 90)).toBe(-100); // $10 loss
      expect(calculatePnL(5, 50, 60)).toBe(50); // $5 profit
    });
  });

  describe('calculateUnrealisedPnLPct', () => {
    it('calculates unrealised P&L percentage correctly', () => {
      expect(calculateUnrealisedPnLPct(110, 100)).toBe(10);
      expect(calculateUnrealisedPnLPct(90, 100)).toBe(-10);
      expect(calculateUnrealisedPnLPct(100, 100)).toBe(0);
      expect(calculateUnrealisedPnLPct(100, 0)).toBe(0);
    });
  });

  describe('calculateVolatility', () => {
    it('calculates volatility (standard deviation)', () => {
      const candles = [
        { timestamp: 0, open: 100, high: 105, low: 95, close: 102, volume: 1000 },
        { timestamp: 1, open: 102, high: 108, low: 101, close: 105, volume: 1100 },
        { timestamp: 2, open: 105, high: 110, low: 104, close: 107, volume: 1200 },
      ];

      const volatility = calculateVolatility(candles, 3);
      expect(volatility).toBeGreaterThan(0);
      expect(volatility).toBeLessThan(10);
    });

    it('returns 0 for insufficient data', () => {
      const candles = [{ timestamp: 0, open: 100, high: 105, low: 95, close: 102, volume: 1000 }];
      expect(calculateVolatility(candles, 20)).toBe(0);
    });
  });

  describe('calculateMaxDrawdown', () => {
    it('calculates maximum drawdown correctly', () => {
      const prices = [100, 105, 110, 120, 115, 105, 100, 95];
      const maxDD = calculateMaxDrawdown(prices);
      expect(maxDD).toBeLessThan(0);
      expect(maxDD).toBeGreaterThan(-0.3);
    });

    it('returns 0 for single price', () => {
      expect(calculateMaxDrawdown([100])).toBe(0);
    });
  });
});
