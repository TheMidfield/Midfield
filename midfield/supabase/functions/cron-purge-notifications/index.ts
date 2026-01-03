import { createClient } from 'jsr:@supabase/supabase-js@2'

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

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        console.log('🧹 [PURGE NOTIFICATIONS] Starting...', new Date().toISOString())

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { error, count } = await supabase
            .from('notifications')
            .delete({ count: 'exact' })
            .lt('created_at', thirtyDaysAgo.toISOString())

        if (error) {
            console.error('❌ Purge failed:', error)
            return new Response(
                JSON.stringify({ success: false, error: error.message }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    status: 500
                }
            )
        }

        console.log(`✅ Purged ${count || 0} old notifications`)

        return new Response(
            JSON.stringify({
                success: true,
                deleted: count || 0,
                timestamp: new Date().toISOString()
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 200
            }
        )
    } catch (error) {
        console.error('❌ Purge notifications failed:', error)
        return new Response(
            JSON.stringify({ success: false, error: String(error) }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
