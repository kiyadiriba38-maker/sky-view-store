import type { Metadata } from "next";
import Link from "next/link";

import StorefrontImage from "@/components/storefront/storefront-image";
import { StorefrontShell, ProductGrid } from "@/components/storefront/storefront-pages";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "@/lib/demo/catalog";
import DAL from "@/lib/core/dal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Deals | Sky View Store",
  description: "Explore clearly labelled sample offers and published marketplace deals.",
};

export default async function DealsPage() {
  const products = await DAL.queryAllProducts();
  const deals = products.filter(
    (product) =>
      Number(product.originalPriceInUSD ?? 0) > Number(product.priceInUSD ?? 0),
  );

  return (
    <StorefrontShell
      page="deals"
      eyebrow="Offers / 02"
      title="Deals worth discovering."
      description="Explore sample offers from the demo catalogue alongside published marketplace deals. Demo prices are illustrative, not live offers."
    >
      <section aria-labelledby="demo-deals-heading" className="mb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.24em] text-amber-300">DEMO COLLECTION · SAMPLE PRICES</p>
            <h2 id="demo-deals-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Featured demo picks</h2>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-white/45">These sample listings help you explore the product and checkout experience. They are not real sale offers or confirmed stock.</p>
          </div>
          <Link href="/shop?type=demo" className="text-[9px] font-bold uppercase tracking-[.14em] text-amber-200 transition hover:text-white">Browse demo catalogue ↗</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DEMO_PRODUCTS.filter((product) => product.originalPriceETB > product.priceETB).slice(0, 12).map((product, index) => (
            <article key={product.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#191919] transition duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-[0_20px_60px_rgba(0,0,0,.28)]">
              <Link href={`/demo-product/${product.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#222]">
                  <StorefrontImage
                    src={product.image}
                    fallbackSrc={DEMO_CATEGORIES.find((category) => category.slug === product.categorySlug)?.image ?? DEMO_CATEGORIES[2].image}
                    alt={product.title}
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-amber-200/30 bg-black/65 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.13em] text-amber-100">DEMO PICK · {String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[.14em] text-white/35">{product.category}</p>
                  <h3 className="mt-2 min-h-10 text-sm font-semibold leading-5 text-white">{product.title}</h3>
                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-sm font-bold tabular-nums text-amber-100">{product.priceETB.toLocaleString("en-ET", { maximumFractionDigits: 0 })} ETB</p>
                      <p className="mt-1 text-[10px] text-white/35 line-through">{product.originalPriceETB.toLocaleString("en-ET", { maximumFractionDigits: 0 })} ETB</p>
                    </div>
                    <span className="grid size-9 place-items-center rounded-full border border-amber-300/40 text-amber-100 transition group-hover:bg-amber-300 group-hover:text-[#121212]">↗</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="published-deals-heading">
        <div className="mb-6">
          <p className="text-[9px] font-bold uppercase tracking-[.24em] text-amber-300">LIVE MARKETPLACE LISTINGS</p>
          <h2 id="published-deals-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Published deals</h2>
          <p className="mt-2 text-xs leading-6 text-white/45">Only published products with a valid original price above the current price appear here.</p>
        </div>
        <ProductGrid products={deals} />
      </section>
    </StorefrontShell>
  );
}
