"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
interface Profile { name: string; email: string; size: string; save: (p: Partial<Omit<Profile, "save">>) => void; }
export const useProfile = create<Profile>()(persist((set) => ({ name: "", email: "", size: "M", save: (p) => set(p) }), { name: "velora-profile" }));
