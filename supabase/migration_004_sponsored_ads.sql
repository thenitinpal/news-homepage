-- Run this in the Supabase SQL editor. Adds admin-manageable sponsored ads that
-- replace the static "Advertisement" placeholder boxes in the sidebar whenever
-- an active one exists for that slot.

create table if not exists public.sponsored_ads (
  id uuid primary key default gen_random_uuid(),
  advertiser_name text not null,
  image text not null,
  link_url text not null,
  placement text not null, -- 'sidebar-300x250' | 'sidebar-300x600'
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sponsored_ads enable row level security;

-- Public only ever sees ads that are switched on AND currently within their
-- date range. Admins can see every row (including scheduled/expired/paused
-- ones) so the admin dashboard can manage them.
create policy "Public sees only active in-range ads, admins see all"
  on public.sponsored_ads for select
  to anon, authenticated
  using (
    (active and now() >= start_date and now() <= end_date)
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );

create policy "Admins can insert ads"
  on public.sponsored_ads for insert
  to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

create policy "Admins can update ads"
  on public.sponsored_ads for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

create policy "Admins can delete ads"
  on public.sponsored_ads for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

-- Ad banner images reuse the existing "article-images" storage bucket and its
-- existing admin-only upload/delete policies from migration_002 — no new
-- bucket or storage policies needed.
