import { supabase } from "./supabase";
import type { Post, PostInsert } from "@midfield/types";

/**
 * Get posts for a specific topic
 */
export const getPostsByTopic = async (topicId: string): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:users(*)
        `)
        .eq('topic_id', topicId)
        .eq('is_deleted', false)
        .is('parent_post_id', null) // Only root posts
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
    
    return data || [];
};

/**
 * Get a single post with its replies
 */
export const getPostWithReplies = async (postId: string): Promise<Post | null> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:users(*),
            replies:posts!posts_parent_post_id_fkey(
                *,
                author:users(*)
            )
        `)
        .eq('id', postId)
        .eq('is_deleted', false)
        .single();
    
    if (error) {
        console.error('Error fetching post:', error);
        return null;
    }
    
    return data;
};

/**
 * Create a new post
 */
export const createPost = async (post: PostInsert): Promise<Post | null> => {
    const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();
    
    if (error) {
        console.error('Error creating post:', error);
        return null;
    }
    
    return data;
};

/**
 * Get recent posts across all topics (feed)
 */
export const getRecentPosts = async (limit: number = 20): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:users(*),
            topic:topics(*)
        `)
        .eq('is_deleted', false)
        .is('parent_post_id', null)
        .order('created_at', { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error('Error fetching recent posts:', error);
        return [];
    }
    
    return data || [];
};

/**
 * Soft delete a post
 */
export const deletePost = async (postId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('posts')
        .update({ 
            is_deleted: true, 
            deleted_at: new Date().toISOString() 
        })
        .eq('id', postId);
    
    if (error) {
        console.error('Error deleting post:', error);
        return false;
    }
    
    return true;
};
