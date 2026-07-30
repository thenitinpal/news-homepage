import { supabase } from "./supabaseClient";

export async function subscribe(email: string, userId?: string): Promise<void> {
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email, user_id: userId ?? null });

  if (error) {
    // Unique-constraint violation just means they're already subscribed — not a real error.
    if (error.code === "23505") return;
    throw error;
  }
}

export async function unsubscribe(userId: string): Promise<void> {
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("user_id", userId);
  if (error) throw error;
}

export async function isSubscribed(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}
