/**
 * Settings Store
 * Manages user settings including API keys
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  apiKeys: {
    polygon?: string;
    binance?: string;
    alpaca?: string;
    alphavantage?: string;
    finnhub?: string;
  };
  setApiKey: (provider: keyof SettingsState['apiKeys'], key: string) => void;
  removeApiKey: (provider: keyof SettingsState['apiKeys']) => void;
  getApiKey: (provider: keyof SettingsState['apiKeys']) => string | undefined;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      apiKeys: {},

      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: key,
          },
        })),

      removeApiKey: (provider) =>
        set((state) => {
          const { [provider]: _, ...rest } = state.apiKeys;
          return { apiKeys: rest };
        }),

      getApiKey: (provider) => get().apiKeys[provider],
    }),
    {
      name: 'settings-storage',
    }
  )
);