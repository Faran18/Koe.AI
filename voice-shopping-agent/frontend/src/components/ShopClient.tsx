"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product, ProductQuery } from "@/lib/types";
import { getFilters, productSizes } from "@/lib/api";
import { format } from "@/lib/currency";
import { useWishlist } from "@/store/wishlist";

type Sort = NonNullable<ProductQuery["sort"]>;

export default function ShopClient({ products, initialSort }: { products: Product[]; initialSort?: Sort }) {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [sort, setSort] = useState<Sort>(initialSort ?? "featured");
  const [filters, setFilters] = useState({ category_groups: [] as string[], subcategories: [] as string[], sizes: [] as string[], currencies: [] as string[], min_price: 0, max_price: 0 });
  const [currency, setCurrency] = useState(() => products.find((product) => product.currency)?.currency ?? "USD");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [size, setSize] = useState("");
  const [filterError, setFilterError] = useState("");
  const wish = useWishlist();

  useEffect(() => {
    let active = true;
    getFilters(category || undefined, subcategory || undefined, currency || undefined)
      .then((options) => {
        if (!active) return;
        setFilters(options);
        const nextCurrency = options.currencies.includes(currency)
          ? currency
          : options.currencies[0] ?? "";
        if (nextCurrency !== currency) {
          setCurrency(nextCurrency);
          return;
        }
        setMin(options.min_price);
        setMax(options.max_price);
        setFilterError("");
      })
      .catch((error: unknown) => {
        if (active) setFilterError(error instanceof Error ? error.message : "Could not load collection filters.");
      });
    return () => { active = false; };
  }, [category, subcategory, currency]);

  const categoryGroups = useMemo(
    () => [...new Set(products.map((product) => product.category_group).filter((value): value is string => Boolean(value)))].sort(),
    [products]
  );
  const shown = useMemo(() => {
    const sorters: Record<Sort, (a: Product, b: Product) => number> = {
      featured: () => 0,
      rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
    };
    return products
      .filter((product) =>
        (!category || product.category_group === category) &&
        (!subcategory || product.subcategory === subcategory) &&
        (!currency || (product.currency ?? "USD").toLowerCase() === currency.toLowerCase()) &&
        product.price >= min && product.price <= max &&
        (!size || productSizes(product).includes(size))
      )
      .sort(sorters[sort]);
  }, [products, category, subcategory, currency, min, max, size, sort]);

  const pill = (on: boolean) => ({ background: "none", border: 0, cursor: "pointer", textAlign: "left" as const, padding: "6px 0", fontSize: 13, letterSpacing: ".18em", textTransform: "uppercase" as const, color: on ? "var(--gold)" : "var(--mute)", fontFamily: "inherit" });
  const selectStyle = { width: "100%", marginTop: 8, padding: 12, background: "var(--glass)", color: "var(--ivory)", border: "1px solid var(--glass-line)", borderRadius: 12 };
  const priceCeiling = Math.max(filters.max_price, filters.min_price + 1);

  return (
    <main className="shop-main" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 56, padding: "140px 56px 80px" }}>
      <aside
        className="shop-aside"
        data-lenis-prevent
        aria-label="Collection filters"
        style={{
          position: "sticky",
          top: 112,
          alignSelf: "start",
          display: "grid",
          gap: 30,
          maxHeight: "calc(100vh - 128px)",
          overflowY: "auto",
          overscrollBehavior: "contain",
          paddingRight: 12,
        }}
      >
        <div><p className="eyebrow">Atelier</p><h1 style={{ fontSize: 52, lineHeight: 1 }}>The <em>Collection</em></h1></div>
        <div style={{ display: "grid" }}>
          <button style={pill(!category)} onClick={() => { setCategory(""); setSubcategory(""); setSize(""); }}>All categories</button>
          {categoryGroups.map((group) => <button key={group} style={{ ...pill(category === group), textTransform: "capitalize" }} onClick={() => { setCategory(category === group ? "" : group); setSubcategory(""); setSize(""); }}>{group}</button>)}
        </div>
        {filters.subcategories.length > 0 && (
          <label style={{ fontSize: 12, letterSpacing: ".2em", color: "var(--mute)" }}>SUBCATEGORY
            <select value={subcategory} onChange={(event) => setSubcategory(event.target.value)} style={selectStyle}>
              <option value="">Any</option>{filters.subcategories.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        )}
        {filterError && <p role="alert" style={{ color: "var(--gold)", fontSize: 12 }}>{filterError}</p>}
        {filters.currencies.length > 1 && (
          <label style={{ fontSize: 12, letterSpacing: ".2em", color: "var(--mute)" }}>CURRENCY
            <select value={currency} onChange={(event) => setCurrency(event.target.value)} style={selectStyle}>
              {filters.currencies.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        )}
        <label style={{ fontSize: 12, letterSpacing: ".2em", color: "var(--mute)" }}>SIZE
          <select value={size} onChange={(event) => setSize(event.target.value)} style={selectStyle}>
            <option value="">Any</option>{filters.sizes.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 12, letterSpacing: ".2em", color: "var(--mute)" }}>FROM {format(min, currency)}
          <input type="range" min={filters.min_price} max={priceCeiling} step={1} value={Math.min(min, max)} onChange={(event) => setMin(Math.min(+event.target.value, max))} style={{ width: "100%", accentColor: "#c9a96a" }} />
        </label>
        <label style={{ fontSize: 12, letterSpacing: ".2em", color: "var(--mute)" }}>UP TO {format(max, currency)}
          <input type="range" min={filters.min_price} max={priceCeiling} step={1} value={Math.min(max, priceCeiling)} onChange={(event) => setMax(Math.max(+event.target.value, min))} style={{ width: "100%", accentColor: "#c9a96a" }} />
        </label>
        <label style={{ fontSize: 12, letterSpacing: ".2em", color: "var(--mute)" }}>ORDER
          <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} style={selectStyle}>
            <option value="featured">Curated</option><option value="rating">Top rated</option><option value="price-asc">Price ↑</option><option value="price-desc">Price ↓</option>
          </select>
        </label>
      </aside>

      <motion.div layout className="shop-cols" style={{ columnCount: 3, columnGap: 36 }}>
        <AnimatePresence>
          {shown.map((product, index) => (
            <motion.article layout key={product.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, delay: (index % 6) * 0.05 }}
              style={{ breakInside: "avoid", marginBottom: 48, position: "relative" }}>
              <Link href={`/product/${encodeURIComponent(product.id)}`} className="tile">
                <div style={{ aspectRatio: index % 3 === 1 ? "4/5" : "3/4", borderRadius: index % 2 ? "10px" : "999px 999px 10px 10px", border: "1px solid var(--glass-line)", background: "linear-gradient(180deg, var(--ink-2), transparent)", position: "relative", overflow: "hidden" }}>
                  <Image src={product.image_url} alt={product.name} fill sizes="30vw" style={{ objectFit: "contain", padding: 28 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 13 }}>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: 20 }}>{product.name}</span><span style={{ color: "var(--gold)" }}>{format(product.price, product.currency ?? undefined)}</span>
                </div>
                <div style={{ marginTop: 5, color: "var(--dim)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>{product.category_group}{product.subcategory ? ` · ${product.subcategory}` : ""}{product.rating ? ` · ${product.rating}★` : ""}</div>
              </Link>
              <button aria-label="Save to wishlist" onClick={() => wish.toggle(product.id)} style={{ position: "absolute", top: 14, right: 14, width: 40, height: 40, borderRadius: "50%", border: "1px solid var(--glass-line)", background: "var(--glass)", backdropFilter: "blur(10px)", color: wish.ids.includes(product.id) ? "var(--gold)" : "var(--mute)", cursor: "pointer" }}>{wish.ids.includes(product.id) ? "♥" : "♡"}</button>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
