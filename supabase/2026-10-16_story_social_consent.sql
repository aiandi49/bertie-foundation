-- Share Your Story: social media links and sharing consent.
-- Run once in Supabase → SQL Editor BEFORE deploying the story-social-consent branch.
ALTER TABLE public.success_stories
  ADD COLUMN IF NOT EXISTS social_links      TEXT,
  ADD COLUMN IF NOT EXISTS social_consent    BOOLEAN,
  ADD COLUMN IF NOT EXISTS social_consent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.success_stories.social_consent IS
  'Answer to: Do you consent to the Bertie Foundation sharing your story on its social media pages?';

-- Make sure the website can save the new fields (no change if this already exists).
ALTER TABLE public.success_stories ADD COLUMN IF NOT EXISTS tags TEXT[];
