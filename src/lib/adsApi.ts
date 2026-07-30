import { supabase } from "./supabaseClient";

export type AdPlacement = "sidebar-300x250" | "sidebar-300x600";

export const AD_PLACEMENTS: { value: AdPlacement; label: string }[] = [
  { value: "sidebar-300x250", label: "Sidebar (300x250)" },
  { value: "sidebar-300x600", label: "Sidebar (300x600)" },
];

export interface SponsoredAd {
  id: string;
  advertiserName: string;
  image: string;
  linkUrl: string;
  placement: AdPlacement;
  startDate: string;
  endDate: string;
  active: boolean;
}

interface AdRow {
  id: string;
  advertiser_name: string;
  image: string;
  link_url: string;
  placement: string;
  start_date: string;
  end_date: string;
  active: boolean;
}

export interface AdInput {
  advertiserName: string;
  image: string;
  linkUrl: string;
  placement: AdPlacement;
  startDate: string;
  endDate: string;
  active: boolean;
}

function mapRowToAd(row: AdRow): SponsoredAd {
  return {
    id: row.id,
    advertiserName: row.advertiser_name,
    image: row.image,
    linkUrl: row.link_url,
    placement: row.placement as AdPlacement,
    startDate: row.start_date,
    endDate: row.end_date,
    active: row.active,
  };
}

// Public: only ever returns ads that are active and within their date range
// (enforced by the RLS policy itself, not just this filter).
export async function fetchActiveAd(placement: AdPlacement): Promise<SponsoredAd | null> {
  const { data, error } = await supabase
    .from("sponsored_ads")
    .select("*")
    .eq("placement", placement)
    .eq("active", true)
    .lte("start_date", new Date().toISOString())
    .gte("end_date", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRowToAd(data as AdRow) : null;
}

// Admin: returns every ad regardless of active/date-range state.
export async function fetchAllAds(): Promise<SponsoredAd[]> {
  const { data, error } = await supabase
    .from("sponsored_ads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as AdRow[]).map(mapRowToAd);
}

export async function fetchAdById(id: string): Promise<SponsoredAd | null> {
  const { data, error } = await supabase.from("sponsored_ads").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data ? mapRowToAd(data as AdRow) : null;
}

function toRow(input: AdInput) {
  return {
    advertiser_name: input.advertiserName,
    image: input.image,
    link_url: input.linkUrl,
    placement: input.placement,
    start_date: input.startDate,
    end_date: input.endDate,
    active: input.active,
  };
}

export async function createAd(input: AdInput): Promise<SponsoredAd> {
  const { data, error } = await supabase
    .from("sponsored_ads")
    .insert(toRow(input))
    .select()
    .single();

  if (error) throw error;
  return mapRowToAd(data as AdRow);
}

export async function updateAd(id: string, input: AdInput): Promise<SponsoredAd> {
  const { data, error } = await supabase
    .from("sponsored_ads")
    .update(toRow(input))
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapRowToAd(data as AdRow);
}

export async function deleteAd(id: string): Promise<void> {
  const { error } = await supabase.from("sponsored_ads").delete().eq("id", id);
  if (error) throw error;
}
