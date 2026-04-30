import { create } from 'zustand';
import { type AuthUser } from '../types';

interface AuthUserWithId extends AuthUser {
  id: string;
  phone: string;
}

interface AuthState {
  token: string | null;
  user: AuthUserWithId | null;
  login: (token: string, user: AuthUserWithId) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },

  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'admin',
}));

export default useAuthStore;