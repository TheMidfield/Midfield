"use server";

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { getURL } from '@/lib/url'

/**
 * Sign up with email and password
 */
export async function signUpWithPassword(email: string, password: string) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: undefined, // No email confirmation needed
        },
    })

    if (error) {
        return { success: false, error: error.message }
    }

    if (!data.user) {
        return { success: false, error: 'Failed to create account' }
    }

    return { success: true, user: data.user }
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(email: string, password: string) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
    const supabase = await createClient()

    // Attempt to get the origin from the request headers to support Vercel Preview URLs
    const headersList = await headers()
    const origin = headersList.get('origin')

    const isValidOrigin = origin && origin.startsWith('http')
    const baseUrl = isValidOrigin ? `${origin}/` : getURL()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${baseUrl}auth/callback`,
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
