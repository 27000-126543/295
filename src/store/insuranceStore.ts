import { create } from "zustand";
import type { InsuranceProduct, InsurancePolicy, Claim } from "@/types";
import { insuranceApi } from "@/utils/api";

interface InsuranceState {
  products: InsuranceProduct[];
  currentProduct: InsuranceProduct | null;
  policies: InsurancePolicy[];
  claims: Claim[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: number) => Promise<void>;
  purchase: (data: { product_id: number; insured_name: string; insured_id: string }) => Promise<void>;
  createClaim: (data: { policy_id: number; amount: number; description: string; documents: string[] }) => Promise<void>;
  fetchClaims: () => Promise<void>;
}

export const useInsuranceStore = create<InsuranceState>((set) => ({
  products: [],
  currentProduct: null,
  policies: [],
  claims: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const products = await insuranceApi.products();
      set({ products, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchProduct: async (id) => {
    set({ loading: true });
    try {
      const currentProduct = await insuranceApi.product(id);
      set({ currentProduct, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  purchase: async (data) => {
    set({ loading: true });
    try {
      const policy = await insuranceApi.purchase(data);
      set((s) => ({ policies: [policy, ...s.policies], loading: false }));
    } catch {
      set({ loading: false });
    }
  },

  createClaim: async (data) => {
    set({ loading: true });
    try {
      const claim = await insuranceApi.claim.create(data);
      set((s) => ({ claims: [claim, ...s.claims], loading: false }));
    } catch {
      set({ loading: false });
    }
  },

  fetchClaims: async () => {
    try {
      const claims = await insuranceApi.claim.list();
      set({ claims });
    } catch (_e) {
      void _e;
    }
  },
}));
