import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@midfield/types/supabase';

// Load environment variables
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Your auth user ID to preserve
const PRESERVE_USER_ID = '61b548b6-f053-40af-b56c-c457bd18eb95';

async function resetDatabase() {
  console.log('🔥 Database Reset Starting...');
  console.log('═'.repeat(60));
  console.log('⚠️  WARNING: This will delete ALL data except your user profile');
  console.log(`✅ Preserving user: ${PRESERVE_USER_ID}`);
  console.log('');

  try {
    // Show current state
    console.log('📊 Current Database State:');
    const { data: beforeStats } = await supabase
      .from('topics')
      .select('type');

    if (beforeStats) {
      const counts = beforeStats.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(counts).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
    }

    const { data: postsBefore } = await supabase.from('posts').select('id', { count: 'exact', head: true });
    const { data: followsBefore } = await supabase.from('follows').select('id', { count: 'exact', head: true });
    const { data: relationshipsBefore } = await supabase.from('topic_relationships').select('id', { count: 'exact', head: true });

    console.log(`   posts: ${postsBefore?.length || 0}`);
    console.log(`   follows: ${followsBefore?.length || 0}`);
    console.log(`   relationships: ${relationshipsBefore?.length || 0}`);
    console.log('');

    // 1. Delete follows (no dependencies)
    console.log('🗑️  Step 1/4: Deleting follows...');
    const { error: followsError } = await supabase
      .from('follows')
      .delete()
      .neq('user_id', 'dummy'); // Delete all

    if (followsError) {
      console.error('   ❌ Error:', followsError);
    } else {
      console.log('   ✅ All follows deleted\n');
    }

    // 2. Delete posts (references topics)
    console.log('🗑️  Step 2/4: Deleting posts...');
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .neq('id', 'dummy'); // Delete all

    if (postsError) {
      console.error('   ❌ Error:', postsError);
    } else {
      console.log('   ✅ All posts deleted\n');
    }

    // 3. Delete topic_relationships (references topics)
    console.log('🗑️  Step 3/4: Deleting topic relationships...');
    const { error: relationshipsError } = await supabase
      .from('topic_relationships')
      .delete()
      .neq('id', 'dummy'); // Delete all

    if (relationshipsError) {
      console.error('   ❌ Error:', relationshipsError);
    } else {
      console.log('   ✅ All relationships deleted\n');
    }

    // 4. Delete topics (parent table)
    console.log('🗑️  Step 4/4: Deleting topics...');
    const { error: topicsError } = await supabase
      .from('topics')
      .delete()
      .neq('id', 'dummy'); // Delete all

    if (topicsError) {
      console.error('   ❌ Error:', topicsError);
    } else {
      console.log('   ✅ All topics deleted\n');
    }

    // Verify cleanup
    console.log('📊 Verifying Reset...');
    const { data: afterTopics } = await supabase.from('topics').select('id', { count: 'exact', head: true });
    const { data: afterPosts } = await supabase.from('posts').select('id', { count: 'exact', head: true });
    const { data: afterFollows } = await supabase.from('follows').select('id', { count: 'exact', head: true });
    const { data: afterRelationships } = await supabase.from('topic_relationships').select('id', { count: 'exact', head: true });

    console.log(`   Topics: ${afterTopics?.length || 0}`);
    console.log(`   Posts: ${afterPosts?.length || 0}`);
    console.log(`   Follows: ${afterFollows?.length || 0}`);
    console.log(`   Relationships: ${afterRelationships?.length || 0}`);
    console.log('');

    // Verify user profile is preserved
    console.log('👤 Verifying User Profile...');
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', PRESERVE_USER_ID)
      .single();

    if (userProfile) {
      console.log(`   ✅ User profile preserved: ${userProfile.username || userProfile.id}`);
    } else {
      console.log('   ⚠️  User profile not found (will be created if needed)');
    }
    console.log('');

    console.log('✨ Database Reset Complete!');
    console.log('═'.repeat(60));
    console.log('✅ Database is now clean and ready for fresh import');
    console.log('');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

resetDatabase();




