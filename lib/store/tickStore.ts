import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Tick } from '../types';

interface TickStore {
  ticks: Record<string, Tick>;
  setTick: (symbol: string, tick: Tick) => void;
  getTick: (symbol: string) => Tick | undefined;
  clearTicks: () => void;
}

export const useTickStore = create<TickStore>()(
  subscribeWithSelector((set, get) => ({
    ticks: {},

    setTick: (symbol: string, tick: Tick) =>
      set((state) => ({
        ticks: {
          ...state.ticks,
          [symbol]: tick,
        },
      })),

    getTick: (symbol: string) => {
      const { ticks } = get();
      return ticks[symbol];
    },

    clearTicks: () => set({ ticks: {} }),
  }))
);

/**
 * Hook to subscribe to a single symbol's tick
 * Only re-renders when that specific symbol's tick changes
 */
export function useTick(symbol: string): Tick | undefined {
  return useTickStore((state) => state.ticks[symbol]);
}
