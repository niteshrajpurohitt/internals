-- ==============================================================================
-- Migration: tighten the auth.users -> profiles trigger
--
-- 1. Fire only when email / user metadata change. Previously it fired on EVERY
--    update to auth.users (each sign-in and token refresh updates that row).
-- 2. Empty strings no longer overwrite an existing full_name / avatar_url
--    (coalesce() never fell back, because the new value was '' rather than NULL).
-- Safe to run more than once.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, user_name)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
        coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'preferred_username', split_part(coalesce(new.email, 'user@domain.com'), '@', 1), 'engineer')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = coalesce(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
        avatar_url = coalesce(NULLIF(EXCLUDED.avatar_url, ''), public.profiles.avatar_url),
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Prevent profile trigger exceptions from aborting auth sign-up transactions
        RAISE WARNING 'handle_new_user trigger error: %', SQLERRM;
        RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE OF email, raw_user_meta_data ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
