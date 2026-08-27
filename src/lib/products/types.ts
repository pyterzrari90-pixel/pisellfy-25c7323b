// Product types for the marketplace

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  category: string;
  image_url: string;
  creator_name: string;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  title: string;
  description: string;
  price: number;
  original_price?: number | null;
  category: string;
  image_url: string;
  creator_name: string;
  is_featured?: boolean;
}

export const PRODUCT_CATEGORIES = [
  "Design",
  "Templates",
  "Audio",
  "E-Books",
  "Courses",
  "Software",
  "Graphics",
  "Video",
  "Other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
