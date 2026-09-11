-- ==========================================================
-- CRESLA: Storage & MVP Schema Updates
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==========================================================

-- 1. Create Storage Bucket for Property Images
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update set public = true;

-- Storage Policies for property-images
drop policy if exists "Public property images access" on storage.objects;
create policy "Public property images access"
  on storage.objects for select
  using (bucket_id = 'property-images');

drop policy if exists "Authenticated users can upload property images" on storage.objects;
create policy "Authenticated users can upload property images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-images');

drop policy if exists "Users can update their own property images" on storage.objects;
create policy "Users can update their own property images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-images');

drop policy if exists "Users can delete their own property images" on storage.objects;
create policy "Users can delete their own property images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images');

-- 2. Verify and enhance properties table RLS
alter table public.properties enable row level security;

-- Ensure landlord_id allows insert by the authenticated user
drop policy if exists "Authenticated users can insert properties" on public.properties;
create policy "Authenticated users can insert properties"
  on public.properties for insert
  to authenticated
  with check (auth.uid() = landlord_id);

drop policy if exists "Owners can update their own properties" on public.properties;
create policy "Owners can update their own properties"
  on public.properties for update
  to authenticated
  using (auth.uid() = landlord_id);

drop policy if exists "Owners can delete their own properties" on public.properties;
create policy "Owners can delete their own properties"
  on public.properties for delete
  to authenticated
  using (auth.uid() = landlord_id);

-- 3. Messages Realtime configuration
-- Enable Realtime on the messages table so chats update live
alter publication supabase_realtime add table public.messages;
