import { createBrowserClient } from "@supabase/ssr";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url && key);
let client: ReturnType<typeof createBrowserClient> | null = null;
export function createClient() { return (client ??= createBrowserClient(url!, key!)); }
