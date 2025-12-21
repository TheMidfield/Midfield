-- Add SECURITY DEFINER function to safely decrement reply counts
-- This allows bypassing RLS when a user deletes their reply on someone else's post

CREATE OR REPLACE FUNCTION decrement_reply_count(root_post_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE posts 
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = root_post_id_param;
END;
$$;
