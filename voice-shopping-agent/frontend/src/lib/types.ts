export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiProduct {
  product_id: string;
  title: string | null;
  description: string | null;
  category_group: string | null;
  subcategory: string | null;
  rating: number | null;
  ratings_count: number | null;
  initial_price: number | null;
  discount: number | null;
  final_price: number | null;
  currency: string | null;
  sizes: unknown;
  product_details: unknown;
  product_specifications: unknown;
  github_images: unknown;
  price: number;
  name: string;
  image_url: string;
}

export interface Product extends ApiProduct {
  id: string;
  categorySlug: string;
  categoryName: string;
}

export interface ProductQuery {
  category?: string;
  subcategory?: string;
  q?: string;
  size?: string;
  currency?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "rating";
  limit?: number;
  skip?: number;
}

export interface ApiCartItem {
  id: string;
  product: ApiProduct;
  quantity: number;
  size: string | null;
  line_total: number;
}

export interface ApiCart {
  id: string;
  items: ApiCartItem[];
  subtotal: number;
  item_count: number;
}

export interface ApiOrderItem {
  id: string;
  product: ApiProduct;
  quantity: number;
  size: string | null;
  price_at_purchase: number;
  line_total: number;
}

export interface ApiOrder {
  id: string;
  status: string;
  subtotal: number;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
  items: ApiOrderItem[];
  item_count: number;
}

export interface ApiPage<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface FilterOptions {
  category_groups: string[];
  subcategories: string[];
  sizes: string[];
  currencies: string[];
  min_price: number;
  max_price: number;
}
