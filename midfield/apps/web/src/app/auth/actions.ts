"use server";

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Sign in with email (magic link)
 */
export async function signInWithEmail(email: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        return { success: false, error: error.message }
    }

    if (data.url) {
        redirect(data.url) // Redirect to Google OAuth
    }

    return { success: false, error: 'No redirect URL' }
}

/**
 * Sign out
 */
export async function signOut() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        return { success: false, error: error.message }
    }

    redirect('/')
}

/**
 * Get current session (server-side)
 */
export async function getSession() {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()

    return session
}

/**
 * Get current user (server-side)
 */
export async function getUser() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    return user
}
