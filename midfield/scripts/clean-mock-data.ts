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

// Mock data ID patterns (UUIDs starting with specific prefixes)
const MOCK_ID_PATTERNS = [
  '10000000-%', // Clubs
  '20000000-%', // Players
  '30000000-%', // Competitions
  '40000000-%', // Matches
  '50000000-%'  // Transfers
];

async function cleanMockData() {
  console.log('🧹 Starting Mock Data Cleanup...');
  console.log('═'.repeat(50));
  console.log('⚠️  This will delete all mock data (IDs starting with 10000000-, 20000000-, etc.)');
  console.log('✅ Your user profile and TheSportsDB imports will be preserved\n');

  try {
    // 1. Delete follows (no FK constraints)
    console.log('🗑️  Deleting mock follows...');
    for (const pattern of MOCK_ID_PATTERNS) {
      await supabase.from('follows').delete().like('topic_id', pattern);
    }
    console.log('   ✅ Mock follows deleted\n');

    // 2. Delete posts (references topics)
    console.log('🗑️  Deleting mock posts...');
    for (const pattern of MOCK_ID_PATTERNS) {
      await supabase.from('posts').delete().like('topic_id', pattern);
    }
    console.log('   ✅ Mock posts deleted\n');

    // 3. Delete topic_relationships (references topics)
    console.log('🗑️  Deleting mock topic relationships...');
    for (const pattern of MOCK_ID_PATTERNS) {
      await supabase.from('topic_relationships').delete().like('parent_topic_id', pattern);
      await supabase.from('topic_relationships').delete().like('child_topic_id', pattern);
    }
    console.log('   ✅ Mock relationships deleted\n');

    // 4. Delete topics (parent table)
    console.log('🗑️  Deleting mock topics...');
    for (const pattern of MOCK_ID_PATTERNS) {
      const { error } = await supabase.from('topics').delete().like('id', pattern);
      if (error) {
        console.error(`   ❌ Error deleting topics with pattern ${pattern}:`, error);
      }
    }
    console.log('   ✅ Mock topics deleted\n');

    // 5. Verify cleanup
    console.log('📊 Verifying cleanup...');
    const { data: remainingMock, error: verifyError } = await supabase
      .from('topics')
      .select('id, type, title')
      .or(MOCK_ID_PATTERNS.map(p => `id.like.${p}`).join(','));

    if (verifyError) {
      console.error('   ❌ Error verifying:', verifyError);
    } else {
      console.log(`   Remaining mock topics: ${remainingMock?.length || 0}\n`);
    }

    // 6. Show current state
    const { data: stats, error: statsError } = await supabase
      .from('topics')
      .select('type')
      .eq('is_active', true);

    if (!statsError && stats) {
      const counts = stats.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('✨ Cleanup Complete!');
      console.log('═'.repeat(50));
      console.log('📊 Remaining Topics:');
      Object.entries(counts).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
      console.log('═'.repeat(50));
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

cleanMockData();


