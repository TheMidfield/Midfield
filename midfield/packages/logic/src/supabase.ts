import { createClient } from "@supabase/supabase-js";
import type { Database } from "@midfield/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
