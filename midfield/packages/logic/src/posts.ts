// Shared Post Logic
// Accepts supabase client as dependency to be platform-agnostic

export async function createTakeLogic(supabase: any, topicId: string, authorId: string, content: string) {
    const { data, error } = await supabase
        .from('posts')
        .insert({
            topic_id: topicId,
            author_id: authorId,
            content: content.trim(),
            parent_post_id: null,
            root_post_id: null
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating take:', error);
        return { success: false, error: error.message };
    }

    return { success: true, post: data };
}

export async function createReplyLogic(supabase: any, topicId: string, authorId: string, content: string, rootPostId: string, parentPostId: string, replyToId: string | null = null) {
    // Prepare base payload without the optional column
    const basePayload = {
        topic_id: topicId,
        author_id: authorId,
        content: content.trim(),
        parent_post_id: parentPostId,
        root_post_id: rootPostId
    };

    let data, error;

    // OPTION A: If checking reply context, try to insert with the new column
    if (replyToId) {
        const threadedPayload = { ...basePayload, reply_to_post_id: replyToId };

        // Cast to any to avoid TS errors if types are missing the new column
        const res = await supabase
            .from('posts')
            .insert(threadedPayload as any)
            .select()
            .single();

        data = res.data;
        error = res.error;

        // If that failed, assume it might be the missing column and fall back
        if (error) {
            console.warn('Threaded insert failed, retrying plain insert.', error.message);
            // Fallback to base payload
            const retry = await supabase
                .from('posts')
                .insert(basePayload as any)
                .select()
                .single();

            data = retry.data;
            error = retry.error;
        }
    } else {
        // OPTION B: Simple reply, just insert base payload
        const res = await supabase
            .from('posts')
            .insert(basePayload as any)
            .select()
            .single();

        data = res.data;
        error = res.error;
    }

    if (error) {
        console.error('Error creating reply:', error);
        return { success: false, error: `Failed to post reply: ${(error as any).message || 'Unknown error'}` };
    }

    // Increment reply_count on root post manually
    const { data: rootPost } = await supabase.from('posts').select('reply_count').eq('id', rootPostId).single();
    if (rootPost) {
        await supabase
            .from('posts')
            .update({ reply_count: (rootPost.reply_count || 0) + 1 })
            .eq('id', rootPostId);
    }

    return { success: true, post: data };
}

export async function getTakesLogic(supabase: any, topicId: string) {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:users(*, favorite_club:topics!favorite_club_id(*))
        `)
        .eq('topic_id', topicId)
        .eq('is_deleted', false)
        .is('parent_post_id', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching takes:', error);
        return [];
    }

    return data || [];
}

export async function getTakesPaginatedLogic(
    supabase: any,
    topicId: string,
    options?: { cursor?: string; limit?: number }
) {
    const limit = options?.limit || 10;

    let query = supabase
        .from('posts')
        .select(`
            *,
            author:users(*)
        `)
        .eq('topic_id', topicId)
        .eq('is_deleted', false)
        .is('parent_post_id', null)
        .order('created_at', { ascending: false })
        .limit(limit + 1); // Fetch one extra to check if there's more

    // If cursor provided, get posts older than cursor
    if (options?.cursor) {
        query = query.lt('created_at', options.cursor);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching takes:', error);
        return { posts: [], hasMore: false, nextCursor: null };
    }

    const posts = data || [];
    const hasMore = posts.length > limit;

    // Remove the extra item we fetched for hasMore check
    if (hasMore) {
        posts.pop();
    }

    // Next cursor is the created_at of the last post
    const nextCursor = posts.length > 0 ? posts[posts.length - 1].created_at : null;

    return { posts, hasMore, nextCursor };
}

export async function getRepliesLogic(supabase: any, rootPostId: string) {
    // Try fetching with threaded context first
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:users(*),
            reply_to:reply_to_post_id(
                id,
                content,
                author:users!author_id(username)
            )
        `)
        .eq('root_post_id', rootPostId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

    if (error) {
        // FAILSAFE: If fetching with relation fails (missing column), fetch flat
        console.warn('Failed to fetch threaded replies, falling back to flat fetch:', error.message);
        const { data: flatData, error: flatError } = await supabase
            .from('posts')
            .select(`
                *,
                author:users(*)
            `)
            .eq('root_post_id', rootPostId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        if (flatError) {
            console.error('Error fetching replies (fallback):', flatError);
            return [];
        }
        return flatData || [];
    }

    return data || [];
}

export async function updatePostLogic(supabase: any, postId: string, userId: string, content: string) {
    // Verify ownership
    const { data: existingPost } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single();

    if (!existingPost || existingPost.author_id !== userId) {
        return { success: false, error: 'You can only edit your own posts' };
    }

    const { data, error } = await supabase
        .from('posts')
        .update({
            content: content.trim(),
            updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();

    if (error) {
        console.error('Error updating post:', error);
        return { success: false, error: error.message };
    }

    return { success: true, post: data };
}

export async function deletePostLogic(supabase: any, postId: string, userId: string) {
    // Verify ownership
    const { data: existingPost } = await supabase
        .from('posts')
        .select('author_id, root_post_id')
        .eq('id', postId)
        .single();

    if (!existingPost || existingPost.author_id !== userId) {
        return { success: false, error: 'You can only delete your own posts' };
    }

    const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', postId);

    if (error) {
        console.error('Error deleting post:', error);
        return { success: false, error: error.message };
    }

    // If this was a reply, decrement reply_count on root post using SECURITY DEFINER function
    if (existingPost.root_post_id) {
        await supabase.rpc('decrement_reply_count', {
            root_post_id_param: existingPost.root_post_id
        });
    }

    return { success: true };
}
