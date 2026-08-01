export type Category =
  | "india"
  | "world"
  | "us"
  | "europe"
  | "business"
  | "cricket"
  | "sports"
  | "entertainment"
  | "technology"
  | "lifestyle"
  | "opinion";

export interface Article {
  id: string;
  category: Category;
  headline: string;
  excerpt: string;
  image: string;
  timestamp: string;
  featured?: boolean;
  secondary?: boolean;
  trending?: boolean;
  mostRead?: boolean;
  /** Falls back to `headline` when empty. */
  metaTitle?: string;
  /** Falls back to `excerpt` when empty. */
  metaDescription?: string;
  focusKeyword?: string;
  /** Comma-separated. */
  secondaryKeywords?: string;
}

export const categoryLabels: Record<Category, string> = {
  india: "India",
  world: "World",
  us: "US",
  europe: "Europe",
  business: "Business",
  cricket: "Cricket",
  sports: "Sports",
  entertainment: "Entertainment",
  technology: "Technology",
  lifestyle: "Lifestyle",
  opinion: "Opinion",
};
