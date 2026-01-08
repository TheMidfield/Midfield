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
            return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(errorDescription || error)}`)
        }

        // No code provided
        if (!code) {
            return NextResponse.redirect(`${origin}/?error=${encodeURIComponent('No authorization code provided')}`)
        }

        const supabase = await createClient()
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
            console.error('OAuth exchange error:', exchangeError)
            return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(exchangeError.message)}`)
        }

        // ✅ User record creation is handled by database trigger (handle_new_user)

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
        const origin = new URL(request.url).origin
        return NextResponse.redirect(`${origin}/?error=${encodeURIComponent('An unexpected error occurred')}`)
    }
}
