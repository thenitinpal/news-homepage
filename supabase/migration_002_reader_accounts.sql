-- Run this in the Supabase SQL editor AFTER schema.sql has already been run once.
-- Adds public reader accounts (sign-up, saved articles, comments, newsletter capture,
-- personalized feed) on top of the existing admin-only articles table.
--
-- After running this file, see the two manual follow-up steps at the bottom.

-- 1. Reader profiles ----------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  is_admin boolean not null default false,
  preferred_categories text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Stop a reader from granting themselves admin via a client-side profile update.
create or replace function public.prevent_self_admin_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin and old.is_admin = false then
    new.is_admin := false;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_update_guard on public.profiles;
create trigger on_profile_update_guard
  before update on public.profiles
  for each row execute function public.prevent_self_admin_escalation();

-- 2. Tighten articles + storage policies to admins only -----------------------

drop policy if exists "Authenticated users can insert articles" on public.articles;
drop policy if exists "Authenticated users can update articles" on public.articles;
drop policy if exists "Authenticated users can delete articles" on public.articles;

create policy "Admins can insert articles"
  on public.articles for insert
  to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

create policy "Admins can update articles"
  on public.articles for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

create policy "Admins can delete articles"
  on public.articles for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

drop policy if exists "Authenticated users can upload article images" on storage.objects;
drop policy if exists "Authenticated users can delete article images" on storage.objects;

create policy "Admins can upload article images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'article-images'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );

create policy "Admins can delete article images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'article-images'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );

-- 3. Saved articles -------------------------------------------------------------

create table if not exists public.saved_articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, article_id)
);

alter table public.saved_articles enable row level security;

create policy "Users manage their own saved articles"
  on public.saved_articles for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Comments ---------------------------------------------------------------

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Public can read comments"
  on public.comments for select
  to anon, authenticated
  using (true);

create policy "Users can post their own comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Authors and admins can delete comments"
  on public.comments for delete
  to authenticated
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );

-- 5. Newsletter capture -------------------------------------------------------

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

create policy "Users can see their own subscription"
  on public.newsletter_subscribers for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can cancel their own subscription"
  on public.newsletter_subscribers for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- MANUAL FOLLOW-UP STEPS (do these after running everything above):
--
-- 1. Flip your existing admin account to is_admin = true (the trigger only
--    creates new profile rows for FUTURE sign-ups, so your original admin user
--    needs a one-off row/update). Replace the email below with your real
--    admin login email, then run:
--
--    insert into public.profiles (id, display_name, is_admin)
--    select id, 'Admin', true from auth.users where email = 'your-admin-email@example.com'
--    on conflict (id) do update set is_admin = true;
--
-- 2. In the dashboard: Authentication -> Settings -> turn OFF "Confirm email",
--    so new reader sign-ups can log in immediately without an email step.
-- ============================================================================
