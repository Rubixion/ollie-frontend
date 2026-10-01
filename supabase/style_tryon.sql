-- Public bucket for /style try-on renders on the model (app/api/style-model/route.ts).
-- Only the server (service role key) writes; anyone can read, since the images show a fictional model, never a user.
-- Run once in the Supabase SQL editor, only after /style testing is done (owner's call, 2026-09-30).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tryon', 'tryon', true, 5242880, array['image/jpeg'])
on conflict (id) do nothing;
