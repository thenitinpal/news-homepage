-- Run this in the Supabase SQL editor. Adds a real Contact Us form that saves
-- submissions for admins to review at /admin/messages.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read contact messages"
  on public.contact_messages for select
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

create policy "Admins can update contact messages"
  on public.contact_messages for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

create policy "Admins can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));
