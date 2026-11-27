import { notFound } from "next/navigation";

import type { PropsSlug } from "@/lib/core/types/types";
import type { Metadata } from "next";

import HomeExperience from "@/components/storefront/home-experience";
import RenderBlocks from "@/components/blocks/render-blocks";
import RenderHero from "@/components/blocks/render-hero";
import { JsonLdViewScript } from "@/components/shared/elements-ssr";
import DAL from "@/lib/core/dal";
import { CollectionName } from "@/lib/core/types/types";
import { getDecodedSlug, resolveMediaUrl } from "@/lib/core/util";
import { buildMetadataByModel } from "@/lib/seo/metadata";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);
  const page = await DAL.queryPageBySlug(slug);
  if (!page && slug === "home") {
    return {
      title: "Sky View Store",
      description: "Discover quality products at Sky View Store.",
    };
  }
  if (!page) return { robots: "noindex" };
  return buildMetadataByModel(CollectionName.pages, page, slug);
}

export default async function PagePage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);
  const page = await DAL.queryPageBySlug(slug);
  if (!page && slug === "home") {
    const products = await DAL.queryAllProducts();
    const catalogProducts = products.map((product) => ({
      title: product.title,
      slug: product.slug,
      image:
        product.meta?.image && typeof product.meta.image === "object"
          ? resolveMediaUrl(product.meta.image)
          : null,
      price: Number(product.priceInUSD ?? 0),
      originalPrice:
        typeof product.originalPriceInUSD === "number"
          ? product.originalPriceInUSD
          : null,
      listingType: product.listingType ?? "own_store",
      isDemo: Boolean((product as typeof product & { isDemo?: boolean }).isDemo),
      demoImageUrl: (product as typeof product & { demoImageUrl?: string | null }).demoImageUrl ?? null,
      productImageUrl: (product as typeof product & { productImageUrl?: string | null }).productImageUrl ?? null,
      category: product.categories?.map((category) => typeof category === "object" ? category.title : "").filter(Boolean)[0] ?? "Marketplace",
      categorySlug: product.categories?.map((category) => typeof category === "object" ? category.slug : "").filter(Boolean)[0] ?? "marketplace",
    }));
    return <HomeExperience catalogProducts={catalogProducts} />;
  }
  if (!page) return notFound();
  return (
    <article className="min-w-0 overflow-x-clip py-1">
      <JsonLdViewScript
        collection={CollectionName.pages}
        entity={page}
        slug={slug}
      />
      <h1 className="sr-only">{page.title}</h1>
      <RenderHero {...page.hero} />
      <div className="container min-w-0 px-4 md:px-8 [&>*]:my-10 sm:[&>*]:my-12 md:[&>*]:my-16">
        <RenderBlocks blocks={page.layout} />
      </div>
    </article>
  );
}
