import { create } from 'zustand';

export type Market = 'all' | 'equity' | 'crypto' | 'forex' | 'commodity';

interface NavState {
  activePage: string;
  isCollapsed: boolean;
  marketFilter: Market;
  setPage: (page: string) => void;
  toggleCollapse: () => void;
  setMarketFilter: (filter: Market) => void;
}

export const useNavStore = create<NavState>((set) => ({
  activePage: 'dashboard',
  isCollapsed: false,
  marketFilter: 'all',
  setPage: (page: string) => set({ activePage: page }),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setMarketFilter: (filter: Market) => set({ marketFilter: filter }),
}));
