import { create } from "zustand";
import type { User } from "@/types";
import { authApi } from "@/utils/api";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, code: string) => Promise<void>;
  register: (phone: string, code: string, name: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  loading: false,

  login: async (phone, code) => {
    set({ loading: true });
    try {
      const res = await authApi.login({ phone, password: code });
      localStorage.setItem("token", res.token);
      set({ token: res.token, user: res.user, loading: false });
    } catch {
      set({ loading: false });
      throw new Error("登录失败");
    }
  },

  register: async (phone, code, name) => {
    set({ loading: true });
    try {
      const res = await authApi.register({ phone, password: code, name });
      localStorage.setItem("token", res.token);
      set({ token: res.token, user: res.user, loading: false });
    } catch {
      set({ loading: false });
      throw new Error("注册失败");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },

  fetchMe: async () => {
    try {
      const user = await authApi.me();
      set({ user });
    } catch {
      localStorage.removeItem("token");
      set({ token: null, user: null });
    }
  },
}));
