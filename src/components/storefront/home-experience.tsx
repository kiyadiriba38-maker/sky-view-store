"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "THE EVERYDAY, REIMAGINED",
    title: "Technology with\na point of view.",
    copy: "Discover considered essentials, standout design and useful technology for the way you live.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=90",
    tag: "AUDIO / 001",
    accent: "from-cyan-300/20",
  },
  {
    eyebrow: "MOVE THROUGH YOUR WORLD",
    title: "Made to move.\nBuilt to last.",
    copy: "A fresh edit of everyday carry, personal tech and accessories that make every day feel different.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=90",
    tag: "OBJECTS / 002",
    accent: "from-emerald-300/20",
  },
  {
    eyebrow: "FORM MEETS FUNCTION",
    title: "The details\nmake the difference.",
    copy: "Explore pieces selected for their design, feel and the little things that make them special.",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1400&q=90",
    tag: "DESIGN / 003",
    accent: "from-orange-300/20",
  },
];

type CatalogProduct = { title: string; slug: string; image: string | null; price: number; originalPrice: number | null; listingType?: "own_store" | "external" | null; externalUrl?: string | null };

const products = [
  { name: "Studio Wireless Headphones", type: "AUDIO · WIRELESS", price: "ETB 8,900", old: "ETB 10,500", badge: "−15%", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85" },
  { name: "Minimal Everyday Watch", type: "ACCESSORIES · TIME", price: "ETB 6,400", old: "ETB 7,200", badge: "−11%", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85" },
  { name: "Instant Film Camera", type: "TECH · CAMERA", price: "ETB 12,800", old: "ETB 14,900", badge: "−14%", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85" },
  { name: "Urban Carry Backpack", type: "EVERYDAY · CARRY", price: "ETB 4,750", old: "ETB 5,500", badge: "−14%", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85" },
];

const categories = [
  { number: "01", name: "Technology", note: "Smart tools for modern life", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=85" },
  { number: "02", name: "Audio", note: "Find your own frequency", image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=85" },
  { number: "03", name: "Accessories", note: "The finishing touches", image: "https://images.unsplash.com/photo-1491553895911-0055?auto=format&fit=crop&w=900&q=85" },
];

export default function HomeExperience({ catalogProducts = [] }: { catalogProducts?: CatalogProduct[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = slides[active];
  const formatETB = (amount: number) =>
    new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(amount);
  const featuredProducts = catalogProducts.length
    ? catalogProducts.slice(0, 8).map((item, index) => {
        const discounted = typeof item.originalPrice === "number" && item.originalPrice > item.price;
        const discount = discounted ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100) : 0;
        return {
          name: item.title,
          type: item.listingType === "external" ? "EXTERNAL MARKETPLACE LISTING" : "SKY VIEW STORE",
          price: formatETB(item.price),
          old: discounted ? formatETB(item.originalPrice!) : "",
          badge: discounted ? `−${discount}%` : "FEATURED",
          image: item.image || products[index % products.length].image,
          href: item.listingType === "external" && item.externalUrl && /^https?:\/\//i.test(item.externalUrl) ? item.externalUrl : `/product/${item.slug}`,
          external: item.listingType === "external" && Boolean(item.externalUrl && /^https?:\/\//i.test(item.externalUrl)),
          sample: false,
        };
      })
    : products.map((item) => ({ ...item, href: null as string | null, sample: true }));

  return (
    <main className="min-h-screen overflow-hidden bg-[#080d10] text-white selection:bg-cyan-200 selection:text-black">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-30" style={{ backgroundImage: "radial-gradient(ellipse at 12% 10%, rgba(34,211,238,.16), transparent 32%), radial-gradient(ellipse at 90% 60%, rgba(16,185,129,.10), transparent 35%)" }} />
      <header className="relative z-20 mx-auto flex max-w-[1500px] items-center justify-between px-5 py-6 sm:px-10 lg:px-16">
        <Link href="/" className="group flex items-center gap-3" aria-label="Sky View Store home">
          <span className="grid size-9 place-items-center border border-cyan-100/50 text-sm font-black tracking-tighter text-cyan-100 transition group-hover:rotate-45 group-hover:bg-cyan-100 group-hover:text-black">SV</span>
          <span className="text-sm font-bold uppercase tracking-[.22em]">SKY VIEW <span className="font-light text-white/50">STORE</span></span>
        </Link>
        <nav className="hidden items-center gap-9 text-[10px] font-semibold uppercase tracking-[.2em] text-white/65 md:flex">
          <a className="transition hover:text-cyan-200" href="#collection">Collection</a>
          <a className="transition hover:text-cyan-200" href="#categories">Categories</a>
          <a className="transition hover:text-cyan-200" href="#story">Our approach</a>
        </nav>
        <a href="#collection" className="rounded-full border border-white/20 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.18em] transition duration-300 hover:border-cyan-200 hover:bg-cyan-200 hover:text-black">Explore store <span aria-hidden="true">↗</span></a>
      </header>

      <section className="relative z-10 mx-auto max-w-[1500px] px-4 pb-16 sm:px-8 lg:px-14">
        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative isolate min-h-[650px] overflow-hidden rounded-[28px] border border-white/10 bg-[#10191e] shadow-[0_35px_100px_rgba(0,0,0,.55)] sm:min-h-[690px]">
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#17333b] via-[#10191e] to-[#080d10]" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,10,13,.96)_0%,rgba(5,10,13,.78)_38%,rgba(5,10,13,.12)_100%)]" />
          <div className="absolute inset-0 -z-10 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "70px 70px", maskImage: "linear-gradient(to right, black, transparent 75%)" }} />
          <div key={active} className="absolute inset-y-0 right-0 -z-10 w-full animate-[heroReveal_900ms_cubic-bezier(.2,.7,.2,1)] sm:w-[68%]">
            <Image src={slide.image} alt="Featured product" fill priority className="object-cover object-center opacity-85 mix-blend-screen" sizes="(max-width: 768px) 100vw, 68vw" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1115] via-[#0a1115]/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1115]/70 via-transparent to-transparent" />
          </div>
          <div className="absolute right-8 top-8 hidden text-right text-[9px] uppercase tracking-[.3em] text-white/40 sm:block"><span className="text-cyan-200">●</span> Live edit<br />Addis Ababa · Ethiopia</div>
          <div className="relative flex min-h-[650px] flex-col justify-between p-7 sm:min-h-[690px] sm:p-12 lg:p-16">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[.28em] text-white/45"><span>Curated essentials / 2026</span><span>{String(active + 1).padStart(2, "0")} <span className="text-white/20">/ 03</span></span></div>
            <div className="max-w-[620px] py-16">
              <p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.3em] text-cyan-200"><span className="h-px w-9 bg-cyan-200" />{slide.eyebrow}</p>
              <h1 className="whitespace-pre-line text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-7xl lg:text-[88px]">{slide.title}</h1>
              <p className="mt-7 max-w-md text-sm leading-7 text-white/60 sm:text-base">{slide.copy}</p>
              <a href="#collection" className="group mt-9 inline-flex items-center gap-8 rounded-full bg-cyan-100 px-6 py-4 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#071014] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_40px_rgba(103,232,249,.25)]">Discover the edit <span className="text-base transition-transform group-hover:translate-x-1">↗</span></a>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-center gap-2">
                {slides.map((item, index) => <button key={item.tag} onClick={() => setActive(index)} aria-label={`Show slide ${index + 1}`} aria-current={active === index} className={`h-[3px] rounded-full transition-all duration-500 ${active === index ? "w-12 bg-cyan-200" : "w-5 bg-white/25 hover:bg-white/60"}`} />)}
                <span className="ml-3 text-[9px] uppercase tracking-[.18em] text-white/40">Auto presentation</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActive((active + slides.length - 1) % slides.length)} aria-label="Previous slide" className="grid size-11 place-items-center rounded-full border border-white/20 text-lg transition hover:border-cyan-200 hover:bg-cyan-200 hover:text-black">←</button>
                <button onClick={() => setActive((active + 1) % slides.length)} aria-label="Next slide" className="grid size-11 place-items-center rounded-full border border-white/20 text-lg transition hover:border-cyan-200 hover:bg-cyan-200 hover:text-black">→</button>
              </div>
            </div>
          </div>
          <span className="absolute bottom-28 right-10 hidden text-[9px] uppercase tracking-[.3em] text-white/35 [writing-mode:vertical-rl] lg:block">{slide.tag}</span>
        </div>
      </section>

      <section id="categories" className="relative z-10 mx-auto max-w-[1500px] px-5 py-16 sm:px-10 lg:px-16">
        <div className="mb-8 flex items-end justify-between gap-5"><div><p className="text-[10px] uppercase tracking-[.3em] text-cyan-200">Explore by interest</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Find your frequency.</h2></div><span className="hidden text-xs text-white/35 sm:block">A considered collection of everyday objects.</span></div>
        <div className="grid gap-4 md:grid-cols-3">
          {categories.slice(0,2).map((category) => <a key={category.number} href="#collection" className="group relative isolate flex min-h-[310px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121d22] p-6 transition duration-500 hover:-translate-y-1 hover:border-cyan-100/40"><Image src={category.image} alt="" fill className="object-cover opacity-35 transition duration-700 group-hover:scale-105 group-hover:opacity-55" sizes="(max-width: 768px) 100vw, 50vw" unoptimized /><div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080d10] via-[#080d10]/25 to-transparent" /><span className="text-[10px] tracking-[.25em] text-cyan-100/70">{category.number} / CATEGORY</span><div><h3 className="text-3xl font-semibold">{category.name}</h3><p className="mt-2 text-xs text-white/55">{category.note}</p><span className="mt-6 inline-flex size-10 items-center justify-center rounded-full border border-white/30 transition group-hover:rotate-45 group-hover:border-cyan-200 group-hover:bg-cyan-100 group-hover:text-black">↗</span></div></a>)}
          <a href="#collection" className="group relative flex min-h-[310px] flex-col justify-between overflow-hidden rounded-2xl border border-cyan-100/20 bg-gradient-to-br from-[#14343b] to-[#10171c] p-6 transition duration-500 hover:-translate-y-1 hover:border-cyan-100/50"><span className="text-[10px] tracking-[.25em] text-cyan-100/70">03 / CATEGORY</span><div><div className="mb-5 text-5xl text-cyan-100/80">✳</div><h3 className="text-3xl font-semibold">The edit</h3><p className="mt-2 text-xs text-white/55">The pieces worth a closer look.</p><span className="mt-6 inline-flex size-10 items-center justify-center rounded-full border border-white/30 transition group-hover:rotate-45 group-hover:border-cyan-200 group-hover:bg-cyan-100 group-hover:text-black">↗</span></div></a>
        </div>
      </section>

      <section id="collection" className="relative z-10 border-y border-white/10 bg-[#0c1317]/90 px-5 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-[10px] uppercase tracking-[.3em] text-cyan-200">The selection / store catalogue</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Objects of interest.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-white/45">{catalogProducts.length ? "Explore products published in the Sky View Store catalogue. Open any item to see its details and availability." : "These are visual sample listings only. Real products will appear here after they are added and published in the store admin."}</p></div><span className="text-[10px] uppercase tracking-[.2em] text-white/40">{String(featuredProducts.length).padStart(2, "0")} / {catalogProducts.length ? "LIVE CATALOGUE" : "SAMPLE PREVIEW"}</span></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => <article key={product.name} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111a1f] transition duration-500 hover:-translate-y-2 hover:border-cyan-100/40 hover:shadow-[0_22px_55px_rgba(0,0,0,.3)]"><div className="relative aspect-[4/4.3] overflow-hidden bg-[#172329]"><Image src={product.image} alt={product.name} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" unoptimized /><span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[9px] font-bold tracking-wider backdrop-blur">{product.badge}{product.sample ? " SAMPLE" : ""}</span><span className="absolute bottom-4 right-4 text-[9px] tracking-[.2em] text-white/70">0{index+1}</span></div><div className="p-5"><p className="text-[9px] font-semibold tracking-[.2em] text-cyan-100/60">{product.type}</p><h3 className="mt-3 min-h-12 text-base font-medium leading-6">{product.name}</h3><div className="mt-4 flex items-center gap-3"><span className="text-sm font-bold">{product.price}</span><span className="text-xs text-white/35 line-through">{product.old}</span></div><div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] uppercase tracking-[.18em]">{product.href ? <a href={product.href} target={product.external ? "_blank" : undefined} rel={product.external ? "noopener noreferrer" : undefined} className="font-bold text-cyan-100 transition hover:tracking-[.24em]">{product.external ? "Visit seller ↗" : "View product ↗"}</a> : <span className="text-white/35">Sample preview · not for sale</span>}<span className="text-white/35">{product.sample ? "PREVIEW" : product.external ? "EXTERNAL" : "DETAILS"}</span></div></div></article>)}
          </div>
        </div>
      </section>

      <section id="story" className="relative z-10 mx-auto grid max-w-[1500px] gap-10 px-5 py-24 sm:px-10 lg:grid-cols-[1fr_.8fr] lg:px-16">
        <div><p className="text-[10px] uppercase tracking-[.3em] text-cyan-200">The Sky View point of view</p><h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-.04em] sm:text-6xl">Less noise.<br /><span className="text-white/40">More of what matters.</span></h2></div>
        <div className="flex flex-col justify-end"><p className="max-w-xl text-sm leading-7 text-white/55">Sky View Store is being shaped around thoughtful design, useful products and a smooth shopping experience. The catalogue, product details and checkout will be connected to the store database as we finish the real inventory setup.</p><a href="#collection" className="mt-7 inline-flex w-fit items-center gap-5 border-b border-cyan-100/50 pb-3 text-[10px] font-bold uppercase tracking-[.2em] transition hover:gap-8 hover:text-cyan-100">Explore the collection <span>↗</span></a></div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-5 py-8 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-4 text-[9px] uppercase tracking-[.2em] text-white/35 sm:flex-row"><span>© 2026 Sky View Store</span><span>Thoughtfully selected. Made for everyday.</span><a href="#" className="transition hover:text-cyan-100">Back to top ↑</a></div></footer>
      <style jsx global>{`@keyframes heroReveal { from { opacity: 0; transform: translateX(34px) scale(1.035); filter: blur(8px); } to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); } } html { scroll-behavior: smooth; } @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important; } }`}</style>
    </main>
  );
}
