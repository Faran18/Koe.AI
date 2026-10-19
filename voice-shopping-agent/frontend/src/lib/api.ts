import type {
  ApiCart,
  ApiCategory,
  ApiOrder,
  ApiPage,
  ApiProduct,
  FilterOptions,
  Product,
  ProductQuery,
} from "./types";

const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

function apiBase() {
  return typeof window === "undefined"
    ? process.env.API_BASE_URL ?? PUBLIC_API_BASE
    : PUBLIC_API_BASE;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    cache: "no-store",
  });
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      detail = typeof body.detail === "string" ? body.detail : detail;
    } catch {
      // Keep the HTTP status when the server did not return JSON.
    }
    throw new ApiError(detail, response.status);
  }
  return response.json() as Promise<T>;
}

function queryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function toProduct(product: ApiProduct): Product {
  const image = Array.isArray(product.github_images)
    ? product.github_images.find((value): value is string => typeof value === "string" && value.length > 0)
    : typeof product.github_images === "string"
      ? product.github_images
      : "";
  const categoryName = product.subcategory || product.category_group || "Collection";
  return {
    ...product,
    id: product.product_id,
    categorySlug: slug(categoryName),
    categoryName,
    image_url: product.image_url || image || `https://picsum.photos/seed/${product.product_id}/600/800`,
  };
}

export function productSizes(product: ApiProduct): string[] {
  if (!Array.isArray(product.sizes)) return [];
  return [...new Set(product.sizes.map((size) => {
    if (typeof size === "string" || typeof size === "number") return String(size).trim();
    if (size && typeof size === "object" && "size" in size) return String(size.size).trim();
    return "";
  }).filter(Boolean))];
}

export async function getCategories(category_group?: string): Promise<ApiCategory[]> {
  const query = queryString({ category_group });
  return request<ApiCategory[]>(`/api/categories${query ? `?${query}` : ""}`);
}

export function getFilters(category?: string, subcategory?: string, currency?: string) {
  const query = queryString({ category, subcategory, currency });
  return request<FilterOptions>(`/api/filters${query ? `?${query}` : ""}`);
}

async function getAllPages<T>(path: (page: number) => string): Promise<T[]> {
  const first = await request<ApiPage<T>>(path(1));
  const pages = Math.ceil(first.total / first.page_size);
  const remaining = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, index) =>
      request<ApiPage<T>>(path(index + 2))
    )
  );
  return [first, ...remaining].flatMap((page) => page.items);
}

export async function getCatalog(): Promise<Product[]> {
  const items = await getAllPages<ApiProduct>(
    (page) => `/api/products?page=${page}&page_size=100`
  );
  return items.map(toProduct);
}

export async function queryProducts(query: ProductQuery = {}) {
  const { limit = 24, skip = 0, sort = "featured", ...filters } = query;
  const baseQuery = { ...filters, page_size: 100 };
  const items = await getAllPages<ApiProduct>(
    (page) => `/api/products/search?${queryString({ ...baseQuery, page })}`
  );
  const sorters = {
    featured: (_a: Product, _b: Product) => 0,
    "price-asc": (a: Product, b: Product) => a.price - b.price,
    "price-desc": (a: Product, b: Product) => b.price - a.price,
    rating: (a: Product, b: Product) => (b.rating ?? 0) - (a.rating ?? 0),
  };
  const products = items.map(toProduct).sort(sorters[sort]);
  return { total: products.length, items: products.slice(skip, skip + limit) };
}

export async function getProduct(id: string): Promise<Product> {
  const product = await request<ApiProduct>(`/api/products/${encodeURIComponent(id)}`);
  return toProduct(product);
}

export function getCart() {
  return request<ApiCart>("/api/cart");
}

export function addCartItem(productId: string, quantity = 1, size?: string) {
  return request<ApiCart>("/api/cart/items", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity, size }),
  });
}

export function updateCartItem(itemId: string, quantity: number) {
  return request<ApiCart>(`/api/cart/items/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId: string) {
  return request<ApiCart>(`/api/cart/items/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  });
}

export function placeOrder(shippingAddress: string) {
  return request<ApiOrder>("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ shipping_address: shippingAddress }),
  });
}

export async function getOrders(): Promise<ApiOrder[]> {
  return getAllPages<ApiOrder>((page) => `/api/orders?page=${page}&page_size=100`);
}
