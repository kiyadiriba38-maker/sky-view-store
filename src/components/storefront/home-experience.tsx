"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useStoreLocale } from "@/lib/providers/intl";
import { useTheme } from "@/lib/providers/theme";

import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "@/lib/demo/catalog";

type CatalogProduct = {
  title: string;
  slug: string;
  image: string | null;
  price: number;
  originalPrice: number | null;
  listingType?: "own_store" | "marketplace_seller" | null;
  isDemo?: boolean;
  demoImageUrl?: string | null;
  productImageUrl?: string | null;
  category?: string;
  categorySlug?: string;
};

type Currency = "ETB" | "USD" | "EUR" | "GBP" | "AED";
type Language = "en" | "am" | "om";

const copy = {
  en: { search: "Search products, brands and categories", hero: "A whole marketplace. A new way to shop.", sub: "Discover everyday essentials, technology, fashion and more — all in one place.", shop: "Explore marketplace", categories: "Shop by category", popular: "Popular discoveries", demo: "DEMO", real: "REAL PRODUCT", all: "All products", demoOnly: "Demo products", realOnly: "Real products", searchButton: "Search", browse: "Browse all products" },
  am: { search: "ምርቶችን፣ ብራንዶችን እና ምድቦችን ይፈልጉ", hero: "ሙሉ የገበያ መድረክ። አዲስ የግዢ ልምድ።", sub: "የዕለት ተዕለት እቃዎችን፣ ቴክኖሎጂን፣ ፋሽንን እና ሌሎችንም ያግኙ።", shop: "ገበያውን ይመልከቱ", categories: "በምድብ ይግዙ", popular: "ተወዳጅ ምርቶች", demo: "የሙከራ", real: "እውነተኛ ምርት", all: "ሁሉም", demoOnly: "የሙከራ ምርቶች", realOnly: "እውነተኛ ምርቶች", searchButton: "ፈልግ", browse: "ሁሉንም ምርቶች ይመልከቱ" },
  om: { search: "Oomisha, maqaa daldalaa fi ramaddii barbaadi", hero: "Gabaa guutuu. Muuxannoo bittaa haaraa.", sub: "Meeshaalee guyyaa guyyaa, teeknooloojii, faashinii fi kanneen biroo bakka tokkotti argadhu.", shop: "Gabaa ilaali", categories: "Ramaddii irratti bitadhu", popular: "Oomisha beekamoo", demo: "YAALI", real: "OOMISHA DHUGAA", all: "Hunda", demoOnly: "Oomisha yaalii", realOnly: "Oomisha dhugaa", searchButton: "Barbaadi", browse: "Oomisha hunda ilaali" },
};

const formatPrice = (amount: number, currency: Currency, rates: Record<string, number>, locale: Language) => {
  const converted = currency === "ETB" ? amount : rates[currency] ? amount * rates[currency] : amount;
  const localeTag = locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : currency === "ETB" ? "en-ET" : "en-US";
  return new Intl.NumberFormat(localeTag, {
    style: "currency", currency, maximumFractionDigits: currency === "ETB" ? 0 : 2,
  }).format(converted);
};

export default function HomeExperience({ catalogProducts = [] }: { catalogProducts?: CatalogProduct[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [kind, setKind] = useState<"all" | "demo" | "real">("all");
  const [currency, setCurrency] = useState<Currency>("ETB");
  const { locale, setLocale } = useStoreLocale();
  const { theme, setTheme } = useTheme();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [rateReady, setRateReady] = useState(false);
  const t = copy[locale];

  useEffect(() => {
    const savedCurrency = window.localStorage.getItem("sv-currency");
    if (savedCurrency && ["ETB", "USD", "EUR", "GBP", "AED"].includes(savedCurrency)) setCurrency(savedCurrency as Currency);
    const controller = new AbortController();
    fetch("https://open.er-api.com/v6/latest/ETB", { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { result?: string; rates?: Record<string, number> }) => {
        if (data.result === "success" && data.rates) setRates(data.rates);
      })
      .catch(() => undefined)
      .finally(() => setRateReady(true));
    return () => controller.abort();
  }, []);

  const realProducts = useMemo(() => catalogProducts.map((product) => {
    const demo = Boolean(product.isDemo);
    return {
      id: `database-${product.slug}`, slug: product.slug, title: product.title,
      category: product.category ?? "Marketplace", categorySlug: product.categorySlug ?? "marketplace",
      priceETB: product.price, originalPriceETB: product.originalPrice ?? product.price,
      image: (demo ? product.demoImageUrl : product.productImageUrl) || product.image || DEMO_CATEGORIES[2].image,
      demo,
      databaseBacked: true as const,
    };
  }), [catalogProducts]);

  const products = useMemo(() => {
    const demoFallback = realProducts.some((product) => product.demo) ? [] : DEMO_PRODUCTS;
    const combined = [...realProducts, ...demoFallback];
    return combined.filter((product) => {
      const matchesQuery = `${product.title} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = category === "All" || product.category === category;
      const matchesKind = kind === "all" || (kind === "demo" ? product.demo : !product.demo);
      return matchesQuery && matchesCategory && matchesKind;
    });
  }, [realProducts, query, category, kind]);

  const categories = useMemo(() => {
    const bySlug = new Map<string, string>();
    for (const product of realProducts) {
      if (product.categorySlug && product.category && product.category !== "Marketplace") {
        bySlug.set(product.categorySlug, product.category);
      }
    }
    if (!bySlug.size) return DEMO_CATEGORIES;
    return [...bySlug.entries()].map(([slug, name], index) => ({
      slug,
      name,
      description: `Explore ${name.toLowerCase()} listings.`,
      image: DEMO_CATEGORIES.find((item) => item.slug === slug)?.image ?? DEMO_CATEGORIES[index % DEMO_CATEGORIES.length].image,
    }));
  }, [realProducts]);

  const changeTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);

  };

  return (
    <main className={`sv-marketplace min-h-screen ${theme === "dark" ? "sv-dark" : "sv-light"}`}>
      <div className="sv-market-topline">ETHIOPIA FIRST <span>✦</span> DISCOVER MORE. SHOP SMARTER.</div>
      <header className="sv-market-header">
        <Link href="/" className="sv-brand" aria-label="Sky View Store home">
          <span className="sv-brand-mark">SV</span><span>SKY VIEW <b>STORE</b></span>
        </Link>
        <nav className="sv-main-nav" aria-label="Main navigation">
          <Link href="/shop">Shop</Link><Link href="/categories">Categories</Link><a href="#popular">Trending</a><Link href="/deals">Deals</Link><Link href="/help">Help</Link>
        </nav>
        <div className="sv-header-actions">
          <select aria-label="Language" value={locale} onChange={(event) => setLocale(event.target.value as Language)}>
            <option value="en">EN</option><option value="am">አማ</option><option value="om">OR</option>
          </select>
          <select aria-label="Currency" value={currency} onChange={(event) => { const value = event.target.value as Currency; setCurrency(value); window.localStorage.setItem("sv-currency", value); }}>
            <option value="ETB">ETB</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="AED">AED</option>
          </select>
          <button type="button" className="sv-theme-toggle" onClick={changeTheme} aria-label="Toggle theme">{theme === "dark" ? "☼" : "☾"}</button>
          <Link href="/account/login" className="sv-signin">Sign in</Link>
          <Link href="/demo-cart" className="sv-cart-link">Cart ↗</Link>
        </div>
      </header>

      <section className="sv-market-searchbar">
        <div className="sv-search-wrap"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} /><button type="button" onClick={() => document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" })}>{t.searchButton}</button></div>
        <div className="sv-quick-links"><span>Popular:</span><button onClick={() => setQuery("wireless")}>Wireless</button><button onClick={() => setQuery("phone")}>Phone accessories</button><button onClick={() => setQuery("home")}>Home</button><button onClick={() => setQuery("travel")}>Travel</button></div>
      </section>

      <section className="sv-market-hero">
        <div className="sv-hero-copy"><span className="sv-eyebrow"><i /> THE SKY VIEW MARKETPLACE</span><h1>{t.hero}</h1><p>{t.sub}</p><div className="sv-hero-buttons"><Link href="/shop" className="sv-primary-button">{t.shop} <span>↗</span></Link><Link href="/categories" className="sv-secondary-button">{t.categories}</Link></div><div className="sv-hero-meta"><span>ETB-first shopping</span><span>Approved sellers</span><span>Demo checkout</span></div></div>
        <div className="sv-hero-visual"><Image src={DEMO_CATEGORIES[2].image} alt="Technology and electronics collection" fill priority unoptimized sizes="(max-width: 800px) 100vw, 50vw" className="sv-hero-image" /><div className="sv-hero-orbit" /><div className="sv-hero-float"><small>SKY VIEW / 001</small><b>Discover your next favorite.</b><span>Explore the marketplace</span></div></div>
      </section>

      <section className="sv-benefit-strip"><div><b>01</b><span>Wide product discovery</span></div><div><b>02</b><span>Local-first shopping</span></div><div><b>03</b><span>Seller marketplace</span></div><div><b>04</b><span>Secure account access</span></div></section>

      <section className="sv-category-section">
        <div className="sv-section-heading"><div><span className="sv-eyebrow">EXPLORE THE COLLECTIONS</span><h2>{t.categories}</h2></div><Link href="/categories">View all categories ↗</Link></div>
        <div className="sv-category-grid">
          {categories.slice(0, 8).map((item) => <Link href={`/shop?category=${item.slug}`} className="sv-category-tile" key={item.slug}><Image src={item.image} alt="" fill unoptimized sizes="(max-width: 640px) 50vw, 25vw" /><span className="sv-category-shade" /><span className="sv-category-name">{item.name}</span><span className="sv-category-arrow">↗</span></Link>)}
        </div>
      </section>

      <section id="catalogue" className="sv-product-section">
        <div className="sv-section-heading"><div><span className="sv-eyebrow">A MARKETPLACE OF POSSIBILITIES</span><h2 id="popular">{t.popular}</h2><p>{products.length.toLocaleString()} listings · sample listings are labelled clearly</p></div><Link href="/shop">{t.browse} ↗</Link></div>
        <div className="sv-catalog-controls">
          <div className="sv-filter-pills"><button className={kind === "all" ? "active" : ""} onClick={() => setKind("all")}>{t.all}</button><button className={kind === "demo" ? "active" : ""} onClick={() => setKind("demo")}>{t.demoOnly}</button><button className={kind === "real" ? "active" : ""} onClick={() => setKind("real")}>{t.realOnly}</button></div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="All">All categories</option>{categories.map((item) => <option key={item.slug} value={item.name}>{item.name}</option>)}<option value="Real products">Real products</option></select>
        </div>
        <div className="sv-product-grid">
          {products.slice(0, 24).map((product) => {
            const href = product.demo && !("databaseBacked" in product && product.databaseBacked) ? `/demo-product/${product.slug}` : `/product/${product.slug}`;
            return <article className="sv-product-card" key={product.id}><Link href={href} className="sv-product-image"><Image src={product.image} alt={product.title} fill unoptimized sizes="(max-width: 640px) 50vw, 25vw" /><span className={product.demo ? "sv-label-demo" : "sv-label-real"}>{product.demo ? t.demo : t.real}</span></Link><div className="sv-product-info"><small>{product.category}</small><Link href={href} className="sv-product-title">{product.title}</Link><div className="sv-price-row"><b>{formatPrice(product.priceETB, currency, rates, locale)}</b><del>{formatPrice(product.originalPriceETB, currency, rates, locale)}</del></div><span className="sv-demo-note">{product.demo ? "Sample listing · simulated stock" : "Published marketplace listing"}</span></div></article>;
          })}
        </div>
        {products.length === 0 ? <div className="sv-empty">No products match your search. Try another term or category.</div> : null}
        <div className="sv-catalog-footer"><span>{rateReady && currency !== "ETB" && !rates[currency] ? "Exchange rate unavailable — showing ETB values." : currency !== "ETB" ? "Converted using a reference exchange-rate feed; indicative only." : "Prices shown in Ethiopian birr."}</span><Link href="/shop" className="sv-primary-button">{t.browse} ↗</Link></div>
      </section>

      <section className="sv-promo-band"><div><span className="sv-eyebrow">A BETTER WAY TO DISCOVER</span><h2>From everyday essentials to unexpected finds.</h2><p>Browse a growing catalogue built for Ethiopia, with a marketplace foundation ready to expand.</p></div><Link href="/shop" className="sv-primary-button">Start exploring ↗</Link></section>

      <footer className="sv-market-footer"><div className="sv-brand"><span className="sv-brand-mark">SV</span><span>SKY VIEW <b>STORE</b></span></div><p>Built for discovery. Starting in Ethiopia.</p><div><Link href="/about">About</Link><Link href="/shipping">Shipping</Link><Link href="/returns">Returns</Link><Link href="/privacy">Privacy</Link><Link href="/help">Help center</Link></div><small>© {new Date().getFullYear()} Sky View Store · Demo listings are not real offers for sale.</small></footer>
      <nav className="sv-mobile-nav" aria-label="Mobile navigation"><Link href="/">⌂<span>Home</span></Link><Link href="/shop">⌕<span>Shop</span></Link><Link href="/categories">▦<span>Categories</span></Link><Link href="/demo-cart">▣<span>Cart</span></Link><Link href="/account">◎<span>Account</span></Link></nav>
    </main>
  );
}
