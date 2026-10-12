insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('dream-audio', 'dream-audio', false, 26214400,
    array['audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/webm']),
  ('dream-images', 'dream-images', false, 10485760,
    array['image/jpeg', 'image/png', 'image/webp']);

create policy dream_media_read_own on storage.objects for select to authenticated using (
  bucket_id in ('dream-audio', 'dream-images')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy dream_audio_upload_own on storage.objects for insert to authenticated with check (
  bucket_id = 'dream-audio'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.dreams d
    where d.id::text = (storage.foldername(name))[2] and d.user_id = (select auth.uid())
  )
);
create policy dream_media_delete_own on storage.objects for delete to authenticated using (
  bucket_id in ('dream-audio', 'dream-images')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
-- Image uploads and media-path assignment are server-only.
-- Account and dream deletion must remove Storage objects through the Storage API.
