-- Purge existing Base64 avatars (reclaim Egress)
UPDATE users 
SET avatar_url = NULL 
WHERE avatar_url LIKE 'data:image%';

-- Add constraint to prevent future Base64 uploads
ALTER TABLE users 
ADD CONSTRAINT no_base64_avatars 
CHECK (avatar_url IS NULL OR NOT avatar_url LIKE 'data:image%');
