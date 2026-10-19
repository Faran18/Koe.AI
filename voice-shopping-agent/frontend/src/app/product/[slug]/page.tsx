import { notFound } from "next/navigation";
import { ApiError, getProduct } from "@/lib/api";
import ProductPanel from "@/components/ProductPanel";
import ViewerStage from "@/components/ViewerStage";
import type { Product } from "@/lib/types";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const id = (await params).slug;
  let product: Product;
  try {
    product = await getProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  return (
    <main className="pdp-main" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", minHeight: "100vh", padding: "110px 56px 56px", gap: 56, alignItems: "center" }}>
      <ViewerStage image={product.image_url} id={product.id} />
      <ProductPanel product={product} />
    </main>
  );
}
