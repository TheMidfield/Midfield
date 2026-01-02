import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Scheduled job to purge notifications older than 30 days
// Trigger: Supabase pg_cron or external cron service
export async function POST(request: NextRequest) {
    // Verify cron secret OR service role key (for internal Supabase crons)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const isValid = (cronSecret && token === cronSecret) || (serviceKey && token === serviceKey);

    if (!isValid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role for admin operations
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .lt('created_at', thirtyDaysAgo.toISOString());

        if (error) {
            console.error('[Cron] Error purging notifications:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`[Cron] Purged old notifications`);
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[Cron] Purge failed:', e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
