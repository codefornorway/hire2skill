-- Storage bucket for identity verification documents (private)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'id-documents',
  'id-documents',
  false,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Drop policies first so re-running is safe
DROP POLICY IF EXISTS "id_docs owner insert"  ON storage.objects;
DROP POLICY IF EXISTS "id_docs owner select"  ON storage.objects;
DROP POLICY IF EXISTS "id_docs owner update"  ON storage.objects;
DROP POLICY IF EXISTS "id_docs admin read"    ON storage.objects;

-- Users can upload/update only inside their own folder
CREATE POLICY "id_docs owner insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'id-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "id_docs owner select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'id-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "id_docs owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'id-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can read any document
CREATE POLICY "id_docs admin read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'id-documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
