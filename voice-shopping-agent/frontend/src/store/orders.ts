"use client";
import { create } from "zustand";
import { getOrders, toProduct } from "@/lib/api";
import type { ApiOrder } from "@/lib/types";
import type { CartLine } from "./cart";

export interface Order {
  id: string;
  placedAt: string;
  lines: CartLine[];
  total: number;
  email?: string;
  status: string;
}

function fromApi(order: ApiOrder): Order {
  return {
    id: order.id,
    placedAt: order.created_at,
    total: order.subtotal,
    status: order.status,
    lines: order.items.map((item) => {
      const product = toProduct(item.product);
      return {
        id: product.id,
        itemId: item.id,
        size: item.size ?? "",
        qty: item.quantity,
        title: product.name,
        price: item.price_at_purchase,
        currency: product.currency ?? "USD",
        image: product.image_url,
      };
    }),
  };
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
  add: (order: ApiOrder, email: string) => Order;
}

export const useOrders = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: "",
  load: async () => {
    set({ loading: true, error: "" });
    try {
      const response = await getOrders();
      set({ orders: response.map(fromApi), loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "Unable to load your orders." });
    }
  },
  add: (apiOrder, email) => {
    const order = { ...fromApi(apiOrder), email };
    set((state) => ({ orders: [order, ...state.orders.filter((item) => item.id !== order.id)] }));
    return order;
  },
}));
