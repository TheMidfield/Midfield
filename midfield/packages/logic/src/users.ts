import { supabase } from "./supabase";
import type { User, UserInsert } from "@midfield/types";

/**
 * Get user by ID
 */
export const getUser = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }
    
    return data;
};

/**
 * Get user by username
 */
export const getUserByUsername = async (username: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
    
    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }
    
    return data;
};

/**
 * Create or update user profile
 */
export const upsertUser = async (user: UserInsert): Promise<User | null> => {
    const { data, error } = await supabase
        .from('users')
        .upsert(user)
        .select()
        .single();
    
    if (error) {
        console.error('Error upserting user:', error);
        return null;
    }
    
    return data;
};

/**
 * Get topics followed by a user
 */
export const getUserFollows = async (userId: string) => {
    const { data, error } = await supabase
        .from('follows')
        .select(`
            *,
            topic:topics(*)
        `)
        .eq('user_id', userId);
    
    if (error) {
        console.error('Error fetching user follows:', error);
        return [];
    }
    
    return data || [];
};
