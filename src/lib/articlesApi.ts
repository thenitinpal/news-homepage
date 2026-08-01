import { supabase } from "./supabaseClient";
import type { Article, Category } from "../data/articles";

const FALLBACK_IMAGE = "https://picsum.photos/seed/dailybulletin-fallback/800/500";
const IMAGE_BUCKET = "article-images";

interface ArticleRow {
  id: string;
  category: string;
  headline: string;
  excerpt: string;
  image: string | null;
  published_at: string;
  featured: boolean;
  secondary: boolean;
  trending: boolean;
  most_read: boolean;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  secondary_keywords: string | null;
}

export interface ArticleInput {
  category: Category;
  headline: string;
  excerpt: string;
  image: string;
  featured: boolean;
  secondary: boolean;
  trending: boolean;
  mostRead: boolean;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string;
}

function mapRowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    category: row.category as Category,
    headline: row.headline,
    excerpt: row.excerpt,
    image: row.image ?? FALLBACK_IMAGE,
    timestamp: row.published_at,
    featured: row.featured,
    secondary: row.secondary,
    trending: row.trending,
    mostRead: row.most_read,
    metaTitle: row.meta_title ?? undefined,
    metaDescription: row.meta_description ?? undefined,
    focusKeyword: row.focus_keyword ?? undefined,
    secondaryKeywords: row.secondary_keywords ?? undefined,
  };
}

export async function fetchArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return (data as ArticleRow[]).map(mapRowToArticle);
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data ? mapRowToArticle(data as ArticleRow) : null;
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const { data, error } = await supabase
    .from("articles")
    .insert({
      category: input.category,
      headline: input.headline,
      excerpt: input.excerpt,
      image: input.image,
      featured: input.featured,
      secondary: input.secondary,
      trending: input.trending,
      most_read: input.mostRead,
      meta_title: input.metaTitle || null,
      meta_description: input.metaDescription || null,
      focus_keyword: input.focusKeyword || null,
      secondary_keywords: input.secondaryKeywords || null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRowToArticle(data as ArticleRow);
}

export async function updateArticle(id: string, input: ArticleInput): Promise<Article> {
  const { data, error } = await supabase
    .from("articles")
    .update({
      category: input.category,
      headline: input.headline,
      excerpt: input.excerpt,
      image: input.image,
      featured: input.featured,
      secondary: input.secondary,
      trending: input.trending,
      most_read: input.mostRead,
      meta_title: input.metaTitle || null,
      meta_description: input.metaDescription || null,
      focus_keyword: input.focusKeyword || null,
      secondary_keywords: input.secondaryKeywords || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapRowToArticle(data as ArticleRow);
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadArticleImage(file: File): Promise<string> {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function getArticlesByCategory(articles: Article[], category: Category): Article[] {
  return articles.filter((a) => a.category === category);
}

export function getFeaturedArticle(articles: Article[]): Article | undefined {
  return articles.find((a) => a.featured);
}

export function getSecondaryArticles(articles: Article[]): Article[] {
  return articles.filter((a) => a.secondary);
}

export function getTrendingArticles(articles: Article[]): Article[] {
  return articles.filter((a) => a.trending);
}

export function getMostReadArticles(articles: Article[]): Article[] {
  return articles.filter((a) => a.mostRead);
}
