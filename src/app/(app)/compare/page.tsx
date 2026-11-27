import Link from "next/link";

import type { Metadata } from "next";

import { StorefrontShell } from "@/components/storefront/storefront-pages";
import DAL from "@/lib/core/dal";
import { formatPrice } from "@/lib/core/util";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Compare products | Sky View Store", description: "Compare marketplace products side by side." };

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ items?: string }> }) {
  const params = await searchParams;
  const slugs = [...new Set((params.items ?? "").split(",").map((slug) => slug.trim()).filter(Boolean))].slice(0, 4);
  const fetchedProducts = await Promise.all(slugs.map((slug) => DAL.queryProductBySlug(slug)));
  const products = fetchedProducts.filter((product): product is NonNullable<typeof product> => product !== null);
  if (!products.length) {
    return <StorefrontShell eyebrow="Product tools / Compare" title="Compare products." description="Choose up to four products from the catalogue to compare them side by side."><div className="rounded-2xl border border-dashed border-white/15 p-10 text-center"><p className="text-sm text-white/60">No products selected yet.</p><Link href="/shop" className="mt-5 inline-flex rounded-full bg-cyan-200 px-5 py-3 text-xs font-bold text-[#07111a]">Browse products ↗</Link></div></StorefrontShell>;
  }

  const rows = [
    { label: "Price", value: (product: (typeof products)[number]) => formatPrice(Number(product.priceInUSD ?? product.purchase_section.price ?? 0)) },
    { label: "Original price", value: (product: NonNullable<(typeof products)[number]>) => product.originalPriceInUSD ? formatPrice(product.originalPriceInUSD) : "—" },
    { label: "Availability", value: (product: NonNullable<(typeof products)[number]>) => Number(product.inventory ?? 0) > 0 ? `In stock · ${product.inventory}` : "Check variants / availability" },
    { label: "Listing type", value: (product: NonNullable<(typeof products)[number]>) => (product as typeof product & { isDemo?: boolean }).isDemo ? "DEMO product · simulated order" : (product as typeof product & { listingType?: string }).listingType === "marketplace_seller" ? "Approved marketplace seller" : "Sky View Store" },
    { label: "Categories", value: (product: NonNullable<(typeof products)[number]>) => product.categories?.map((category) => typeof category === "object" ? category.title : "").filter(Boolean).join(", ") || "—" },
    { label: "Variants", value: (product: NonNullable<(typeof products)[number]>) => product.enableVariants ? "Available" : "Single listing" },
  ];

  return (
    <StorefrontShell eyebrow="Product tools / Compare" title="Compare products." description="Review important differences side by side. Demo listings are clearly identified and do not represent real inventory.">
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#101a28]">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead><tr><th className="w-40 border-b border-white/10 p-4 text-xs uppercase tracking-wider text-white/40">Details</th>{products.map((product) => <th key={product!.id} className="min-w-48 border-b border-white/10 p-4 align-top"><Link href={`/product/${product!.slug}`} className="font-semibold text-white hover:text-cyan-200">{product!.title}</Link><p className="mt-2 text-xs font-bold text-cyan-200">{formatPrice(Number(product!.priceInUSD ?? product!.purchase_section.price ?? 0))}</p></th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr key={row.label}><th className="border-b border-white/10 p-4 text-xs font-semibold text-white/50">{row.label}</th>{products.map((product) => <td key={product!.id} className="border-b border-white/10 p-4 text-xs leading-6 text-white/75">{row.value(product!)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/shop" className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold text-white/70">Back to catalogue</Link><Link href="/cart" className="rounded-full bg-cyan-200 px-5 py-3 text-xs font-bold text-[#07111a]">Open cart ↗</Link></div>
    </StorefrontShell>
  );
}
