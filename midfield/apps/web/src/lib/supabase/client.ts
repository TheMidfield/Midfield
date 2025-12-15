import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@midfield/types'

/**
 * Client-side Supabase client (for Client Components)
 * Automatically manages auth state in browser
 */
export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
