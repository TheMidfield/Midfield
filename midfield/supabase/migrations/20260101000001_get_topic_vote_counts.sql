-- Create a function to get vote counts for a list of topics
create or replace function get_topic_vote_counts(topic_ids uuid[])
returns table (
  topic_id uuid,
  upvotes bigint,
  downvotes bigint
) 
language sql
as $$
  select 
    topic_id,
    count(*) filter (where vote_type = 'upvote') as upvotes,
    count(*) filter (where vote_type = 'downvote') as downvotes
  from topic_votes
  where topic_id = any(topic_ids)
  group by topic_id;
$$;
