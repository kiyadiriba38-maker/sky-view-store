"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import type { Category, Product } from "@/lib/core/types/payload-types";
import { formatPrice, resolveMediaUrl } from "@/lib/core/util";

export function StorefrontShell({
  eyebrow,
  title,
  description,
  children,
  page,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  page?: "shop" | "categories" | "deals";
}) {
  const t = useTranslations("marketplace");
  const localizedCopy = page === "shop"
    ? { eyebrow: t("shopEyebrow"), title: t("shopTitle"), description: t("shopDescription") }
    : page === "categories"
      ? { eyebrow: t("categoriesEyebrow"), title: t("categoriesTitle"), description: t("categoriesDescription") }
      : page === "deals"
        ? { eyebrow: t("dealsEyebrow"), title: t("dealsTitle"), description: t("dealsDescription") }
        : { eyebrow, title, description };
  return (
    <div className="sv-page min-h-screen bg-[#070b12] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080e18]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label={t("home")}>
            <span className="grid size-10 place-items-center rounded-xl border border-cyan-200/40 bg-cyan-200/10 font-black text-cyan-100">SV</span>
            <span className="text-xs font-extrabold tracking-[.18em]">SKY VIEW <span className="font-light text-white/45">STORE</span></span>
          </Link>
          <nav aria-label="Store navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-bold uppercase tracking-[.13em] text-white/65">
            <Link className="transition hover:text-cyan-200" href="/">{t("home")}</Link>
            <Link className="transition hover:text-cyan-200" href="/shop">{t("shop")}</Link>
            <Link className="transition hover:text-cyan-200" href="/categories">{t("categories")}</Link>
            <Link className="transition hover:text-cyan-200" href="/deals">{t("deals")}</Link>
            <Link className="transition hover:text-cyan-200" href="/about">{t("about")}</Link>
            <Link className="transition hover:text-cyan-200" href="/help">{t("help")}</Link>
          </nav>
          <Link href="/checkout" className="rounded-full bg-cyan-200 px-4 py-2.5 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#07111a] transition hover:bg-white">{t("checkout")} ↗</Link>
        </div>
      </header>
      <main className="mx-auto min-h-[65vh] max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[.28em] text-cyan-200">{localizedCopy.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.04] tracking-[-.055em] sm:text-6xl">{localizedCopy.title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">{localizedCopy.description}</p>
        </div>
        {children}
      </main>
      <footer className="border-t border-white/10 bg-[#090f19]">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          <div><Link href="/" className="text-xs font-extrabold tracking-[.18em]">SKY VIEW STORE</Link><p className="mt-3 max-w-xs text-xs leading-6 text-white/40">{t("footerTagline")}</p></div>
          <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-cyan-200">{t("explore")}</p><div className="mt-4 grid gap-3 text-xs text-white/55"><Link href="/shop" className="hover:text-white">{t("shopAll")}</Link><Link href="/categories" className="hover:text-white">{t("categories")}</Link><Link href="/deals" className="hover:text-white">{t("deals")}</Link></div></div>
          <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-cyan-200">{t("information")}</p><div className="mt-4 grid gap-3 text-xs text-white/55"><Link href="/about" className="hover:text-white">{t("about")}</Link><Link href="/shipping" className="hover:text-white">{t("shipping")}</Link><Link href="/returns" className="hover:text-white">{t("returns")}</Link></div></div>
          <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-cyan-200">{t("support")}</p><div className="mt-4 grid gap-3 text-xs text-white/55"><Link href="/help" className="hover:text-white">{t("help")}</Link><Link href="/contact" className="hover:text-white">{t("contact")}</Link><Link href="/privacy" className="hover:text-white">{t("privacy")}</Link></div></div>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-[9px] uppercase tracking-[.15em] text-white/30">{t("copyright", { year: new Date().getFullYear() })}</div>
      </footer>
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  const t = useTranslations("marketplace");
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [listingFilter, setListingFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const visibleProducts = useMemo(() => products.filter((product) => {
    const demo = Boolean((product as Product & { isDemo?: boolean }).isDemo);
    const matchesType = listingFilter === "all" || (listingFilter === "demo" ? demo : !demo);
    const matchesSearch = `${product.title} ${product.slug}`.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  }).sort((a, b) => sort === "price-low" ? Number(a.priceInUSD ?? 0) - Number(b.priceInUSD ?? 0) : sort === "price-high" ? Number(b.priceInUSD ?? 0) - Number(a.priceInUSD ?? 0) : sort === "newest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0), [products, listingFilter, search, sort]);
  const toggleCompare = (slug: string) => setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length < 4 ? [...current, slug] : current);
  if (!products.length) {
    return <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.025] px-6 py-16 text-center"><p className="text-lg font-semibold">{t("noProductsYet")}</p><p className="mt-2 text-sm text-white/45">{t("adminPublishedProducts")}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#101a28] p-4">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchProducts")} aria-label={t("searchProducts")} className="min-w-[12rem] flex-1 rounded-xl border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-200" />
        <select value={listingFilter} onChange={(event) => setListingFilter(event.target.value)} aria-label="Filter product type" className="rounded-xl border border-white/15 bg-[#0b1420] px-3 py-3 text-xs text-white"><option value="all">{t("allListings")}</option><option value="demo">{t("demoProducts")}</option><option value="real">{t("realProducts")}</option></select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products" className="rounded-xl border border-white/15 bg-[#0b1420] px-3 py-3 text-xs text-white"><option value="featured">{t("featured")}</option><option value="price-low">{t("priceLowToHigh")}</option><option value="price-high">{t("priceHighToLow")}</option><option value="newest">{t("newest")}</option></select>
        <span className="text-[10px] text-white/40">{visibleProducts.length} {t("productsFound")}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visibleProducts.map((product) => {
        const demo = Boolean((product as Product & { isDemo?: boolean }).isDemo);
        const demoImage = (product as Product & { demoImageUrl?: string }).demoImageUrl;
        const sellerImage = (product as Product & { productImageUrl?: string }).productImageUrl;
        const image = product.meta?.image && typeof product.meta.image === "object" ? resolveMediaUrl(product.meta.image) : demo ? demoImage ?? null : sellerImage ?? null;
        const price = Number(product.priceInUSD ?? 0);
        const href = `/product/${product.slug}`;
        return (
          <article key={product.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101a28] transition duration-300 hover:-translate-y-1 hover:border-cyan-200/50 hover:shadow-[0_20px_60px_rgba(0,0,0,.28)]">
            <Link href={href} className="block">
              <div className="relative aspect-square overflow-hidden bg-[#172436]">
                {image ? <Image src={image} alt={product.title} fill unoptimized sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-4xl text-cyan-100/30">✦</div>}
                <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.12em]">{demo ? t("listingDemo") : product.listingType === "marketplace_seller" ? t("approvedSeller") : t("storeProduct")}</span>
              </div>
              <div className="p-4">
                <h2 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">{product.title}</h2>
                {demo ? <p className="mt-2 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-[8px] font-bold tracking-wider text-amber-200">{t("demoOnly")} · {t("demoProducts")}</p> : null}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <div><p className="text-sm font-bold">{formatPrice(price)}</p>{product.originalPriceInUSD && product.originalPriceInUSD > price ? <p className="mt-1 text-[10px] text-white/35 line-through">{formatPrice(product.originalPriceInUSD)}</p> : null}</div>
                  <span className="grid size-9 place-items-center rounded-full border border-cyan-200/40 text-cyan-100 transition group-hover:bg-cyan-200 group-hover:text-[#07111a]">{"→"}</span>
                </div>
              </div>
            </Link>
            <div className="px-4 pb-4"><button type="button" onClick={() => toggleCompare(product.slug)} aria-pressed={selected.includes(product.slug)} className={`rounded-full border px-3 py-2 text-[9px] font-bold uppercase tracking-wider transition ${selected.includes(product.slug) ? "border-cyan-200 bg-cyan-200 text-[#07111a]" : "border-white/15 text-white/55 hover:border-cyan-200/50 hover:text-cyan-100"}`}>{selected.includes(product.slug) ? "Added to compare" : "Compare"}</button></div>
          </article>
        );
      })}
      </div>
      {!visibleProducts.length ? <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-white/45">{t("noProductsMatch")}</div> : null}
      {selected.length ? <div className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-200/25 bg-[#0c1724]/95 p-4 shadow-2xl backdrop-blur-xl"><div><p className="text-sm font-semibold text-white">{t("selectedOfFour", { count: selected.length })}</p><p className="mt-1 text-[10px] text-white/45">{t("compareDetails")}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => setSelected([])} className="rounded-full border border-white/15 px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-white/60">{t("clearSelection")}</button><Link href={`/compare?items=${encodeURIComponent(selected.join(","))}`} className="rounded-full bg-cyan-200 px-5 py-3 text-[9px] font-extrabold uppercase tracking-wider text-[#07111a]">{t("compareNow")} ↗</Link></div></div> : null}
    </div>
  );
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const t = useTranslations("marketplace");
  if (!categories.length) return <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-white/50">{t("noCategories")}</div>;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category, index) => <Link key={category.id} href={`/category/${category.slug}`} className="group rounded-2xl border border-white/10 bg-gradient-to-br from-[#142b40] to-[#101522] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-200/50"><span className="text-[9px] font-bold tracking-[.22em] text-cyan-200">{t("collection")} / {String(index + 1).padStart(2, "0")}</span><h2 className="mt-8 text-2xl font-semibold tracking-tight">{category.title}</h2><p className="mt-3 text-xs text-white/45">{t("exploreProductsInCollection")}</p><span className="mt-8 inline-flex text-[9px] font-bold uppercase tracking-[.15em] text-cyan-100">{t("exploreCollection")} ↗</span></Link>)}</div>;
}
