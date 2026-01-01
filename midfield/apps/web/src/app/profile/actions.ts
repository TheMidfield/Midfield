"use server";

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Upload avatar to Supabase Storage and update user profile
 */
export async function uploadAvatar(formData: FormData) {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    const file = formData.get('avatar') as File

    if (!file) {
        return { success: false, error: 'No file provided' }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        return { success: false, error: 'File must be an image' }
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        return { success: false, error: 'File must be less than 2MB' }
    }

    try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('user-content')
            .upload(filePath, file, {
                upsert: true,
                contentType: file.type
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return { success: false, error: uploadError.message }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('user-content')
            .getPublicUrl(filePath)

        // Update user profile with new avatar URL
        const { error: updateError } = await supabase
            .from('users')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id)

        if (updateError) {
            console.error('Update error:', updateError)
            return { success: false, error: updateError.message }
        }

        revalidatePath('/profile')
        revalidatePath('/', 'layout') // Revalidate layout to update navbar
        return { success: true, avatarUrl: publicUrl }
    } catch (error: any) {
        console.error('Avatar upload error:', error)
        return { success: false, error: error?.message || 'Failed to upload avatar' }
    }
}

/**
 * Update user profile (username, display name)
 */
export async function updateProfile(data: { username?: string; favorite_club_id?: string | null }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    const updates: any = {}

    if (data.username) {
        // Validate username (alphanumeric + underscore, 3-20 chars)
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) {
            return { success: false, error: 'Username must be 3-20 characters (letters, numbers, underscore only)' }
        }
        updates.username = data.username
    }

    if (data.favorite_club_id !== undefined) {
        updates.favorite_club_id = data.favorite_club_id
    }

    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

    if (error) {
        // Check for unique constraint violation
        if (error.code === '23505') {
            return { success: false, error: 'Username already taken' }
        }
        return { success: false, error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
}

/**
 * Get current user's profile
 */
export async function getUserProfile() {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return null
        }

        const { data: profile, error } = await supabase
            .from('users')
            .select(`
                id, 
                username, 
                display_name, 
                avatar_url, 
                favorite_club_id, 
                created_at, 
                favorite_club:topics!favorite_club_id(id, title, slug, metadata),
                posts:posts(count),
                reactions:reactions(count)
            `)
            .eq('id', user.id)
            .maybeSingle()

        if (error) {
            console.error('Error fetching user profile:', error);
            // Return user but null profile so client can handle it (or redirect)
            return { user, profile: null };
        }

        // Calculate User Rank (First 10/100/1000)
        const { count: olderUsersCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .lt('created_at', profile.created_at)

        const userRank = (olderUsersCount || 0) + 1

        // Calculate "Seeded Topic" (First take on a topic)
        const { data: hasSeeded } = await supabase
            .rpc('has_seeded_topic' as any, { user_id: user.id })

        const badges: string[] = []

        // Rank Badges (Mutually exclusive tiers)
        if (userRank <= 10) badges.push('original-10')
        else if (userRank <= 100) badges.push('club-100')
        else if (userRank <= 1000) badges.push('club-1000')

        // Trendsetter Badge
        if (hasSeeded) badges.push('trendsetter')

        // Return augmented profile
        return {
            user,
            profile: {
                ...profile,
                user_rank: userRank,
                badges
            }
        }
    } catch (error) {
        console.error('Unexpected error in getUserProfile:', error);
        return null;
    }
}
