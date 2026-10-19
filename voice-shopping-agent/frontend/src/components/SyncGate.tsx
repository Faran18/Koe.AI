"use client";
import { useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { useProfile } from "@/store/profile";

export default function SyncGate() {
  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();
    let userId: string | null = null;

    async function loadProfile(id: string, email?: string) {
      userId = id;
      const { data, error } = await supabase.from("profiles").select("name,size").eq("id", id).maybeSingle();
      if (error) {
        console.error("Could not load the signed-in profile:", error.message);
        return;
      }
      useProfile.setState({ name: data?.name ?? "", size: data?.size ?? "M", email: email ?? "" });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && session.user.id !== userId) {
        setTimeout(() => void loadProfile(session.user.id, session.user.email), 0);
      } else if (event === "SIGNED_OUT") {
        userId = null;
        useProfile.setState({ name: "", email: "", size: "M" });
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  return null;
}
