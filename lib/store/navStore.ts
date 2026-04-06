import { create } from 'zustand';

export type Market = 'all' | 'equity' | 'crypto' | 'forex' | 'commodity';

interface NavState {
  activePage: string;
  isCollapsed: boolean;
  isSidebarOpen: boolean;
  marketFilter: Market;
  setPage: (page: string) => void;
  toggleCollapse: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setMarketFilter: (filter: Market) => void;
}

export const useNavStore = create<NavState>((set) => ({
  activePage: 'dashboard',
  isCollapsed: false,
  isSidebarOpen: false,
  marketFilter: 'all',
  setPage: (page: string) => set({ activePage: page }),
  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  setMarketFilter: (filter: Market) => set({ marketFilter: filter }),
}));
