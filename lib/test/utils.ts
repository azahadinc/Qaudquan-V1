import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { expect } from 'vitest';

/**
 * Custom render function that wraps providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  // Add providers as needed (e.g., QueryClientProvider, Zustand provider)
  return render(ui, { ...options });
}

/**
 * Mock data generators for testing
 */
export const mockData = {
  tick: (overrides = {}) => ({
    symbol: 'AAPL',
    price: 150.25,
    change: 2.5,
    changePercent: 1.69,
    volume: 50000000,
    timestamp: new Date().toISOString(),
    ...overrides,
  }),

  candle: (overrides = {}) => ({
    symbol: 'AAPL',
    open: 150.0,
    high: 152.0,
    low: 149.5,
    close: 151.5,
    volume: 50000000,
    timestamp: new Date().toISOString(),
    ...overrides,
  }),

  instrument: (overrides = {}) => ({
    symbol: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    type: 'EQUITY',
    currency: 'USD',
    ...overrides,
  }),

  position: (overrides = {}) => ({
    symbol: 'AAPL',
    quantity: 100,
    entryPrice: 150.0,
    currentPrice: 151.5,
    pnl: 150.0,
    pnlPercent: 1.0,
    ...overrides,
  }),
};

/**
 * Assertion helpers
 */
export const assertions = {
  isValidTick: (data: unknown) => {
    expect(data).toHaveProperty('symbol');
    expect(data).toHaveProperty('price');
    expect(data).toHaveProperty('timestamp');
  },

  isValidCandle: (data: unknown) => {
    expect(data).toHaveProperty('open');
    expect(data).toHaveProperty('high');
    expect(data).toHaveProperty('low');
    expect(data).toHaveProperty('close');
    expect(data).toHaveProperty('volume');
  },
};

/**
 * Creates a mock FormData for testing file uploads
 */
export function createMockFormData(data: Record<string, string>) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

/**
 * Waits for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 1000,
  interval = 100,
) {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}
