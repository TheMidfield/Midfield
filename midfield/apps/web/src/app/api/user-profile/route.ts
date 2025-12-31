import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ isAuthenticated: false, avatar_url: null }, { status: 200 })
    }

    const { data: profile } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .eq('id', user.id)
        .maybeSingle()

    return NextResponse.json({ isAuthenticated: true, avatar_url: profile?.avatar_url || null })
}
