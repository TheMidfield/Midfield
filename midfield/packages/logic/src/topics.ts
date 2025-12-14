import { supabase } from "./supabase";
import type { Topic, TopicType } from "@midfield/types";

/**
 * Get all topics
 */
export const getTopics = async (): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching topics:', error);
        return [];
    }
    
    return data || [];
};

/**
 * Get topic by slug
 */
export const getTopicBySlug = async (slug: string): Promise<Topic | undefined> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
    
    if (error) {
        console.error('Error fetching topic:', error);
        return undefined;
    }
    
    return data || undefined;
};

/**
 * Get all active topics
 */
export const getAllTopics = async (): Promise<Topic[]> => {
    return getTopics();
};

/**
 * Get topics by type (club, player, competition, match, transfer)
 */
export const getTopicsByType = async (type: TopicType): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('follower_count', { ascending: false });
    
    if (error) {
        console.error('Error fetching topics by type:', error);
        return [];
    }
    
    return data || [];
};

/**
 * Get players for a specific club (using topic_relationships)
 */
export const getPlayersByClub = async (clubId: string): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topic_relationships')
        .select(`
            child_topic:topics!topic_relationships_child_topic_id_fkey(*)
        `)
        .eq('parent_topic_id', clubId)
        .eq('relationship_type', 'plays_for')
        .not('valid_until', 'lt', new Date().toISOString()); // Only current relationships
    
    if (error) {
        console.error('Error fetching players by club:', error);
        return [];
    }
    
    // Extract the nested topic data
    return (data?.map((rel: any) => rel.child_topic).filter(Boolean) || []) as Topic[];
};

/**
 * Get clubs by league
 */
export const getClubsByLeague = async (leagueName: string): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('type', 'club')
        .eq('is_active', true)
        .filter('metadata->>league', 'eq', leagueName)
        .order('title', { ascending: true });
    
    if (error) {
        console.error('Error fetching clubs by league:', error);
        return [];
    }
    
    return data || [];
};

/**
 * Get all unique leagues
 */
export const getLeagues = async (): Promise<string[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('metadata')
        .eq('type', 'club')
        .eq('is_active', true);
    
    if (error) {
        console.error('Error fetching leagues:', error);
        return [];
    }
    
    // Extract unique leagues from metadata
    const leagues = new Set<string>();
    data?.forEach((topic: any) => {
        const league = topic.metadata?.league;
        if (league) leagues.add(league);
    });
    
    return Array.from(leagues).sort();
};
