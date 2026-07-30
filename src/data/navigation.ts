export interface NavItem {
  label: string;
  to: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "India", to: "/category/india" },
  { label: "World", to: "/category/world" },
  { label: "US", to: "/category/us" },
  { label: "Europe", to: "/category/europe" },
  { label: "Business", to: "/category/business" },
  { label: "Cricket", to: "/category/cricket" },
  { label: "Sports", to: "/category/sports" },
  { label: "Entertainment", to: "/category/entertainment" },
  { label: "Technology", to: "/category/technology" },
  { label: "Lifestyle", to: "/category/lifestyle" },
  { label: "Opinion", to: "/category/opinion" },
];
