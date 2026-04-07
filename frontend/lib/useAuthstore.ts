import { create } from 'zustand';
import { User } from '../types/auth';
import { getStoredAuthState, isTokenValid } from './authSession';

const AUTH_USER_STORAGE_KEY = 'auth_user';

function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
}

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
    const authState = getStoredAuthState();

    if (!authState.token) {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      set(authState);
      return;
    }

    const storedUser = readStoredUser();
    const tokenUser = authState.user;

    if (!storedUser || !tokenUser || storedUser.id !== tokenUser.id) {
      if (tokenUser) {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(tokenUser));
      }
      set(authState);
      return;
    }

    // Keep token claims authoritative for identity/role, while preserving latest profile data.
    const mergedUser: User = {
      ...storedUser,
      id: tokenUser.id,
      name: tokenUser.name,
      email: tokenUser.email,
      role: tokenUser.role,
      profileImageUrl: storedUser.profileImageUrl || tokenUser.profileImageUrl,
    };

    set({ ...authState, user: mergedUser });
  },

  login: (user, token) => {
    if (!isTokenValid(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }

    localStorage.setItem('token', token);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    // Sinkronisasi dengan CartStore jika diperlukan
    // useCartStore.getState().clearCart(); 
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
