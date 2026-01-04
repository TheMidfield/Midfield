// Copy and paste this into your browser console on https://www.midfield.one
// This will check why your Paris SG take isn't showing in the hero feed

(async function checkParisSGTake() {
  console.log('%c=== Paris SG Take Diagnostic ===', 'font-size: 16px; font-weight: bold; color: #4CAF50');
  
  // Import Supabase client from your app
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  
  const supabase = createClient(
    'https://oerbyhaqhuixpjrubshm.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmJ5aGFxaHVpeHBqcnVic2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MzI1NTAsImV4cCI6MjA1MDMwODU1MH0.OZ4_zJGc4_vYhcbUbsz9_hDYMLo24pItFGEAHlQtPsI'
  );

  // 1. Check Paris SG topic exists
  console.log('\n%c1. Checking Paris SG Topic...', 'font-weight: bold');
  const { data: parisTopic, error: parisError } = await supabase
    .from('topics')
    .select('id, title, slug, post_count')
    .eq('slug', 'paris-sg-133714')
    .single();

  if (parisError || !parisTopic) {
    console.error('❌ Paris SG topic not found!', parisError);
    return;
  }

  console.log('✅ Found topic:', parisTopic.title);
  console.log('   ID:', parisTopic.id);
  console.log('   Post count:', parisTopic.post_count);

  // 2. Check all posts for Paris SG
  console.log('\n%c2. Checking Posts on Paris SG...', 'font-weight: bold');
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, content, parent_post_id, is_deleted, created_at, author_id, reaction_count')
    .eq('topic_id', parisTopic.id)
    .order('created_at', { ascending: false });

  if (postsError || !posts || posts.length === 0) {
    console.error('❌ No posts found for Paris SG!', postsError);
    return;
  }

  console.log(`✅ Found ${posts.length} post(s)`);
  
  posts.forEach((post, i) => {
    console.log(`\n   Post #${i + 1}:`);
    console.log('   ID:', post.id);
    console.log('   Content length:', post.content?.length, 'chars');
    console.log('   Content:', post.content?.substring(0, 100));
    console.log('   Parent post:', post.parent_post_id ? 'IS A REPLY ❌' : 'Top-level ✅');
    console.log('   Deleted:', post.is_deleted ? 'YES ❌' : 'NO ✅');
    console.log('   Created:', new Date(post.created_at).toLocaleString());
    
    // Check all hero feed conditions
    console.log('\n   %cHero Feed Conditions:', 'font-weight: bold');
    const checks = {
      'Has topic_id': !!parisTopic.id,
      'Is top-level (parent_post_id IS NULL)': !post.parent_post_id,
      'Not deleted (is_deleted = false)': !post.is_deleted,
      'Content length > 5': post.content?.length > 5
    };
    
    let allPass = true;
    Object.entries(checks).forEach(([check, passes]) => {
      console.log(`   ${passes ? '✅' : '❌'} ${check}`);
      if (!passes) allPass = false;
    });
    
    if (allPass) {
      console.log('\n   %c✅ This post SHOULD appear in hero feed!', 'color: green; font-weight: bold');
    } else {
      console.log('\n   %c❌ This post will NOT appear (failed checks above)', 'color: red; font-weight: bold');
    }
  });

  // 3. Run the actual hero query
  console.log('\n%c3. Running Actual Hero Feed Query...', 'font-weight: bold');
  const { data: heroTakes, error: heroError } = await supabase
    .from('posts')
    .select('id, content, created_at, reaction_count, author_id, topic_id')
    .not('topic_id', 'is', null)
    .is('parent_post_id', null)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(20);

  if (heroError) {
    console.error('❌ Hero query error:', heroError);
    return;
  }

  console.log(`✅ Hero query returned ${heroTakes?.length || 0} posts`);
  
  const parisInHero = heroTakes?.find(t => t.topic_id === parisTopic.id);
  if (parisInHero) {
    console.log('\n%c✅ PARIS SG IS IN HERO FEED!', 'color: green; font-size: 14px; font-weight: bold');
    console.log('   Post ID:', parisInHero.id);
    console.log('   Content length:', parisInHero.content.length);
  } else {
    console.log('\n%c❌ Paris SG NOT in hero feed', 'color: red; font-size: 14px; font-weight: bold');
    console.log('\n   Hero feed topics:');
    const topicIds = [...new Set(heroTakes?.map(t => t.topic_id) || [])];
    const { data: topics } = await supabase
      .from('topics')
      .select('id, title, slug')
      .in('id', topicIds);
    
    topics?.forEach(t => {
      const count = heroTakes?.filter(ht => ht.topic_id === t.id).length;
      console.log(`   - ${t.title} (${count} take${count > 1 ? 's' : ''})`);
    });
  }

  // 4. Check ISR cache
  console.log('\n%c4. Cache Check', 'font-weight: bold');
  console.log('⚠️  Homepage has 5-minute ISR cache (revalidate = 300)');
  console.log('   If post is < 5 minutes old, it might be cached out');
  if (posts[0]) {
    const postAge = Date.now() - new Date(posts[0].created_at).getTime();
    const minutes = Math.floor(postAge / 60000);
    console.log(`   Your post is ${minutes} minutes old`);
    if (minutes < 5) {
      console.log('   %c⚠️  Post may be cached out! Wait or force refresh', 'color: orange');
    }
  }

  console.log('\n%c=== End Diagnostic ===', 'font-size: 16px; font-weight: bold');
})();
