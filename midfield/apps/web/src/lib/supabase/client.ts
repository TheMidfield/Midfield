import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@midfield/types'

/**
 * Client-side Supabase client (for Client Components)
 * Automatically manages auth state in browser
 */
let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
    if (typeof window === 'undefined') {
        // Server side - always create new to avoid shared state across requests (though this is browser client, so mostly used in hooks/handlers)
        return createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    }

    if (!client) {
        client = createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    }

    return client
}
