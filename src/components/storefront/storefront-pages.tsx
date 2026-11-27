import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Category, Product } from "@/lib/core/types/payload-types";
import { formatPrice, resolveMediaUrl } from "@/lib/core/util";

export function StorefrontShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="sv-page min-h-screen bg-[#070b12] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080e18]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Sky View Store home">
            <span className="grid size-10 place-items-center rounded-xl border border-cyan-200/40 bg-cyan-200/10 font-black text-cyan-100">SV</span>
            <span className="text-xs font-extrabold tracking-[.18em]">SKY VIEW <span className="font-light text-white/45">STORE</span></span>
          </Link>
          <nav aria-label="Store navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-bold uppercase tracking-[.13em] text-white/65">
            <Link className="transition hover:text-cyan-200" href="/">Home</Link>
            <Link className="transition hover:text-cyan-200" href="/shop">Shop</Link>
            <Link className="transition hover:text-cyan-200" href="/categories">Categories</Link>
            <Link className="transition hover:text-cyan-200" href="/deals">Deals</Link>
            <Link className="transition hover:text-cyan-200" href="/about">About</Link>
            <Link className="transition hover:text-cyan-200" href="/help">Help</Link>
          </nav>
          <Link href="/checkout" className="rounded-full bg-cyan-200 px-4 py-2.5 text-[9px] font-extrabold uppercase tracking-[.12em] text-[#07111a] transition hover:bg-white">Checkout ↗</Link>
        </div>
      </header>
      <main className="mx-auto min-h-[65vh] max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[.28em] text-cyan-200">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.04] tracking-[-.055em] sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">{description}</p>
        </div>
        {children}
      </main>
      <footer className="border-t border-white/10 bg-[#090f19]">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          <div><Link href="/" className="text-xs font-extrabold tracking-[.18em]">SKY VIEW STORE</Link><p className="mt-3 max-w-xs text-xs leading-6 text-white/40">A modern shopping destination built around discovery, clear listings and a better customer experience.</p></div>
          <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-cyan-200">Explore</p><div className="mt-4 grid gap-3 text-xs text-white/55"><Link href="/shop" className="hover:text-white">Shop all</Link><Link href="/categories" className="hover:text-white">Categories</Link><Link href="/deals" className="hover:text-white">Deals</Link></div></div>
          <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-cyan-200">Information</p><div className="mt-4 grid gap-3 text-xs text-white/55"><Link href="/about" className="hover:text-white">About us</Link><Link href="/shipping" className="hover:text-white">Shipping</Link><Link href="/returns" className="hover:text-white">Returns</Link></div></div>
          <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-cyan-200">Support</p><div className="mt-4 grid gap-3 text-xs text-white/55"><Link href="/help" className="hover:text-white">Help centre</Link><Link href="/contact" className="hover:text-white">Contact</Link><Link href="/privacy" className="hover:text-white">Privacy</Link></div></div>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-[9px] uppercase tracking-[.15em] text-white/30">© {new Date().getFullYear()} Sky View Store · Ethiopia · Demo checkout only</div>
      </footer>
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.025] px-6 py-16 text-center"><p className="text-lg font-semibold">No published products yet</p><p className="mt-2 text-sm text-white/45">Products will appear here after the store admin publishes authorized listings.</p></div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const demo = Boolean((product as Product & { isDemo?: boolean }).isDemo);
        const demoImage = (product as Product & { demoImageUrl?: string }).demoImageUrl;
        const image = product.meta?.image && typeof product.meta.image === "object" ? resolveMediaUrl(product.meta.image) : demo && demoImage ? demoImage : null;
        const external = product.listingType === "external" && Boolean(product.externalUrl);
        const price = Number(product.priceInUSD ?? 0);
        const href = external ? product.externalUrl! : `/product/${product.slug}`;
        return (
          <article key={product.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101a28] transition duration-300 hover:-translate-y-1 hover:border-cyan-200/50 hover:shadow-[0_20px_60px_rgba(0,0,0,.28)]">
            <Link href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="block">
              <div className="relative aspect-square overflow-hidden bg-[#172436]">
                {image ? <Image src={image} alt={product.title} fill unoptimized sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-4xl text-cyan-100/30">✦</div>}
                <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.12em]">{demo ? "DEMO PRODUCT" : external ? "External seller" : "Sky View Store"}</span>
              </div>
              <div className="p-4">
                <h2 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">{product.title}</h2>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <div><p className="text-sm font-bold">{formatPrice(price)}</p>{product.originalPriceInUSD && product.originalPriceInUSD > price ? <p className="mt-1 text-[10px] text-white/35 line-through">{formatPrice(product.originalPriceInUSD)}</p> : null}</div>
                  <span className="grid size-9 place-items-center rounded-full border border-cyan-200/40 text-cyan-100 transition group-hover:bg-cyan-200 group-hover:text-[#07111a]">{external ? "↗" : "→"}</span>
                </div>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (!categories.length) return <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-white/50">Categories will appear here when published by the store admin.</div>;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category, index) => <Link key={category.id} href={`/category/${category.slug}`} className="group rounded-2xl border border-white/10 bg-gradient-to-br from-[#142b40] to-[#101522] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-200/50"><span className="text-[9px] font-bold tracking-[.22em] text-cyan-200">COLLECTION / {String(index + 1).padStart(2, "0")}</span><h2 className="mt-8 text-2xl font-semibold tracking-tight">{category.title}</h2><p className="mt-3 text-xs text-white/45">Explore products in this collection.</p><span className="mt-8 inline-flex text-[9px] font-bold uppercase tracking-[.15em] text-cyan-100">Explore collection ↗</span></Link>)}</div>;
}
