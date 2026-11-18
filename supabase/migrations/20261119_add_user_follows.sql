-- ==============================================================================
-- Migration: add user_follows (follow companies / categories for "Following")
-- Safe to run more than once.
-- ==============================================================================

-- One row per followed company OR category (exactly one of the two is set).
-- category holds the display name used in posts.tags filtering, e.g. 'Postmortems'.
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT user_follows_one_target CHECK (
        (company_id IS NOT NULL AND category IS NULL) OR
        (company_id IS NULL AND category IS NOT NULL)
    ),
    CONSTRAINT user_follows_category_valid CHECK (
        category IS NULL OR category IN (
            'Classics', 'Postmortems', 'AI & Machine Learning', 'Distributed Systems',
            'Databases & Storage', 'Infrastructure & Cloud', 'Low-Level & Compilers',
            'Web & Platforms'
        )
    ),
    UNIQUE (user_id, company_id),
    UNIQUE (user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_user_id ON public.user_follows(user_id);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own follows" ON public.user_follows;
CREATE POLICY "Users can manage their own follows"
ON public.user_follows
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
