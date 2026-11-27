import type { Metadata } from "next";

import { CategoryGrid, StorefrontShell } from "@/components/storefront/storefront-pages";
import DAL from "@/lib/core/dal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Categories | Sky View Store", description: "Explore the Sky View Store product categories." };

export default async function CategoriesPage() {
  const categories = await DAL.fetchArchiveCategories();
  return <StorefrontShell eyebrow="Browse by interest / 03" title="Explore categories." description="Find a collection that matches what you are looking for. Product availability depends on published store listings.">
    <CategoryGrid categories={categories} />
  </StorefrontShell>;
}
