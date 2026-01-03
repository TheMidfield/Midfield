import { createClient } from 'jsr:@supabase/supabase-js@2'
import { TheSportsDBClient } from '../_shared/client.ts'
import { updateLivescores } from '../_shared/livescores-sync.ts'

Deno.serve(async (req) => {
    try {
        // Auth check
        const authHeader = req.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')

        const cronSecret = Deno.env.get('CRON_SECRET')
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (token !== cronSecret && token !== serviceKey) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Initialize clients
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const apiKey = Deno.env.get('THESPORTSDB_API_KEY')!

        const supabase = createClient(supabaseUrl, supabaseKey)
        const apiClient = new TheSportsDBClient(apiKey)

        console.log('🔴 [LIVESCORE SYNC] Starting...', new Date().toISOString())

        // Run the livescores sync
        await updateLivescores(supabase, apiClient)

        console.log('✅ [LIVESCORE SYNC] Completed successfully')

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Livescore sync completed',
                timestamp: new Date().toISOString()
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200
            }
        )
    } catch (error) {
        console.error('❌ Livescore sync failed:', error)
        return new Response(
            JSON.stringify({ success: false, error: String(error) }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
