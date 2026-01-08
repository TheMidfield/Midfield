import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// User-friendly error messages for common magic link failures
const getErrorMessage = (error: string): string => {
    const errorLower = error.toLowerCase()

    if (errorLower.includes('code verifier') || errorLower.includes('pkce')) {
        return 'Please open the magic link on the same device where you requested it.'
    }
    if (errorLower.includes('expired') || errorLower.includes('token')) {
        return 'This magic link has expired. Please request a new one.'
    }
    if (errorLower.includes('already used') || errorLower.includes('invalid')) {
        return 'This magic link has already been used. Please sign in again.'
    }
    return error
}

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
            const friendlyError = getErrorMessage(errorDescription || error)
            return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(friendlyError)}`)
        }

        // No code provided
        if (!code) {
            return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent('No authorization code provided')}`)
        }

        const supabase = await createClient()
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            const friendlyError = getErrorMessage(exchangeError.message)
            return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(friendlyError)}`)
        }

        // ✅ User record creation is handled by database trigger (handle_new_user)
        // No need for manual upsert - it was causing race conditions and duplicate errors

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
