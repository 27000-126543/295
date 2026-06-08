import { create } from "zustand";
import type { Product, CartItem, Order } from "@/types";
import { shopApi } from "@/utils/api";

interface ShopState {
  products: Product[];
  total: number;
  page: number;
  cart: CartItem[];
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  fetchProducts: (params?: { category?: string; age?: number; keyword?: string; page?: number }) => Promise<void>;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number, spec?: string) => Promise<void>;
  updateCartItem: (id: number, quantity: number) => Promise<void>;
  removeCartItem: (id: number) => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: number) => Promise<void>;
  createOrder: (data: { addressId: number; items: CartItem[]; paymentMethod: string }) => Promise<void>;
  cartTotal: () => number;
  cartCount: () => number;
}

export const useShopStore = create<ShopState>((set, get) => ({
  products: [],
  total: 0,
  page: 1,
  cart: [],
  orders: [],
  currentOrder: null,
  loading: false,

  fetchProducts: async (params) => {
    set({ loading: true });
    try {
      const res = await shopApi.products(params);
      set({ products: res.list || [], total: res.total, page: res.page, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCart: async () => {
    try {
      const cart = await shopApi.cart.list();
      set({ cart });
    } catch (_e) {
      void _e;
    }
  },

  addToCart: async (productId, quantity, spec) => {
    try {
      const res = await shopApi.cart.add({ productId, quantity, spec });
      set({ cart: res });
    } catch (_e) {
      void _e;
    }
  },

  updateCartItem: async (id, quantity) => {
    try {
      const updated = await shopApi.cart.update(id, { quantity });
      set((s) => ({ cart: s.cart.map((c) => (c.id === id ? updated : c)) }));
    } catch (_e) {
      void _e;
    }
  },

  removeCartItem: async (id) => {
    try {
      await shopApi.cart.remove(id);
      set((s) => ({ cart: s.cart.filter((c) => c.id !== id) }));
    } catch (_e) {
      void _e;
    }
  },

  fetchOrders: async () => {
    try {
      const res = await shopApi.order.list();
      set({ orders: res.list || [] });
    } catch (_e) {
      void _e;
    }
  },

  fetchOrder: async (id) => {
    try {
      const currentOrder = await shopApi.order.detail(id);
      set({ currentOrder });
    } catch (_e) {
      void _e;
    }
  },

  createOrder: async (data) => {
    set({ loading: true });
    try {
      const order = await shopApi.order.create(data);
      set((s) => ({ orders: [order, ...s.orders], cart: [], loading: false }));
    } catch {
      set({ loading: false });
    }
  },

  cartTotal: () => {
    return get().cart.reduce((sum, item) => sum + (item.product_price || item.product?.price || 0) * item.quantity, 0);
  },

  cartCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
