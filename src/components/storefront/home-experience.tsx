"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type CatalogProduct = {
  title: string;
  slug: string;
  image: string | null;
  price: number;
  originalPrice: number | null;
  listingType?: "own_store" | "external" | null;
  externalUrl?: string | null;
};

const previewProducts = [
  { name: "Studio wireless headphones", category: "Audio", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85", tag: "AUDIO / 01" },
  { name: "Everyday smart watch", category: "Wearables", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85", tag: "WEARABLES / 02" },
  { name: "Instant film camera", category: "Cameras", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85", tag: "CAMERA / 03" },
  { name: "Urban carry backpack", category: "Lifestyle", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85", tag: "CARRY / 04" },
  { name: "Minimal desk setup", category: "Workspace", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85", tag: "WORKSPACE / 05" },
  { name: "Performance running shoes", category: "Lifestyle", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", tag: "MOTION / 06" },
  { name: "Portable bluetooth speaker", category: "Audio", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85", tag: "AUDIO / 07" },
  { name: "Mechanical keyboard", category: "Workspace", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85", tag: "DESK / 08" },
  { name: "Premium camera lens", category: "Cameras", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85", tag: "OPTICS / 09" },
  { name: "Modern home lighting", category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85", tag: "HOME / 10" },
  { name: "Travel essentials case", category: "Lifestyle", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85", tag: "TRAVEL / 11" },
  { name: "Smart home speaker", category: "Home", image: "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=900&q=85", tag: "SMART HOME / 12" },
  { name: "Wireless charging dock", category: "Tech", image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=85", tag: "POWER / 13" },
  { name: "Sculpted everyday bottle", category: "Lifestyle", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85", tag: "OBJECT / 14" },
  { name: "Compact tablet setup", category: "Tech", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85", tag: "TECH / 15" },
  { name: "Design-led sunglasses", category: "Accessories", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85", tag: "STYLE / 16" },
];

const categoryTiles = [
  { name: "Technology", count: "01", copy: "Smart ideas. Better everyday.", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=85" },
  { name: "Audio", count: "02", copy: "Find your own frequency.", image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=85" },
  { name: "Wearables", count: "03", copy: "Made to move with you.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85" },
  { name: "Workspace", count: "04", copy: "Make room for good work.", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=85" },
  { name: "Home", count: "05", copy: "Thoughtful details for living.", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85" },
  { name: "Lifestyle", count: "06", copy: "The pieces that go places.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85" },
];

const filters = ["All", "Tech", "Audio", "Wearables", "Cameras", "Workspace", "Home", "Lifestyle", "Accessories"];

const formatETB = (amount: number) =>
  new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(amount);

export default function HomeExperience({ catalogProducts = [] }: { catalogProducts?: CatalogProduct[] }) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const cards = useMemo(() => {
    const live = catalogProducts.length > 0;
    const items = live
      ? catalogProducts.slice(0, 24).map((item, index) => ({
          name: item.title,
          category: "Store catalogue",
          image: item.image || previewProducts[index % previewProducts.length].image,
          tag: item.listingType === "external" ? "EXTERNAL LISTING" : "SKY VIEW STORE",
          price: formatETB(item.price),
          oldPrice: item.originalPrice && item.originalPrice > item.price ? formatETB(item.originalPrice) : null,
          href: item.listingType === "external" && item.externalUrl && /^https?:\/\//i.test(item.externalUrl) ? item.externalUrl : `/product/${item.slug}`,
          external: item.listingType === "external" && Boolean(item.externalUrl && /^https?:\/\//i.test(item.externalUrl)),
          preview: false,
        }))
      : previewProducts.map((item) => ({
          name: item.name,
          category: item.category,
          image: item.image,
          tag: item.tag,
          price: null as string | null,
          oldPrice: null as string | null,
          href: null as string | null,
          external: false,
          preview: true,
        }));
    return items.filter((item) => {
      const matchesQuery = `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = activeFilter === "All" || item.category.toLowerCase() === activeFilter.toLowerCase();
      return matchesQuery && matchesFilter;
    });
  }, [catalogProducts, query, activeFilter]);

  return (
    <main className="sv-store min-h-screen overflow-hidden bg-[#070b12] text-white">
      <div className="sv-noise pointer-events-none fixed inset-0 z-0 opacity-[.13]" />
      <div className="relative z-10">
        <div className="border-b border-white/10 bg-[#101925] px-4 py-2 text-center text-[9px] font-semibold uppercase tracking-[.24em] text-white/60 sm:text-[10px]">
          A new way to discover everyday essentials <span className="mx-2 text-cyan-300">✦</span> Addis Ababa · Ethiopia
        </div>

        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b12]/85 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-14">
            <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Sky View Store home">
              <span className="grid size-10 place-items-center rounded-xl border border-cyan-200/50 bg-cyan-200/10 text-sm font-black tracking-tighter text-cyan-100 shadow-[0_0_30px_rgba(103,232,249,.12)]">SV</span>
              <span className="text-[12px] font-extrabold uppercase tracking-[.2em]">SKY VIEW <span className="font-light text-white/45">STORE</span></span>
            </Link>
            <nav className="order-3 flex w-full items-center gap-5 overflow-x-auto whitespace-nowrap pb-1 text-[9px] font-bold uppercase tracking-[.14em] text-white/55 lg:order-none lg:w-auto lg:gap-6 lg:text-[10px]" aria-label="Main navigation">
              <a href="#discover" className="transition hover:text-cyan-200">Discover</a>
              <Link href="/shop" className="transition hover:text-cyan-200">Shop</Link>
              <Link href="/categories" className="transition hover:text-cyan-200">Categories</Link>
              <Link href="/deals" className="transition hover:text-cyan-200">Deals</Link>
              <Link href="/about" className="transition hover:text-cyan-200">About</Link>
              <Link href="/help" className="transition hover:text-cyan-200">Help</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/cart" className="hidden rounded-full border border-white/15 px-4 py-2.5 text-[9px] font-bold uppercase tracking-[.16em] text-white/75 transition hover:border-cyan-200 hover:text-cyan-100 sm:inline-flex">Your cart ↗</Link>
              <a href="#catalogue" className="rounded-full bg-cyan-200 px-4 py-2.5 text-[9px] font-extrabold uppercase tracking-[.16em] text-[#07111a] transition hover:-translate-y-0.5 hover:bg-white sm:px-5">Explore store <span className="ml-1">↗</span></a>
            </div>
          </div>
        </header>

        <section id="discover" className="mx-auto max-w-[1500px] px-4 pb-14 pt-5 sm:px-8 sm:pt-8 lg:px-14 lg:pb-20">
          <div className="relative isolate grid min-h-[620px] overflow-hidden rounded-[26px] border border-white/10 bg-[#111d2a] lg:grid-cols-[.92fr_1.08fr]">
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_15%_25%,rgba(34,211,238,.18),transparent_38%),radial-gradient(ellipse_at_80%_80%,rgba(99,102,241,.18),transparent_35%)]" />
            <div className="absolute inset-0 -z-10 opacity-[.18]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px)", backgroundSize: "58px 58px", maskImage: "linear-gradient(90deg,black,transparent 85%)" }} />
            <div className="flex flex-col justify-between p-7 sm:p-11 lg:p-14">
              <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[.26em] text-cyan-200"><span className="size-2 rounded-full bg-cyan-200 shadow-[0_0_14px_#67e8f9]" /> The next generation of shopping</div>
              <div className="relative z-10 py-12">
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[.3em] text-white/45">Discover something different / 2026</p>
                <h1 className="max-w-[700px] text-[clamp(3.4rem,7vw,6.8rem)] font-semibold leading-[.91] tracking-[-.075em]">Find your<br /><span className="bg-gradient-to-r from-cyan-200 via-white to-indigo-200 bg-clip-text text-transparent">next favorite.</span></h1>
                <p className="mt-7 max-w-md text-sm leading-7 text-white/55 sm:text-base">A fresh universe of technology, design and everyday essentials. Explore the collection and discover what fits your world.</p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <a href="#catalogue" className="group inline-flex items-center gap-8 rounded-full bg-cyan-200 px-6 py-4 text-[10px] font-extrabold uppercase tracking-[.17em] text-[#07111a] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_45px_rgba(103,232,249,.25)]">Explore collection <span className="text-base transition group-hover:translate-x-1">↗</span></a>
                  <a href="#categories" className="inline-flex items-center rounded-full border border-white/20 px-6 py-4 text-[10px] font-bold uppercase tracking-[.17em] text-white/80 transition hover:border-cyan-200 hover:text-cyan-100">Browse categories</a>
                </div>
              </div>
              <div className="flex items-center gap-5 border-t border-white/10 pt-5 text-[9px] uppercase tracking-[.2em] text-white/35"><span>Designed for discovery</span><span className="h-px w-8 bg-cyan-200/50" /><span>Built for everyday</span></div>
            </div>
            <div className="relative min-h-[340px] overflow-hidden lg:min-h-full">
              <Image src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=90" alt="Curated modern technology and everyday devices" fill priority unoptimized sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover object-center opacity-85" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07111a]/80 via-transparent to-[#07111a]/10 lg:bg-gradient-to-r lg:from-[#111d2a] lg:via-[#111d2a]/15 lg:to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 sm:bottom-10 sm:left-10 sm:right-10">
                <div className="rounded-2xl border border-white/20 bg-[#07111a]/55 p-4 backdrop-blur-xl"><p className="text-[8px] font-bold uppercase tracking-[.25em] text-cyan-200">The Sky View edit</p><p className="mt-1 text-lg font-semibold">Objects with purpose.</p></div>
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-white/40 bg-white/10 text-xl backdrop-blur">↗</span>
              </div>
              <div className="absolute right-7 top-7 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-[8px] font-bold uppercase tracking-[.24em] backdrop-blur-xl">SV / 001 — Discover</div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1500px] grid-cols-2 gap-px border-y border-white/10 bg-white/10 px-4 sm:grid-cols-4 sm:px-8 lg:px-14">
          {[
            ["01", "Curated discovery", "A clear place to explore"],
            ["02", "ETB-ready", "Built around Ethiopia"],
            ["03", "Secure by design", "A thoughtful shopping flow"],
            ["04", "Always evolving", "New collections ahead"],
          ].map(([number, title, copy]) => <div key={number} className="bg-[#070b12] px-4 py-6 sm:px-6"><span className="text-[9px] font-bold tracking-[.22em] text-cyan-200">{number} /</span><p className="mt-3 text-xs font-bold uppercase tracking-[.08em]">{title}</p><p className="mt-1 text-[10px] text-white/40">{copy}</p></div>)}
        </section>

        <section id="categories" className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-14 lg:py-24">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-5"><div><p className="text-[9px] font-bold uppercase tracking-[.3em] text-cyan-200">Browse your world / 01</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Explore the universe.</h2></div><p className="max-w-xs text-xs leading-6 text-white/40">From everyday tech to details that make a space yours. Start with what interests you.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categoryTiles.map((category) => <a key={category.name} href="#catalogue" onClick={() => setActiveFilter(category.name === "Technology" ? "Tech" : category.name)} className="group relative isolate flex min-h-[235px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#111a27] p-5 transition duration-500 hover:-translate-y-1 hover:border-cyan-200/50 sm:min-h-[280px] sm:p-7"><Image src={category.image} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-35 transition duration-700 group-hover:scale-105 group-hover:opacity-55" /><div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#070b12] via-[#070b12]/20 to-transparent" /><div className="flex items-center justify-between"><span className="text-[9px] font-bold tracking-[.25em] text-cyan-100">{category.count} / COLLECTION</span><span className="grid size-9 place-items-center rounded-full border border-white/30 transition group-hover:rotate-45 group-hover:border-cyan-200 group-hover:bg-cyan-200 group-hover:text-[#07111a]">↗</span></div><div><h3 className="text-2xl font-semibold tracking-tight">{category.name}</h3><p className="mt-2 text-xs text-white/55">{category.copy}</p></div></a>)}
          </div>
        </section>

        <section id="catalogue" className="border-y border-white/10 bg-[#0c131e] px-5 py-20 sm:px-8 lg:px-14 lg:py-24">
          <div className="mx-auto max-w-[1500px]">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div><p className="text-[9px] font-bold uppercase tracking-[.3em] text-cyan-200">The collection / 02</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">The good stuff.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/45">{catalogProducts.length ? "Browse products published in the Sky View Store catalogue. Store items and independent marketplace listings are identified separately." : "Explore this visual catalogue preview. These sample concepts are not live stock and cannot be purchased; real products appear here when authorized listings are published."}</p></div>
              <div className="w-full max-w-md"><label htmlFor="sv-search" className="mb-2 block text-[9px] font-bold uppercase tracking-[.2em] text-white/45">Find something</label><div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/[.04] px-5 py-3.5 transition focus-within:border-cyan-200/70"><span className="text-cyan-200">⌕</span><input id="sv-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products and categories..." className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/30" /></div></div>
            </div>
            <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2">{filters.map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={`shrink-0 rounded-full border px-4 py-2.5 text-[9px] font-bold uppercase tracking-[.14em] transition ${activeFilter === filter ? "border-cyan-200 bg-cyan-200 text-[#07111a]" : "border-white/15 text-white/55 hover:border-cyan-200/60 hover:text-cyan-100"}`}>{filter}</button>)}</div>
            <div className="mt-8 flex items-center justify-between border-b border-white/10 pb-4 text-[9px] font-bold uppercase tracking-[.2em] text-white/35"><span>{cards.length} {catalogProducts.length ? "catalogue items" : "preview concepts"}</span><span>{catalogProducts.length ? "Published listings" : "Concept preview only"}</span></div>
            {cards.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((product, index) => <article key={product.name} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111a27] transition duration-500 hover:-translate-y-1 hover:border-cyan-200/45 hover:shadow-[0_24px_60px_rgba(0,0,0,.3)]"><div className="relative aspect-[4/4.2] overflow-hidden bg-[#182333]"><Image src={product.image} alt={product.name} fill unoptimized sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" /><span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.15em] backdrop-blur">{product.preview ? "Preview concept" : product.tag}</span><span className="absolute bottom-3 right-4 text-[9px] font-bold tracking-[.2em] text-white/65">{String(index + 1).padStart(2, "0")}</span></div><div className="p-4 sm:p-5"><p className="text-[8px] font-bold uppercase tracking-[.22em] text-cyan-200/70">{product.category}</p><h3 className="mt-2 min-h-11 text-sm font-semibold leading-5">{product.name}</h3><div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4"><div>{product.price ? <><p className="text-sm font-bold">{product.price}</p>{product.oldPrice ? <p className="mt-1 text-[10px] text-white/35 line-through">{product.oldPrice}</p> : null}</> : <p className="text-[9px] font-semibold uppercase tracking-[.12em] text-white/35">Not listed for sale</p>}</div>{product.href ? <a href={product.href} target={product.external ? "_blank" : undefined} rel={product.external ? "noopener noreferrer" : undefined} className="grid size-10 place-items-center rounded-full border border-cyan-200/50 text-cyan-100 transition group-hover:bg-cyan-200 group-hover:text-[#07111a]">{product.external ? "↗" : "→"}</a> : <span className="rounded-full border border-white/10 px-3 py-2 text-[8px] font-bold uppercase tracking-[.12em] text-white/35">Preview</span>}</div></div></article>)}
            </div> : <div className="mt-5 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center"><p className="text-lg font-semibold">No matching products</p><p className="mt-2 text-xs text-white/40">Try another search or choose a different category.</p><button onClick={() => { setQuery(""); setActiveFilter("All"); }} className="mt-5 rounded-full border border-cyan-200/50 px-5 py-3 text-[9px] font-bold uppercase tracking-[.15em] text-cyan-100 transition hover:bg-cyan-200 hover:text-[#07111a]">Clear filters</button></div>}
          </div>
        </section>

        <section id="experience" className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div><p className="text-[9px] font-bold uppercase tracking-[.3em] text-cyan-200">The Sky View experience / 03</p><h2 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-.055em] sm:text-6xl">Shopping should feel <span className="text-cyan-200">effortless.</span></h2><p className="mt-6 max-w-lg text-sm leading-7 text-white/45">A good store is more than a product grid. We are building a connected experience around discovery, clear product information, customer feedback and order visibility.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["01", "Discover", "Search, explore categories and compare products."],
                ["02", "Decide", "Clear product details, options and customer reviews."],
                ["03", "Manage", "Cart, demo checkout and order history."],
                ["04", "Connect", "A store catalogue alongside clearly marked seller listings."],
              ].map(([number, title, copy]) => <div key={number} className="rounded-2xl border border-white/10 bg-white/[.035] p-6 transition hover:border-cyan-200/40"><span className="text-[9px] font-bold tracking-[.2em] text-cyan-200">{number} / SYSTEM</span><h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-2 text-xs leading-6 text-white/40">{copy}</p></div>)}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-14 lg:pb-28"><div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[26px] border border-cyan-100/20 bg-gradient-to-br from-[#142b40] via-[#101b2c] to-[#111327] p-8 sm:p-12 lg:p-16"><div className="absolute -right-16 -top-24 size-80 rounded-full border border-cyan-100/10 shadow-[0_0_100px_rgba(34,211,238,.12)]" /><div className="absolute -right-2 -top-10 size-52 rounded-full border border-cyan-100/10" /><div className="relative max-w-2xl"><p className="text-[9px] font-bold uppercase tracking-[.3em] text-cyan-200">Your next discovery starts here</p><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">A better way to find what you need.</h2><p className="mt-4 max-w-lg text-sm leading-7 text-white/50">Explore the catalogue, discover new categories and experience the next chapter of Sky View Store.</p><a href="#catalogue" className="mt-8 inline-flex items-center gap-8 rounded-full bg-cyan-200 px-6 py-4 text-[9px] font-extrabold uppercase tracking-[.17em] text-[#07111a] transition hover:-translate-y-1 hover:bg-white">Start exploring <span className="text-base">↗</span></a></div></div></section>

        <footer className="border-t border-white/10 px-5 py-9 sm:px-8 lg:px-14"><div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-5 sm:flex-row sm:items-center"><Link href="/" className="text-xs font-extrabold uppercase tracking-[.2em]">SKY VIEW <span className="font-light text-white/40">STORE</span></Link><div className="flex flex-wrap gap-5 text-[9px] font-bold uppercase tracking-[.16em] text-white/40"><a href="#discover" className="hover:text-cyan-100">Home</a><Link href="/shop" className="hover:text-cyan-100">Shop</Link><Link href="/categories" className="hover:text-cyan-100">Categories</Link><Link href="/deals" className="hover:text-cyan-100">Deals</Link><Link href="/about" className="hover:text-cyan-100">About</Link><Link href="/contact" className="hover:text-cyan-100">Contact</Link><Link href="/help" className="hover:text-cyan-100">Help</Link><Link href="/admin" className="hover:text-cyan-100">Store admin</Link></div><span className="text-[9px] uppercase tracking-[.16em] text-white/25">© 2026 Sky View Store · Ethiopia</span></div></footer>
      </div>
      <style jsx global>{`
        .sv-store { isolation: isolate; }
        .sv-noise { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E"); }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important; } }
      `}</style>
    </main>
  );
}
