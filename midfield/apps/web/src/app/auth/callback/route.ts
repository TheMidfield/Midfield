import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url)
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        const next = searchParams.get('next') ?? '/'

        // Handle OAuth errors (user cancelled, etc.)
        if (error) {
            console.log('OAuth error:', error, errorDescription)
            return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(errorDescription || error)}`)
        }

        // No code provided
        if (!code) {
            return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent('No authorization code provided')}`)
        }

        const supabase = await createClient()
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(exchangeError.message)}`)
        }

        // Ensure user record exists in public.users table
        if (data.user) {
            const { error: upsertError } = await supabase
                .from('users')
                .upsert({
                    id: data.user.id,
                    username: null, // Will be set during onboarding
                    avatar_url: null, // Strictly prevent social avatars. User must upload their own.
                    display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || null,
                    onboarding_completed: false
                }, {
                    onConflict: 'id',
                    ignoreDuplicates: true
                })

            if (upsertError) {
                console.error('User record upsert error:', upsertError)
            }
        }




        // Success - redirect to destination
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        if (isLocalEnv) {
            return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
            return NextResponse.redirect(`${origin}${next}`)
        }
    } catch (err) {
        console.error('Auth callback error:', err)
        // Fallback - redirect to auth with generic error
        const origin = new URL(request.url).origin
        return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent('An unexpected error occurred')}`)
    }
}
