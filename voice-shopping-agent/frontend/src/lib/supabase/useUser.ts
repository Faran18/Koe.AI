"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, supabaseConfigured } from "./client";

/** undefined = still loading, null = signed out. */
export function useUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    if (!supabaseConfigured) { setUser(null); return; }
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);
  return user;
}
