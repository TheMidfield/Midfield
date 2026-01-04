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
                posts:posts(count)
            `)
            .eq('id', user.id)
            .maybeSingle()

        if (error) {
            console.error('Error fetching user profile:', error);
            // Return user but null profile so client can handle it (or redirect)
            return { user, profile: null };
        }

        // Get Activity Stats (Reactions Received, Topics Interacted)
        const { data: activityStats } = await supabase
            .rpc('get_user_activity_stats' as any, { target_user_id: user.id })

        // Fetch earned badges from database (new source of truth)
        const { data: earnedBadges } = await supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', user.id);

        const badges = earnedBadges?.map(b => b.badge_id) || [];


        // Return augmented profile
        return {
            user,
            profile: {
                ...profile,
                badges,
                activity_stats: activityStats || { reactions_received: 0, topics_interacted: 0 }
            }
        }
    } catch (error) {
        console.error('Unexpected error in getUserProfile:', error);
        return null;
    }
}
