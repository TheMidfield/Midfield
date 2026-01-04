import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://oerbyhaqhuixpjrubshm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmJ5aGFxaHVpeHBqcnVic2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MzI1NTAsImV4cCI6MjA1MDMwODU1MH0.OZ4_zJGc4_vYhcbUbsz9_hDYMLo24pItFGEAHlQtPsI'
);

async function checkParisSGPost() {
  console.log('=== Connection Test ===\n');
  
  // First, test the connection and check topics table
  const { data: topicsCount, error: topicsError } = await supabase
    .from('topics')
    .select('id', { count: 'exact', head: true });
  
  console.log(`Topics table count: ${topicsCount}`);
  if (topicsError) console.log('Topics error:', topicsError);

  // Check for Paris SG topic specifically
  const { data: parisTopic, error: parisError } = await supabase
    .from('topics')
    .select('id, title, slug, post_count')
    .eq('slug', 'paris-sg-133714')
    .maybeSingle();
  
  console.log('\nParis SG Topic:');
  if (parisError) {
    console.log('Error:', parisError);
  } else if (!parisTopic) {
    console.log('❌ Topic not found with slug paris-sg-133714');
  } else {
    console.log(`✅ Found: ${parisTopic.title}`);
    console.log(`   ID: ${parisTopic.id}`);
    console.log(`   Post Count: ${parisTopic.post_count}`);
  }

  console.log('\n=== Checking All Recent Posts ===\n');

  // Get all recent posts
  const { data: allPosts, error: postsError } = await supabase
    .from('posts')
    .select('id, content, topic_id, parent_post_id, is_deleted, created_at, author_id')
    .order('created_at', { ascending: false })
    .limit(20);

  if (postsError) {
    console.log('Error fetching posts:', postsError);
    return;
  }

  console.log(`Found ${allPosts?.length || 0} recent posts total:\n`);
  
  if (!allPosts || allPosts.length === 0) {
    console.log('⚠️  No posts found. This could mean:');
    console.log('   1. Database is empty');
    console.log('   2. RLS is blocking (unlikely - policy allows public SELECT)');
    console.log('   3. Connection issue');
    return;
  }

  allPosts?.forEach((post, i) => {
    console.log(`${i + 1}. Post ID: ${post.id}`);
    console.log(`   Content: ${post.content.substring(0, 60)}...`);
    console.log(`   Topic ID: ${post.topic_id || 'NULL'}`);
    console.log(`   Parent Post ID: ${post.parent_post_id || 'NULL (top-level)'}`);
    console.log(`   Is Deleted: ${post.is_deleted}`);
    console.log(`   Created: ${post.created_at}`);
    console.log('');
  });

  // Check what getAnyRecentTakes would return (the actual hero query)
  const { data: heroTakes, error: heroError } = await supabase
    .from('posts')
    .select('id, content, created_at, reaction_count, author_id, topic_id')
    .not('topic_id', 'is', null)
    .is('parent_post_id', null)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(20);

  console.log('\n=== Hero Takes Query Results (what SHOULD appear in feed) ===');
  
  if (heroError) {
    console.log('Error:', heroError);
    return;
  }

  if (heroTakes && heroTakes.length > 0) {
    console.log(`✅ Found ${heroTakes.length} posts matching hero query\n`);
    heroTakes.forEach((p, i) => {
      const contentPreview = p.content.substring(0, 50);
      const length = p.content.length;
      const passesFilter = length > 5 ? '✅' : '❌ TOO SHORT';
      console.log(`${i + 1}. ${p.id} [${passesFilter}]`);
      console.log(`   Content (${length} chars): ${contentPreview}...`);
      console.log(`   Topic: ${p.topic_id}`);
      console.log(`   Created: ${p.created_at}`);
      console.log('');
    });
  } else {
    console.log('❌ No hero takes found!');
  }

  // Get topic details for the hero takes
  if (heroTakes && heroTakes.length > 0) {
    const topicIds = [...new Set(heroTakes.map(p => p.topic_id).filter(Boolean))];
    if (topicIds.length > 0) {
      const { data: topics } = await supabase
        .from('topics')
        .select('id, title, slug')
        .in('id', topicIds);

      console.log('\n=== Topics in Hero Feed ===');
      topics?.forEach(t => {
        const postCount = heroTakes.filter(p => p.topic_id === t.id).length;
        console.log(`  - ${t.title} (${t.slug}): ${postCount} post(s)`);
      });
      
      // Check if Paris SG is in the list
      const parisInFeed = topics?.find(t => t.slug === 'paris-sg-133714');
      if (parisInFeed) {
        console.log('\n✅ Paris SG IS in the hero feed!');
      } else {
        console.log('\n❌ Paris SG is NOT in the hero feed');
      }
    }
  }
}

checkParisSGPost().catch(console.error);
