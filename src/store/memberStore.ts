import { create } from "zustand";
import type { MemberProfile, Coupon } from "@/types";
import { memberApi } from "@/utils/api";

interface MemberState {
  profile: MemberProfile | null;
  coupons: Coupon[];
  upgradeProgress: {
    currentLevel: string;
    nextLevel: string;
    spendingProgress: number;
    activityProgress: number;
  } | null;
  loading: boolean;
  fetchProfile: () => Promise<void>;
  fetchCoupons: () => Promise<void>;
  fetchUpgradeProgress: () => Promise<void>;
}

export const useMemberStore = create<MemberState>((set) => ({
  profile: null,
  coupons: [],
  upgradeProgress: null,
  loading: false,

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const profile = await memberApi.profile();
      set({ profile, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCoupons: async () => {
    try {
      const coupons = await memberApi.coupons();
      set({ coupons });
    } catch (_e) {
      void _e;
    }
  },

  fetchUpgradeProgress: async () => {
    try {
      const upgradeProgress = await memberApi.upgradeProgress();
      set({ upgradeProgress });
    } catch (_e) {
      void _e;
    }
  },
}));
