import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  nickname: string;
  temperature: number;
}

interface UserState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null, token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  checkNickname: (nickname: string) => Promise<boolean>;
  getMyTemperature: () => Promise<number>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  setUser: (user, token) => {
    set({ user, token, error: null });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;
      set({ user, token, isLoading: false });
      localStorage.setItem('token', token);
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '로그인에 실패했습니다.', 
        isLoading: false 
      });
      throw error;
    }
  },
  register: async (email: string, password: string, nickname: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({ email, password, nickname });
      const { user, token } = response.data;
      set({ user, token, isLoading: false });
      localStorage.setItem('token', token);
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '회원가입에 실패했습니다.', 
        isLoading: false 
      });
      throw error;
    }
  },
  logout: () => {
    set({ user: null, token: null, error: null });
    localStorage.removeItem('token');
  },
  checkNickname: async (nickname: string) => {
    try {
      const response = await authAPI.checkNickname(nickname);
      return response.data.available;
    } catch (error) {
      return false;
    }
  },
  getMyTemperature: async () => {
    try {
      const response = await authAPI.getMyTemperature();
      return response.data.temperature;
    } catch (error) {
      return 36.5; // 기본 온도
    }
  },
}));