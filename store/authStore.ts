/**
 * Authentication Store
 * Manages user session and authentication state
 */

import { create } from 'zustand';

interface User {
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
  getUser: () => User | null;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: (username: string, password: string) => {
    const defaultUser = { username: 'admin', password: 'admin' };
    const savedCredentials = typeof window !== 'undefined'
      ? localStorage.getItem('qaudquanCredentials')
      : null;

    const storedUser = savedCredentials ? JSON.parse(savedCredentials) : null;
    const isValidDefault = username === defaultUser.username && password === defaultUser.password;
    const isValidStored = storedUser && username === storedUser.username && password === storedUser.password;

    if (!isValidDefault && !isValidStored) {
      return false;
    }

    const user = { username, email: `${username}@qaudquan.com` };
    if (typeof window !== 'undefined') {
      localStorage.setItem('qaudquanUser', username);
      localStorage.setItem('qaudquanAuth', JSON.stringify(user));
    }

    set({ user, isAuthenticated: true });
    return true;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qaudquanUser');
      localStorage.removeItem('qaudquanAuth');
      localStorage.removeItem('qaudquanCredentials');
    }
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: user !== null });
  },

  getUser: () => {
    return get().user;
  },

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const userAuth = localStorage.getItem('qaudquanAuth');
      if (userAuth) {
        try {
          const user = JSON.parse(userAuth);
          set({ user, isAuthenticated: true });
        } catch (e) {
          set({ user: null, isAuthenticated: false });
        }
      }
    }
  },
}));
