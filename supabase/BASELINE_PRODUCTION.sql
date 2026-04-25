-- Hire2Skill production baseline (idempotent)
-- Run in Supabase SQL Editor for new environments.

BEGIN;

-- Core profile fields used by app
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS hourly_rate integer,
  ADD COLUMN IF NOT EXISTS categories text[],
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS video_intro_url text,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS brings_tools boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_invoice boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS notifications jsonb,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS verification_doc_url text,
  ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_note text,
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avg_rating numeric(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

COMMENT ON COLUMN public.profiles.languages IS 'Languages helper can use with clients, e.g. no,en';
COMMENT ON COLUMN public.profiles.brings_tools IS 'Whether helper brings own tools/equipment';
COMMENT ON COLUMN public.profiles.can_invoice IS 'Whether helper can invoice (typically VAT/business)';

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keep verified flag in sync with verification status
CREATE OR REPLACE FUNCTION public.sync_verified_flag()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.verified := (NEW.verification_status = 'verified');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_verified ON public.profiles;
CREATE TRIGGER trg_sync_verified
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_verified_flag();

-- Reviews + rating aggregation
CREATE TABLE IF NOT EXISTS public.reviews (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   uuid        NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating       smallint    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, reviewer_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;

CREATE POLICY "reviews_select_all"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE OR REPLACE FUNCTION public.sync_profile_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  target uuid := COALESCE(
    CASE WHEN TG_OP = 'DELETE' THEN OLD.reviewee_id ELSE NEW.reviewee_id END,
    OLD.reviewee_id
  );
BEGIN
  UPDATE public.profiles
  SET
    avg_rating   = COALESCE((SELECT round(avg(rating)::numeric, 2) FROM public.reviews WHERE reviewee_id = target), 0),
    review_count = (SELECT count(*) FROM public.reviews WHERE reviewee_id = target)
  WHERE id = target;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_rating ON public.reviews;
CREATE TRIGGER trg_sync_profile_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_rating();

-- Push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL,
  p256dh     text NOT NULL,
  auth       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own push subs" ON public.push_subscriptions;
CREATE POLICY "users manage own push subs"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'id-documents',
  'id-documents',
  false,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-photos',
  'task-photos',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: avatars
DROP POLICY IF EXISTS "avatars public read" ON storage.objects;
DROP POLICY IF EXISTS "avatars owner upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars owner update" ON storage.objects;
DROP POLICY IF EXISTS "avatars owner delete" ON storage.objects;

CREATE POLICY "avatars public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars owner upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars owner update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies: id-documents
DROP POLICY IF EXISTS "id_docs owner insert" ON storage.objects;
DROP POLICY IF EXISTS "id_docs owner select" ON storage.objects;
DROP POLICY IF EXISTS "id_docs owner update" ON storage.objects;
DROP POLICY IF EXISTS "id_docs admin read" ON storage.objects;

CREATE POLICY "id_docs owner insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'id-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "id_docs owner select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'id-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "id_docs owner update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'id-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "id_docs admin read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'id-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Storage policies: task-photos
DROP POLICY IF EXISTS "task_photos owner insert" ON storage.objects;
DROP POLICY IF EXISTS "task_photos owner update" ON storage.objects;
DROP POLICY IF EXISTS "task_photos public read" ON storage.objects;

CREATE POLICY "task_photos owner insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'task-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "task_photos owner update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'task-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "task_photos public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'task-photos');

-- Disable legacy DB->Edge notification triggers (app now uses /api/notify)
DROP TRIGGER IF EXISTS trg_notify_new_booking ON public.bookings;
DROP TRIGGER IF EXISTS trg_notify_booking_accepted ON public.bookings;
DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;

DROP FUNCTION IF EXISTS public.trg_notify_new_booking();
DROP FUNCTION IF EXISTS public.trg_notify_booking_accepted();
DROP FUNCTION IF EXISTS public.trg_notify_new_message();

COMMIT;

