import { supabase } from "./supabaseClient";

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  displayName: string;
  body: string;
  createdAt: string;
}

interface CommentRow {
  id: string;
  article_id: string;
  user_id: string;
  display_name: string;
  body: string;
  created_at: string;
}

function mapRowToComment(row: CommentRow): Comment {
  return {
    id: row.id,
    articleId: row.article_id,
    userId: row.user_id,
    displayName: row.display_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function fetchComments(articleId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as CommentRow[]).map(mapRowToComment);
}

export async function postComment(
  articleId: string,
  userId: string,
  displayName: string,
  body: string,
): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({ article_id: articleId, user_id: userId, display_name: displayName, body })
    .select()
    .single();

  if (error) throw error;
  return mapRowToComment(data as CommentRow);
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw error;
}
