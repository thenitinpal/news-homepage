import { supabase } from "./supabaseClient";

export async function fetchSavedArticleIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("saved_articles")
    .select("article_id")
    .eq("user_id", userId);

  if (error) throw error;
  return new Set(data.map((row) => row.article_id as string));
}

export async function saveArticle(userId: string, articleId: string): Promise<void> {
  const { error } = await supabase
    .from("saved_articles")
    .insert({ user_id: userId, article_id: articleId });
  if (error) throw error;
}

export async function unsaveArticle(userId: string, articleId: string): Promise<void> {
  const { error } = await supabase
    .from("saved_articles")
    .delete()
    .eq("user_id", userId)
    .eq("article_id", articleId);
  if (error) throw error;
}
