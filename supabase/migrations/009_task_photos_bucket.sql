-- Storage bucket for before/after task photos (public read, owner write)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-photos',
  'task-photos',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "task_photos owner insert"  ON storage.objects;
DROP POLICY IF EXISTS "task_photos owner update"  ON storage.objects;
DROP POLICY IF EXISTS "task_photos public read"   ON storage.objects;

CREATE POLICY "task_photos owner insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'task-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "task_photos owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'task-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "task_photos public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'task-photos');
