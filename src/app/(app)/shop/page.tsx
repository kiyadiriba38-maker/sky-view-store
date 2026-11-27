import type { Metadata } from "next";

import DemoShopBrowser from "@/components/storefront/demo-shop-browser";
import { StorefrontShell } from "@/components/storefront/storefront-pages";
import DAL from "@/lib/core/dal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop all | Sky View Store", description: "Explore the Sky View Store demo catalogue and real published marketplace products." };

export default async function ShopPage() {
  const products = await DAL.queryAllProducts();
  return <StorefrontShell eyebrow="Marketplace catalogue / 01" title="Explore the marketplace." description="Discover 1,000+ clearly labelled demo listings alongside real products published by Sky View Store and approved sellers. Demo listings simulate the shopping experience and are not real offers for sale.">
    <DemoShopBrowser realProducts={products} />
  </StorefrontShell>;
}
