/**
 * Example: Using Supabase in Midfield
 * 
 * This file demonstrates how to use the typed Supabase client
 * and query functions in your application.
 */

import { supabase, getTopicsByType, getPostsByTopic, getPlayersByClub } from '@midfield/logic';
import type { Topic, Post, TopicInsert, PostInsert } from '@midfield/types';

// ============================================================================
// Example 1: Query Topics
// ============================================================================

async function exampleQueryTopics() {
  // Get all clubs
  const clubs = await getTopicsByType('club');
  console.log('Clubs:', clubs);

  // Get all players
  const players = await getTopicsByType('player');
  console.log('Players:', players);

  // Direct query with full type safety
  const { data: competitions } = await supabase
    .from('topics')
    .select('*')
    .eq('type', 'competition')
    .eq('is_active', true);
  
  console.log('Competitions:', competitions);
}

// ============================================================================
// Example 2: Create a Post
// ============================================================================

async function exampleCreatePost() {
  const newPost: PostInsert = {
    topic_id: '20000000-0000-0000-0000-000000000001', // Mohamed Salah
    author_id: '00000000-0000-0000-0000-000000000001', // football_fanatic
    content: 'Salah with another incredible performance! 🔥',
  };

  const { data, error } = await supabase
    .from('posts')
    .insert(newPost)
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return;
  }

  console.log('Post created:', data);
}

// ============================================================================
// Example 3: Query Relationships (Graph Layer)
// ============================================================================

async function exampleQueryRelationships() {
  const liverpoolId = '10000000-0000-0000-0000-000000000001';

  // Get all players for Liverpool FC
  const players = await getPlayersByClub(liverpoolId);
  console.log('Liverpool players:', players);

  // Get all competitions Liverpool competes in
  const { data: competitions } = await supabase
    .from('topic_relationships')
    .select(`
      parent_topic:topics!topic_relationships_parent_topic_id_fkey(*)
    `)
    .eq('child_topic_id', liverpoolId)
    .eq('relationship_type', 'competes_in');

  console.log('Liverpool competitions:', competitions);
}

// ============================================================================
// Example 4: Get Posts for a Topic (with Author)
// ============================================================================

async function exampleGetPostsWithAuthor() {
  const salahTopicId = '20000000-0000-0000-0000-000000000001';

  const posts = await getPostsByTopic(salahTopicId);
  console.log('Posts about Salah:', posts);

  // Each post includes author data thanks to the join
  // posts[0].author will be fully typed User object
}

// ============================================================================
// Example 5: Thread a Post (Reply)
// ============================================================================

async function exampleThreadPost() {
  const parentPostId = '60000000-0000-0000-0000-000000000001';

  const reply: PostInsert = {
    topic_id: '20000000-0000-0000-0000-000000000001', // Same topic
    author_id: '00000000-0000-0000-0000-000000000002',
    content: 'Totally agree! His consistency is unmatched.',
    parent_post_id: parentPostId,
    root_post_id: parentPostId, // Same as parent for first-level reply
  };

  const { data, error } = await supabase
    .from('posts')
    .insert(reply)
    .select()
    .single();

  if (error) {
    console.error('Error creating reply:', error);
    return;
  }

  console.log('Reply created:', data);
}

// ============================================================================
// Example 6: Follow a Topic
// ============================================================================

async function exampleFollowTopic() {
  const userId = '00000000-0000-0000-0000-000000000001';
  const topicId = '10000000-0000-0000-0000-000000000001'; // Liverpool FC

  const { error } = await supabase
    .from('follows')
    .insert({ user_id: userId, topic_id: topicId });

  if (error) {
    console.error('Error following topic:', error);
    return;
  }

  console.log('Successfully followed topic!');

  // Get user's follows
  const { data: follows } = await supabase
    .from('follows')
    .select(`
      *,
      topic:topics(*)
    `)
    .eq('user_id', userId);

  console.log('User follows:', follows);
}

// ============================================================================
// Example 7: Unified Feed (Posts from Followed Topics)
// ============================================================================

async function exampleUnifiedFeed() {
  const userId = '00000000-0000-0000-0000-000000000001';

  // Get user's followed topic IDs
  const { data: follows } = await supabase
    .from('follows')
    .select('topic_id')
    .eq('user_id', userId);

  const followedTopicIds = follows?.map(f => f.topic_id) || [];

  // Get posts from followed topics
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(*),
      topic:topics(*)
    `)
    .in('topic_id', followedTopicIds)
    .eq('is_deleted', false)
    .is('parent_post_id', null)
    .order('created_at', { ascending: false })
    .limit(20);

  console.log('Unified feed:', posts);
}

// ============================================================================
// Run Examples
// ============================================================================

export async function runExamples() {
  console.log('🚀 Running Supabase examples...\n');
  
  await exampleQueryTopics();
  await exampleQueryRelationships();
  await exampleGetPostsWithAuthor();
  
  console.log('\n✅ Examples complete!');
}

// Uncomment to run:
// runExamples();
