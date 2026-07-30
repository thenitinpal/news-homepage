-- Run this in the Supabase SQL editor. Updates the new-user trigger (from
-- migration_002_reader_accounts.sql) so it also picks up a display name from
-- Google sign-ins, which populate "full_name"/"name" in user metadata instead
-- of the "display_name" field our own email/password sign-up form sets.
--
-- This is the only SQL change needed for Google sign-in — the rest of the
-- setup (Google Cloud Console + Supabase Auth provider config) is done in
-- dashboards, not SQL. See the chat instructions for those steps.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;
