-- ==============================================================================
-- Migration: Add Full-Text Search (FTS) Column, Auto-Trigger & GIN Index to Posts
-- ==============================================================================

-- 1. Add fts tsvector column
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS fts tsvector;

-- 2. Create trigger function to automatically update fts on insert/update
CREATE OR REPLACE FUNCTION public.posts_fts_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach trigger to public.posts
DROP TRIGGER IF EXISTS trg_posts_fts ON public.posts;
CREATE TRIGGER trg_posts_fts
  BEFORE INSERT OR UPDATE OF title, tags, summary ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.posts_fts_trigger();

-- 4. Backfill all existing posts
UPDATE public.posts 
SET fts = 
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'B') ||
  setweight(to_tsvector('english', coalesce(summary, '')), 'C');

-- 5. Create GIN index for fast lookups
CREATE INDEX IF NOT EXISTS idx_posts_fts ON public.posts USING GIN (fts);
