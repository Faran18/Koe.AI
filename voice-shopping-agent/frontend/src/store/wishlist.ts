"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishState { ids: string[]; toggle: (id: string) => void; has: (id: string) => boolean; }

export const useWishlist = create<WishState>()(persist((set, get) => ({
  ids: [],
  toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((i) => i !== id) : [...s.ids, id] })),
  has: (id) => get().ids.includes(id),
}), { name: "velora-wishlist" }));
