import { create } from 'zustand';
import { User } from '../types/auth';
import { getStoredAuthState, isTokenValid } from './authSession';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  syncFromStorage: () => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  syncFromStorage: () => {
    set(getStoredAuthState());
  },

  login: (user, token) => {
    if (!isTokenValid(token)) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }

    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    // Sinkronisasi dengan CartStore jika diperlukan
    // useCartStore.getState().clearCart(); 
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
