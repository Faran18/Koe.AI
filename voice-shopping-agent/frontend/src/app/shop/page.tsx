import { queryProducts } from "@/lib/api";
import ShopClient from "@/components/ShopClient";
import type { ProductQuery } from "@/lib/types";

export default async function Shop({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const sp = await searchParams;
  const { items } = await queryProducts({ limit: 1000 });
  const sort = ["featured", "price-asc", "price-desc", "rating"].includes(sp.sort ?? "")
    ? sp.sort as ProductQuery["sort"]
    : undefined;
  return <ShopClient products={items} initialSort={sort} />;
}
