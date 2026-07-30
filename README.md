# PalNews

A dense, Times-of-India-style news homepage built with React 19, TypeScript, Tailwind CSS v4,
and react-router-dom. Articles are stored in Supabase (Postgres + Storage) and managed through
a built-in admin panel — no external CMS.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- react-router-dom v7
- Fuse.js for fuzzy/typo-tolerant site search
- Supabase: Postgres tables, Storage bucket for cover images, Auth

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the dashboard, open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the `articles` table,
   its row-level-security policies, the `article-images` storage bucket, and seeds ~46 sample
   articles so the homepage isn't empty on first load.
3. Go to **Authentication → Users → Add user** and create the admin account you'll sign in with
   at `/admin/login` (email + password, "Auto Confirm User" checked).
4. Go to **Project Settings → API** and copy the **Project URL** and **anon public** key.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the two values from the previous step:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

`.env.local` is gitignored — never commit real credentials.

### 4. Run the dev server

```bash
npm run dev
```

Visit `/admin/login` and sign in with the user you created in step 2.3 to create, edit, and
delete articles (including uploading cover images, which are stored in the `article-images`
Supabase Storage bucket). The homepage and category pages read published articles live from
Supabase — no rebuild or redeploy needed after publishing.

### 5. Enable reader accounts (sign-up, saved articles, comments, newsletter)

Public visitors can create their own accounts separately from the admin login — sign up at
`/signup`, sign in at `/login`. This needs one more migration plus two dashboard settings:

1. In the Supabase SQL editor, run the entire contents of
   [`supabase/migration_002_reader_accounts.sql`](supabase/migration_002_reader_accounts.sql).
   This adds reader profiles, saved articles, comments, and newsletter-signup tables, **and
   tightens the `articles` table's security rules so only admins (not every reader) can
   create/edit/delete articles** — read the comment at the top of that file before running it.
2. Run the one-off statement in the comment at the bottom of that file (with your real admin
   email swapped in) to mark your existing admin account as an admin in the new `profiles`
   table — without this, `/admin` will stop working for your admin login.
3. In the dashboard: **Authentication → Settings → turn off "Confirm email"**, so new reader
   sign-ups can log in immediately without an email-confirmation step.

The "newsletter" feature only *captures* subscriber emails into the `newsletter_subscribers`
table — it doesn't send any email. Wiring up actual sending would need a separate email service
(e.g. Resend) and its own API key, which isn't set up here.

## Content model

Each article has: category, headline, excerpt, cover image, and four placement flags —
`featured` (the single hero story), `secondary` (hero side stories), `trending` (sidebar
"Trending Now"), `most_read` (sidebar "Most Read"). These flags are checkboxes in the admin
article form and control where a story surfaces on the site.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — typecheck (`tsc -b`) and build for production
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally
