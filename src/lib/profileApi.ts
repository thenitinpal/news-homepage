import { supabase } from "./supabaseClient";
import type { Category } from "../data/articles";

export interface Profile {
  id: string;
  displayName: string;
  isAdmin: boolean;
  preferredCategories: Category[];
}

interface ProfileRow {
  id: string;
  display_name: string;
  is_admin: boolean;
  preferred_categories: string[];
}

function mapRowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    isAdmin: row.is_admin,
    preferredCategories: row.preferred_categories as Category[],
  };
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRowToProfile(data as ProfileRow) : null;
}

export async function updateProfile(
  userId: string,
  updates: { displayName?: string; preferredCategories?: Category[] },
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...(updates.displayName !== undefined ? { display_name: updates.displayName } : {}),
      ...(updates.preferredCategories !== undefined
        ? { preferred_categories: updates.preferredCategories }
        : {}),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return mapRowToProfile(data as ProfileRow);
}
