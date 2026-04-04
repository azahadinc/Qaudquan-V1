/**
 * Connection Status Store
 * Tracks health of all data provider connections
 */

import { create } from 'zustand';
import { Provider, ConnectionStatus } from '../config/providers';

interface ConnectionStatusState {
  statuses: Record<Provider, ConnectionStatus>;
  setStatus: (provider: Provider, status: ConnectionStatus) => void;
  getStatus: (provider: Provider) => ConnectionStatus;
  isAllConnected: () => boolean;
  getOverallStatus: () => ConnectionStatus;
}

export const useConnectionStatusStore = create<ConnectionStatusState>((set, get) => ({
  statuses: {
    polygon: 'connecting',
    binance: 'connecting',
    oanda: 'connecting',
    alphavantage: 'connecting',
    finnhub: 'connecting',
  },

  setStatus: (provider: Provider, status: ConnectionStatus) =>
    set((state) => ({
      statuses: {
        ...state.statuses,
        [provider]: status,
      },
    })),

  getStatus: (provider: Provider) => {
    const { statuses } = get();
    return statuses[provider];
  },

  isAllConnected: () => {
    const { statuses } = get();
    return Object.values(statuses).every(status => status === 'connected');
  },

  getOverallStatus: () => {
    const { statuses } = get();
    const statusValues = Object.values(statuses);

    if (statusValues.every(s => s === 'connected')) {
      return 'connected';
    } else if (statusValues.some(s => s === 'error')) {
      return 'error';
    } else if (statusValues.some(s => s === 'reconnecting')) {
      return 'reconnecting';
    } else if (statusValues.some(s => s === 'connecting')) {
      return 'connecting';
    } else {
      return 'degraded';
    }
  },
}));