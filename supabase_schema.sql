-- ============================================
-- CRESLA Database Schema (Zimbabwe & USD Edition)
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  account_type text default 'tenant' check (account_type in ('tenant', 'landlord', 'agent', 'admin')),
  avatar_url text,
  bio text,
  phone text,
  city text default 'Harare',
  country text default 'Zimbabwe',
  verified boolean default false,
  rating numeric(2,1) default 0,
  properties_count integer default 0,
  response_time text default '< 2 hours',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger to auto-create a profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, account_type, avatar_url, country, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'tenant', -- Default to tenant for all users
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'Zimbabwe',
    'Harare'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. PROPERTIES TABLE
create table if not exists public.properties (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price numeric not null,
  price_type text default 'rent' check (price_type in ('sale', 'rent')),
  currency text default '$',
  type text default 'Apartment',
  category text default 'Residential',
  bedrooms integer default 0,
  bathrooms integer default 0,
  parking integer default 0,
  size numeric default 0,
  size_unit text default 'sqm',
  furnished boolean default false,
  pet_friendly boolean default false,
  images text[] default '{}',
  address text,
  suburb text,
  city text default 'Harare',
  province text default 'Harare Province',
  country text default 'Zimbabwe',
  lat numeric,
  lng numeric,
  amenities text[] default '{}',
  available boolean default true,
  available_date date,
  date_posted timestamptz default now(),
  views integer default 0,
  saves integer default 0,
  rating numeric(2,1) default 0,
  review_count integer default 0,
  verified boolean default false,
  featured boolean default false,
  landlord_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.properties enable row level security;

create policy "Properties are viewable by everyone"
  on public.properties for select
  using (true);

create policy "Authenticated users can insert properties"
  on public.properties for insert
  with check (auth.uid() = landlord_id);

create policy "Owners can update their own properties"
  on public.properties for update
  using (auth.uid() = landlord_id);

create policy "Owners can delete their own properties"
  on public.properties for delete
  using (auth.uid() = landlord_id);


-- 3. FAVORITES TABLE
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, property_id)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can add favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can remove favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);


-- 4. MESSAGES TABLE
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete set null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Receivers can mark messages as read"
  on public.messages for update
  using (auth.uid() = receiver_id);


-- 5. REVIEWS TABLE
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Authenticated users can add reviews"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);


-- 6. REPORTS TABLE (Scam & Abuse Flagging)
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  status text default 'pending' check (status in ('pending', 'in_review', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);

alter table public.reports enable row level security;

create policy "Users can view their own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

create policy "Authenticated users can submit reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);
