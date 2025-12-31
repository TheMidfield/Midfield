-- Enforce clean metadata in topics (no base64 images within JSON)
-- This casts the JSONB column to text and checks for the 'data:image' pattern
ALTER TABLE topics ADD CONSTRAINT no_base64_metadata 
    CHECK (NOT (metadata::text LIKE '%data:image%'));

-- Enforce post content length limit (2000 chars max)
-- Application limit is 1000, DB limit provides a 2x safety buffer
ALTER TABLE posts ADD CONSTRAINT content_length_limit 
    CHECK (length(content) <= 2000);

-- Enforce bio length limit (500 chars max)
ALTER TABLE users ADD CONSTRAINT bio_length_limit 
    CHECK (length(bio) <= 500);
