import type { Metadata } from "next";

import { StorefrontShell, ProductGrid } from "@/components/storefront/storefront-pages";
import DAL from "@/lib/core/dal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Deals | Sky View Store", description: "Browse published products with a configured original price." };

export default async function DealsPage() {
  const products = await DAL.queryAllProducts();
  const deals = products.filter((product) => Number(product.originalPriceInUSD ?? 0) > Number(product.priceInUSD ?? 0));
  return <StorefrontShell eyebrow="Offers / 02" title="Deals worth discovering." description="Only products with an original price and a lower current price set by the store admin appear here.">
    <ProductGrid products={deals} />
  </StorefrontShell>;
}
