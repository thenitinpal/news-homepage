-- Run this entire file once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).

-- 1. Articles table
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  headline text not null,
  excerpt text not null,
  image text,
  published_at timestamptz not null default now(),
  featured boolean not null default false,
  secondary boolean not null default false,
  trending boolean not null default false,
  most_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.articles enable row level security;

create policy "Public can read articles"
  on public.articles for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert articles"
  on public.articles for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update articles"
  on public.articles for update
  to authenticated
  using (true);

create policy "Authenticated users can delete articles"
  on public.articles for delete
  to authenticated
  using (true);

-- 2. Storage bucket for uploaded cover images
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

create policy "Public can view article images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'article-images');

create policy "Authenticated users can upload article images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'article-images');

create policy "Authenticated users can delete article images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'article-images');

-- 3. Sample content (same headlines the app shipped with as static mock data,
--    generated from src/data/articles.ts via scripts/generate-seed-sql.ts).
--    Safe to skip this block if you'd rather start with an empty table.
insert into public.articles (category, headline, excerpt, image, published_at, featured, secondary, trending, most_read)
values
  ('india', 'Parliament Session Opens With Debate Over New Infrastructure Bill', 'Lawmakers from both sides of the aisle exchanged sharp remarks as the session began, with the proposed bill expected to dominate discussions this week.', 'https://picsum.photos/seed/india-1/1200/700', now() - interval '1 hours', true, false, false, false),
  ('india', 'State Government Unveils New Education Policy Framework', 'The framework aims to overhaul curriculum standards across public schools, with a phased rollout planned over the next three academic years.', 'https://picsum.photos/seed/india-2/800/500', now() - interval '3 hours', false, true, true, false),
  ('india', 'Monsoon Forecast Predicts Above-Average Rainfall This Season', 'Meteorological officials say early indicators point to a stronger monsoon than last year, offering relief to drought-affected farming regions.', 'https://picsum.photos/seed/india-3/800/500', now() - interval '5 hours', false, false, false, true),
  ('india', 'Metro Rail Expansion Project Gets Final Approval', 'The long-delayed extension will add twelve new stations connecting the city''s outer suburbs to the central business district.', 'https://picsum.photos/seed/india-4/800/500', now() - interval '7 hours', false, false, false, false),
  ('india', 'Health Ministry Launches Nationwide Vaccination Awareness Drive', 'The campaign will run for six weeks and target rural districts where vaccination coverage has historically lagged behind urban centers.', 'https://picsum.photos/seed/india-5/800/500', now() - interval '9 hours', false, false, false, false),
  ('india', 'Farmers'' Union Calls for Review of Minimum Support Price Policy', 'Representatives met with agriculture ministry officials to discuss revisions ahead of the upcoming harvest season.', 'https://picsum.photos/seed/india-6/800/500', now() - interval '11 hours', false, false, false, false),
  ('world', 'Global Leaders Convene to Discuss Trade Cooperation Framework', 'Delegates from over forty nations gathered for a two-day summit aimed at easing cross-border trade restrictions and tariffs.', 'https://picsum.photos/seed/world-1/800/500', now() - interval '2 hours', false, true, true, false),
  ('world', 'Coastal Cities Announce Joint Climate Resilience Initiative', 'The alliance of port cities will share funding and engineering expertise to combat rising sea levels over the next decade.', 'https://picsum.photos/seed/world-2/800/500', now() - interval '4 hours', false, false, false, true),
  ('world', 'Central Bank Signals Possible Interest Rate Adjustment', 'Policymakers hinted at a shift in monetary strategy following months of steady inflation data across major economies.', 'https://picsum.photos/seed/world-3/800/500', now() - interval '6 hours', false, false, false, false),
  ('world', 'Diplomatic Talks Resume After Months-Long Standoff', 'Officials described the renewed negotiations as ''cautiously productive,'' with a follow-up meeting scheduled for next month.', 'https://picsum.photos/seed/world-4/800/500', now() - interval '8 hours', false, false, false, false),
  ('world', 'Space Agency Confirms Date for Next Lunar Research Mission', 'The unmanned mission will carry instruments designed to study soil composition near the lunar south pole.', 'https://picsum.photos/seed/world-5/800/500', now() - interval '10 hours', false, false, false, false),
  ('world', 'International Aid Convoy Reaches Flood-Affected Region', 'Relief workers say the shipment of food and medical supplies should ease shortages that have persisted for over a week.', 'https://picsum.photos/seed/world-6/800/500', now() - interval '12 hours', false, false, false, false),
  ('business', 'Markets Rally as Quarterly Earnings Beat Expectations', 'Benchmark indices closed at a three-month high after several blue-chip companies posted stronger-than-forecast profits.', 'https://picsum.photos/seed/business-1/800/500', now() - interval '2 hours', false, true, false, true),
  ('business', 'Startup Secures Major Funding Round to Expand Operations', 'The logistics startup plans to use the fresh capital to double its delivery fleet and enter five new metropolitan markets.', 'https://picsum.photos/seed/business-2/800/500', now() - interval '4 hours', false, false, true, false),
  ('business', 'Retail Chain Announces Plans to Open 200 New Stores', 'The expansion is part of a broader strategy to strengthen its presence in tier-two and tier-three cities over the next two years.', 'https://picsum.photos/seed/business-3/800/500', now() - interval '6 hours', false, false, false, false),
  ('business', 'Manufacturing Output Grows for Fourth Consecutive Month', 'Analysts point to steady export demand and easing input costs as the primary drivers behind the sustained growth.', 'https://picsum.photos/seed/business-4/800/500', now() - interval '8 hours', false, false, false, false),
  ('business', 'Regulator Proposes Stricter Rules for Digital Payment Platforms', 'The draft guidelines focus on data protection and transaction transparency, with a public comment period now open.', 'https://picsum.photos/seed/business-5/800/500', now() - interval '10 hours', false, false, false, false),
  ('business', 'Currency Steadies After Volatile Trading Week', 'Traders attribute the stabilization to reassurances from the central bank about maintaining adequate foreign reserves.', 'https://picsum.photos/seed/business-6/800/500', now() - interval '13 hours', false, false, false, false),
  ('cricket', 'Star Batsman Named Player of the Series After Stellar Run', 'His unbeaten century in the final match sealed a series victory and cemented his place among the tournament''s top performers.', 'https://picsum.photos/seed/cricket-1/800/500', now() - interval '3 hours', false, true, true, false),
  ('cricket', 'Young Bowler Earns Maiden Call-Up to National Squad', 'Selectors praised his consistency in domestic competition, citing a string of impressive performances this season.', 'https://picsum.photos/seed/cricket-2/800/500', now() - interval '5 hours', false, false, false, true),
  ('cricket', 'Rain Delays Push Opening Match to Reserve Day', 'Ground staff worked through the night to salvage the pitch, but persistent showers forced organizers to reschedule.', 'https://picsum.photos/seed/cricket-3/800/500', now() - interval '7 hours', false, false, false, false),
  ('cricket', 'Veteran Captain Announces Retirement From International Cricket', 'In an emotional statement, he thanked teammates and fans for their support across a career spanning over fifteen years.', 'https://picsum.photos/seed/cricket-4/800/500', now() - interval '9 hours', false, false, false, false),
  ('cricket', 'Underdog Squad Stuns Favorites in Series Opener', 'A disciplined bowling display restricted the opposition to a modest total, setting up a comfortable chase in reply.', 'https://picsum.photos/seed/cricket-5/800/500', now() - interval '11 hours', false, false, false, false),
  ('sports', 'Underdog Team Clinches Championship Title in Thrilling Final', 'A last-minute goal sealed a dramatic victory, capping off a remarkable run through the knockout rounds.', 'https://picsum.photos/seed/sports-1/800/500', now() - interval '2 hours', false, true, false, false),
  ('sports', 'Sprinter Breaks National Record at Regional Meet', 'The new mark shaves nearly a tenth of a second off the previous record, set almost a decade ago.', 'https://picsum.photos/seed/sports-2/800/500', now() - interval '4 hours', false, false, true, false),
  ('sports', 'City Council Approves Funding for New Sports Complex', 'The facility will include an Olympic-size swimming pool and multi-purpose courts, with construction set to begin next spring.', 'https://picsum.photos/seed/sports-3/800/500', now() - interval '6 hours', false, false, false, false),
  ('sports', 'Tennis Prodigy Advances to Semifinals in Debut Tournament', 'The 17-year-old wildcard entrant has surprised veterans with an aggressive baseline game and composure under pressure.', 'https://picsum.photos/seed/sports-4/800/500', now() - interval '8 hours', false, false, false, true),
  ('sports', 'League Announces Expanded Playoff Format for Next Season', 'The changes will add two additional wild-card spots, aiming to keep more teams competitive later into the season.', 'https://picsum.photos/seed/sports-5/800/500', now() - interval '10 hours', false, false, false, false),
  ('entertainment', 'Highly Anticipated Sequel Tops Opening Weekend Box Office', 'The film outperformed industry projections, drawing large crowds across multiplexes despite mixed critical reviews.', 'https://picsum.photos/seed/entertainment-1/800/500', now() - interval '3 hours', false, true, true, false),
  ('entertainment', 'Popular Streaming Series Renewed for Third Season', 'Producers confirmed the renewal after the show topped viewership charts for six consecutive weeks following its second-season debut.', 'https://picsum.photos/seed/entertainment-2/800/500', now() - interval '5 hours', false, false, false, true),
  ('entertainment', 'Award Ceremony Announces Full List of Nominees', 'Several first-time directors earned nominations this year, reflecting a notable shift toward independent storytelling.', 'https://picsum.photos/seed/entertainment-3/800/500', now() - interval '7 hours', false, false, false, false),
  ('entertainment', 'Chart-Topping Artist Announces Surprise World Tour', 'Tickets for the first leg sold out within minutes, prompting organizers to add extra dates in several cities.', 'https://picsum.photos/seed/entertainment-4/800/500', now() - interval '9 hours', false, false, false, false),
  ('entertainment', 'Veteran Actor to Headline Upcoming Historical Drama', 'Filming is set to begin next month on location, with the studio targeting a release in time for next year''s festival circuit.', 'https://picsum.photos/seed/entertainment-5/800/500', now() - interval '11 hours', false, false, false, false),
  ('technology', 'Startup Unveils AI Tool to Streamline Everyday Tasks', 'The assistant app uses on-device processing to manage scheduling and reminders without sending data to external servers.', 'https://picsum.photos/seed/technology-1/800/500', now() - interval '2 hours', false, true, false, false),
  ('technology', 'New Smartphone Chip Promises Major Battery Life Gains', 'Manufacturers claim the redesigned processor architecture cuts power consumption by nearly a third under typical use.', 'https://picsum.photos/seed/technology-2/800/500', now() - interval '4 hours', false, false, true, false),
  ('technology', 'Regulators Examine Data Practices of Major Tech Platforms', 'The inquiry focuses on how user data is collected, stored, and shared with third-party advertisers.', 'https://picsum.photos/seed/technology-3/800/500', now() - interval '6 hours', false, false, false, false),
  ('technology', 'Electric Vehicle Startup Opens New Battery Manufacturing Plant', 'The facility is expected to create thousands of jobs and triple the company''s annual production capacity.', 'https://picsum.photos/seed/technology-4/800/500', now() - interval '8 hours', false, false, false, true),
  ('technology', 'Researchers Demonstrate Breakthrough in Solar Panel Efficiency', 'The new cell design converts significantly more sunlight into usable energy compared to conventional panels.', 'https://picsum.photos/seed/technology-5/800/500', now() - interval '10 hours', false, false, false, false),
  ('lifestyle', 'Five Simple Habits That Can Improve Your Daily Wellness Routine', 'Experts say small, consistent changes to sleep and diet often produce better long-term results than drastic overhauls.', 'https://picsum.photos/seed/lifestyle-1/800/500', now() - interval '3 hours', false, false, false, false),
  ('lifestyle', 'Home Chefs Embrace Fermentation as Kitchen Trend Grows', 'From sourdough to pickled vegetables, more households are experimenting with traditional preservation techniques.', 'https://picsum.photos/seed/lifestyle-2/800/500', now() - interval '5 hours', false, false, true, false),
  ('lifestyle', 'Minimalist Travel Packing Tips for Your Next Trip', 'Frequent travelers share strategies for packing lighter without sacrificing comfort or preparedness.', 'https://picsum.photos/seed/lifestyle-3/800/500', now() - interval '7 hours', false, false, false, false),
  ('lifestyle', 'Urban Gardening Gains Popularity Among Apartment Dwellers', 'Balcony and windowsill gardens are becoming a common sight as more city residents take up small-scale growing.', 'https://picsum.photos/seed/lifestyle-4/800/500', now() - interval '9 hours', false, false, false, false),
  ('opinion', 'Why Investing in Public Transit Should Be a National Priority', 'A well-funded transit network isn''t just about convenience — it''s an investment in economic mobility and cleaner cities.', 'https://picsum.photos/seed/opinion-1/800/500', now() - interval '4 hours', false, false, false, false),
  ('opinion', 'The Case for Rethinking How We Measure Economic Progress', 'GDP growth alone tells an incomplete story — it''s time policymakers paid closer attention to broader well-being indicators.', 'https://picsum.photos/seed/opinion-2/800/500', now() - interval '6 hours', false, false, false, true),
  ('opinion', 'Local Journalism Needs More Than Nostalgia to Survive', 'Sustaining independent local reporting will require new funding models, not just appeals to civic duty.', 'https://picsum.photos/seed/opinion-3/800/500', now() - interval '8 hours', false, false, false, false),
  ('opinion', 'Remote Work Has Changed Cities — Planning Needs to Catch Up', 'Emptier downtowns and busier suburbs call for a fundamental rethink of how urban infrastructure is prioritized.', 'https://picsum.photos/seed/opinion-4/800/500', now() - interval '10 hours', false, false, false, false);
