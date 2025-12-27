"use server";

import { createClient } from "@/lib/supabase/server";
import { getTopicBySlug, getPlayersByClub, getPlayerClub, getClubsByLeague, getTopicsByType } from "@midfield/logic/src/topics";

export type WidgetEntity = {
    id: string;
    title: string;
    slug: string;
    type: string;
    imageUrl?: string;
    relation?: string;
};

export type WidgetTake = {
    id: string;
    title: string; // content truncated
    author: {
        name: string;
        handle: string;
        avatar?: string;
    };
    likes: number;
    comments: number;
    timeAgo: string;
};

export async function getTrendingTopicsData() {
    const supabase = await createClient();

    // Fetch top topics by post_count
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('is_active', true)
        .order('post_count', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching trending:", error);
        return [];
    }

    return data.map((topic, index) => ({
        id: topic.id,
        rank: index + 1,
        tag: topic.title,
        slug: topic.slug,
        posts: topic.post_count + " posts", // format number nicely if needed
        isRising: index < 2 // Simple logic for now
    }));
}

export async function getRelatedTopicsData(slug?: string) {
    if (!slug) return { entities: [], takes: [] };

    const topic = await getTopicBySlug(slug);
    if (!topic) return { entities: [], takes: [] };

    let entities: WidgetEntity[] = [];

    // 1. Fetch Related Entities based on type
    if (topic.type === 'club') {
        const players = await getPlayersByClub(topic.id);
        entities = players.slice(0, 8).map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            type: p.type,
            imageUrl: (p.metadata as any)?.photo_url || (p.metadata as any)?.badge_url,
            relation: (p.metadata as any)?.position || "Player"
        }));
    } else if (topic.type === 'player') {
        const club = await getPlayerClub(topic.id);
        if (club) {
            entities.push({
                id: club.id,
                title: club.title,
                slug: club.slug,
                type: club.type,
                imageUrl: (club.metadata as any)?.badge_url,
                relation: "Club"
            });

            // Get Teammates
            const teammates = await getPlayersByClub(club.id);
            const others = teammates
                .filter(t => t.id !== topic.id)
                .slice(0, 7)
                .map(t => ({
                    id: t.id,
                    title: t.title,
                    slug: t.slug,
                    type: t.type,
                    imageUrl: (t.metadata as any)?.photo_url,
                    relation: "Teammate"
                }));
            entities = [...entities, ...others];
        }
    } else if (topic.type === 'league') {
        const clubs = await getClubsByLeague((topic.metadata as any)?.league || topic.title);
        entities = clubs.slice(0, 8).map(c => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            type: c.type,
            imageUrl: (c.metadata as any)?.badge_url,
            relation: "Club"
        }));
    }

    // 2. Fetch Related Takes
    // Query posts for this topic
    const supabase = await createClient();
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            id, 
            content, 
            reaction_count, 
            reply_count, 
            created_at,
            author:users!posts_author_id_fkey(username, avatar_url)
        `)
        .eq('topic_id', topic.id)
        .order('reaction_count', { ascending: false })
        .limit(5);

    const takes: WidgetTake[] = (posts || []).map((post: any) => ({
        id: post.id,
        title: post.content, // content is "title" for takes
        author: {
            name: post.author?.username || "User",
            handle: "@" + (post.author?.username?.toLowerCase() || "user"),
            avatar: post.author?.avatar_url
        },
        likes: post.reaction_count || 0,
        comments: post.reply_count || 0,
        timeAgo: new Date(post.created_at).toLocaleDateString() // Simplification
    }));

    return { entities, takes };
}
