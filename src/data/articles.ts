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
