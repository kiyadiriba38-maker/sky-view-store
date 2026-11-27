import type { Metadata } from "next";

import { StorefrontShell, ProductGrid } from "@/components/storefront/storefront-pages";
import DAL from "@/lib/core/dal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop all | Sky View Store", description: "Browse published Sky View Store products and clearly marked independent seller listings." };

export default async function ShopPage() {
  const products = await DAL.queryAllProducts();
  return <StorefrontShell eyebrow="Explore the catalogue / 01" title="Shop all products." description="Browse the products published in the Sky View Store catalogue. Listings from independent marketplaces are identified and link back to their original seller.">
    <ProductGrid products={products} />
  </StorefrontShell>;
}
