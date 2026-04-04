import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatPercent,
  formatCurrency,
  formatCompact,
  getPriceColor,
  isValidSymbol,
} from './formatters';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('formats price correctly', () => {
      expect(formatPrice(123.456, 2)).toBe('123.46');
      expect(formatPrice(1234.5, 2)).toBe('1,234.50');
      expect(formatPrice(0.123, 3)).toBe('0.123');
    });
  });

  describe('formatPercent', () => {
    it('formats percent correctly', () => {
      expect(formatPercent(5)).toContain('5');
      expect(formatPercent(10.5)).toContain('10.5');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toContain('1,234.56');
    });
  });

  describe('formatCompact', () => {
    it('formats large numbers compactly', () => {
      expect(formatCompact(1500000000)).toBe('1.50B');
      expect(formatCompact(1500000)).toBe('1.50M');
      expect(formatCompact(1500)).toBe('1.50K');
      expect(formatCompact(123)).toBe('123.00');
    });
  });

  describe('getPriceColor', () => {
    it('returns correct color for positive/negative change', () => {
      const colors = { up: '#16a34a', down: '#dc2626' };
      expect(getPriceColor(5, colors)).toBe('#16a34a');
      expect(getPriceColor(-5, colors)).toBe('#dc2626');
      expect(getPriceColor(0, colors)).toBe('#16a34a');
    });
  });

  describe('isValidSymbol', () => {
    it('validates stock symbols', () => {
      expect(isValidSymbol('AAPL')).toBe(true);
      expect(isValidSymbol('BTC')).toBe(true);
      expect(isValidSymbol('aapl')).toBe(true);
      expect(isValidSymbol('INVALID123')).toBe(false);
      expect(isValidSymbol('')).toBe(false);
    });
  });
});
