-- Run this in the Supabase SQL editor. Adds optional per-article SEO fields:
-- a dedicated meta title/description (separate from the display headline and
-- excerpt, since the ideal SEO copy is often shorter/more keyword-focused),
-- plus a focus keyword and secondary keywords. All nullable — existing
-- articles keep working exactly as before, falling back to headline/excerpt
-- when these are left blank.

alter table public.articles
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists focus_keyword text,
  add column if not exists secondary_keywords text;
