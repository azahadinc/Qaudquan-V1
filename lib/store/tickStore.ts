import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Tick } from '../types';
import { TickDeduplicator } from '../data/tickDeduplicator';
import { CandleAggregator } from '../data/candleAggregator';

interface TickStore {
  ticks: Record<string, Tick>;
  prevCloses: Record<string, number>;
  history: Record<string, Tick[]>; // Rolling buffer of last 100 ticks per symbol
  setTick: (symbol: string, tick: Tick) => void;
  setPrevClose: (symbol: string, price: number) => void;
  getTick: (symbol: string) => Tick | undefined;
  getPrevClose: (symbol: string) => number | undefined;
  getHistory: (symbol: string) => Tick[];
  clearTicks: () => void;
}

// Global instances for data processing
const deduplicator = new TickDeduplicator();
const candleAggregator = new CandleAggregator();

export const useTickStore = create<TickStore>()(
  subscribeWithSelector((set, get) => ({
    ticks: {},
    prevCloses: {},
    history: {},

    setTick: (symbol: string, rawTick: Tick) => {
      // Step 1: Deduplication
      if (deduplicator.isDuplicate(symbol, rawTick.timestamp)) {
        return; // Skip duplicate
      }

      // Step 2: Change computation
      const prevClose = get().prevCloses[symbol];
      const changePct = prevClose ? ((rawTick.price - prevClose) / prevClose) * 100 : 0;
      const tick: Tick = {
        ...rawTick,
        change: prevClose ? rawTick.price - prevClose : 0,
        changePct,
      };

      // Step 3: Candle aggregation
      candleAggregator.addTick(symbol, tick.price, tick.volume, tick.timestamp);

      // Step 4: Update history buffer
      const currentHistory = get().history[symbol] || [];
      const newHistory = [...currentHistory, tick].slice(-100); // Keep last 100

      // Step 5: Store write
      set((state) => ({
        ticks: {
          ...state.ticks,
          [symbol]: tick,
        },
        history: {
          ...state.history,
          [symbol]: newHistory,
        },
      }));
    },

    setPrevClose: (symbol: string, price: number) =>
      set((state) => ({
        prevCloses: {
          ...state.prevCloses,
          [symbol]: price,
        },
      })),

    getTick: (symbol: string) => {
      const { ticks } = get();
      return ticks[symbol];
    },

    getPrevClose: (symbol: string) => {
      const { prevCloses } = get();
      return prevCloses[symbol];
    },

    getHistory: (symbol: string) => {
      const { history } = get();
      return history[symbol] || [];
    },

    clearTicks: () => {
      deduplicator.clear();
      candleAggregator.clear();
      set({ ticks: {}, history: {} });
    },
  }))
);

/**
 * Hook to subscribe to a single symbol's tick
 * Only re-renders when that specific symbol's tick changes
 */
export function useTick(symbol: string): Tick | undefined {
  return useTickStore((state) => state.ticks[symbol]);
}

/**
 * Hook to get previous close price for change calculations
 */
export function usePrevClose(symbol: string): number | undefined {
  return useTickStore((state) => state.prevCloses[symbol]);
}

/**
 * Hook to get tick history for sparklines
 */
export function useTickHistory(symbol: string): Tick[] {
  return useTickStore((state) => state.history[symbol] || []);
}

/**
 * Hook to get candle data
 */
export function useCandles(symbol: string) {
  return candleAggregator.getCandles(symbol);
}
