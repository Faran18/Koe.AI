import { NextResponse } from "next/server";
import { queryProducts } from "@/lib/api";
import type { ProductQuery } from "@/lib/types";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const query: ProductQuery = {
    category: sp.get("category") || undefined,
    subcategory: sp.get("subcategory") || undefined,
    q: sp.get("q") || undefined,
    size: sp.get("size") || undefined,
    currency: sp.get("currency") || undefined,
    min_price: sp.has("min_price") ? Number(sp.get("min_price")) : undefined,
    max_price: sp.has("max_price") ? Number(sp.get("max_price")) : undefined,
    min_rating: sp.has("min_rating") ? Number(sp.get("min_rating")) : undefined,
    sort: (sp.get("sort") as ProductQuery["sort"]) || undefined,
    limit: Number(sp.get("limit") ?? 24),
    skip: Number(sp.get("skip") ?? 0),
  };
  return NextResponse.json(await queryProducts(query));
}
