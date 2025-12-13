/**
 * Seed script for Midfield database
 * 
 * Usage:
 *   npx tsx scripts/seed-supabase.ts
 * 
 * This script populates the database with sample mock data for testing.
 * Run this to quickly get started with realistic data.
 */

// Load .env BEFORE any other imports that might use env vars
import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@midfield/types/supabase';
// Import mock data directly (not through @midfield/logic to avoid loading supabase client)
import { mockData } from '../packages/logic/src/mock-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // 1. Clear existing data (in reverse dependency order)
    console.log('🧹 Clearing existing data...');
    await supabase.from('follows').delete().neq('user_id', '');
    await supabase.from('posts').delete().neq('id', '');
    await supabase.from('topic_relationships').delete().neq('id', '');
    await supabase.from('topics').delete().neq('id', '');
    console.log('✅ Existing data cleared\n');

    // 2. Upsert user profile (auth user already exists)
    console.log(`📝 Upserting ${mockData.users.length} user profile...`);
    const { error: usersError } = await supabase.from('users').upsert(mockData.users, { onConflict: 'id' });
    if (usersError) throw new Error(`Users: ${usersError.message}`);
    console.log('✅ User profile upserted\n');

    // 3. Upsert topics (handles duplicates)
    console.log(`📝 Upserting ${mockData.topics.length} topics...`);
    const { error: topicsError } = await supabase.from('topics').upsert(mockData.topics, { onConflict: 'id' });
    if (topicsError) throw new Error(`Topics: ${topicsError.message}`);
    console.log('✅ Topics upserted\n');

    // 4. Upsert topic relationships (composite unique key)
    console.log(`📝 Upserting ${mockData.topicRelationships.length} topic relationships...`);
    const { error: relationshipsError } = await supabase.from('topic_relationships').upsert(mockData.topicRelationships, { 
      onConflict: 'parent_topic_id,child_topic_id,relationship_type' 
    });
    if (relationshipsError) throw new Error(`Relationships: ${relationshipsError.message}`);
    console.log('✅ Topic relationships upserted\n');

    // 5. Upsert posts
    console.log(`📝 Upserting ${mockData.posts.length} posts...`);
    const { error: postsError } = await supabase.from('posts').upsert(mockData.posts, { onConflict: 'id' });
    if (postsError) throw new Error(`Posts: ${postsError.message}`);
    console.log('✅ Posts upserted\n');

    // 6. Upsert follows
    console.log(`📝 Upserting ${mockData.follows.length} follows...`);
    const { error: followsError } = await supabase.from('follows').upsert(mockData.follows, { onConflict: 'user_id,topic_id' });
    if (followsError) throw new Error(`Follows: ${followsError.message}`);
    console.log('✅ Follows upserted\n');

    // Summary
    console.log('🎉 Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${mockData.users.length} user profile`);
    console.log(`   - ${mockData.topics.length} topics (clubs, players, competitions, matches, transfers)`);
    console.log(`   - ${mockData.topicRelationships.length} relationships (graph layer)`);
    console.log(`   - ${mockData.posts.length} posts (with threads)`);
    console.log(`   - ${mockData.follows.length} follows`);
    console.log('\n✨ Your Midfield database is ready to go!');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed
seed();
