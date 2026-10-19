"use client";
import { create } from "zustand";
import { addCartItem, getCart, removeCartItem, toProduct, updateCartItem } from "@/lib/api";
import type { ApiCart, ApiCartItem, Product } from "@/lib/types";

export interface CartLine {
  id: string;
  itemId: string;
  size: string;
  qty: number;
  title: string;
  price: number;
  currency: string;
  image: string;
}

function fromApi(item: ApiCartItem): CartLine {
  const product = toProduct(item.product);
  return {
    id: product.id,
    itemId: item.id,
    size: item.size ?? "",
    qty: item.quantity,
    title: product.name,
    price: product.price,
    currency: product.currency ?? "USD",
    image: product.image_url,
  };
}

function fromCart(cart: ApiCart) {
  return cart.items.map(fromApi);
}

interface CartState {
  lines: CartLine[];
  open: boolean;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  add: (product: Product, size?: string) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  setQty: (itemId: string, qty: number) => Promise<void>;
  toggle: (open?: boolean) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  lines: [],
  open: false,
  loading: false,
  error: "",
  refresh: async () => {
    set({ loading: true, error: "" });
    try {
      set({ lines: fromCart(await getCart()), loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Unable to load your bag." });
    }
  },
  add: async (product, size) => {
    set({ error: "" });
    try {
      set({ lines: fromCart(await addCartItem(product.id, 1, size)), open: true });
    } catch (error) {
      set({
        open: true,
        error: error instanceof Error ? error.message : "Unable to add this item.",
      });
    }
  },
  remove: async (itemId) => {
    set({ error: "" });
    try {
      set({ lines: fromCart(await removeCartItem(itemId)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to remove this item." });
    }
  },
  setQty: async (itemId, qty) => {
    set({ error: "" });
    try {
      set({ lines: fromCart(await updateCartItem(itemId, Math.min(20, Math.max(1, qty)))) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to update this quantity." });
    }
  },
  toggle: (open) => set((state) => ({ open: open ?? !state.open })),
  clear: () => set({ lines: [], error: "" }),
  count: () => get().lines.reduce((count, line) => count + line.qty, 0),
  subtotal: () => get().lines.reduce((sum, line) => sum + line.qty * line.price, 0),
}));
