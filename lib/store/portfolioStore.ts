import { create } from 'zustand';
import { Position } from '../types';

interface PortfolioState {
  positions: Position[];
  cashBalance: number;
  setPositions: (positions: Position[]) => void;
  setCashBalance: (balance: number) => void;
  updatePositionPrice: (symbol: string, currentPrice: number) => void;
}

const initialPositions: Position[] = [
  {
    symbol: 'AAPL',
    market: 'equity',
    quantity: 85,
    averageCost: 156.28,
    entryTime: Date.now() - 12 * 24 * 60 * 60 * 1000,
    currentPrice: 189.45,
  },
  {
    symbol: 'BTCUSD',
    market: 'crypto',
    quantity: 1.35,
    averageCost: 36500,
    entryTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
    currentPrice: 42900,
  },
  {
    symbol: 'EURUSD',
    market: 'forex',
    quantity: 100000,
    averageCost: 1.0875,
    entryTime: Date.now() - 18 * 24 * 60 * 60 * 1000,
    currentPrice: 1.0912,
  },
  {
    symbol: 'GLD',
    market: 'commodity',
    quantity: 280,
    averageCost: 173.4,
    entryTime: Date.now() - 20 * 24 * 60 * 60 * 1000,
    currentPrice: 189.0,
  },
];

export const usePortfolioStore = create<PortfolioState>((set) => ({
  positions: initialPositions,
  cashBalance: 32000,
  setPositions: (positions) => set({ positions }),
  setCashBalance: (cashBalance) => set({ cashBalance }),
  updatePositionPrice: (symbol, currentPrice) =>
    set((state) => ({
      positions: state.positions.map((position) =>
        position.symbol === symbol
          ? { ...position, currentPrice }
          : position
      ),
    })),
}));
