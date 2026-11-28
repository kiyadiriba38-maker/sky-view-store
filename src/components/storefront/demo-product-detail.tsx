"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useStoreLocale } from "@/lib/providers/intl";

import DemoAddToCart from "@/components/storefront/demo-add-to-cart";
import StorefrontImage from "@/components/storefront/storefront-image";
import { DEMO_CATEGORIES, type DemoProduct } from "@/lib/demo/catalog";

export default function DemoProductDetail({ product }: { product: DemoProduct }) {
  const t = useTranslations("marketplace");
  const { locale } = useStoreLocale();
  const formatETB = (amount: number) => new Intl.NumberFormat(locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : "en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(amount);
  const defaultAccent = "#f59e0b";
  const [mood, setMood] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const variant = product.variants[selectedVariant] ?? product.variants[0] ?? "Standard";
  const variantPrice = product.priceETB + selectedVariant * Math.max(50, Math.round(product.priceETB * 0.08));
  const demoStock = Math.max(2, 18 - ((Number(product.id.replace(/\D/g, "")) + selectedVariant * 5) % 15));
  const moods = [
    { name: "Original", accent: defaultAccent, background: "#17130e", filter: "none" },
    { name: "Crimson", accent: "#ff6b63", background: "#351716", filter: "saturate(1.12)" },
    { name: "Arctic", accent: "#7bdcf4", background: "#102936", filter: "saturate(.9)" },
    { name: "Midnight", accent: "#c0a4ff", background: "#211b35", filter: "brightness(.82) saturate(.8)" },
  ];
  const selectedMood = moods[mood];
  return <main className="sv-product-experience" style={{ "--sv-product-backdrop": `url("${product.image}")`, "--sv-product-accent": selectedMood.accent, "--sv-product-mood": selectedMood.background } as CSSProperties}>
    <div className="sv-product-topbar"><Link href="/shop" className="sv-product-wordmark"><span>SV</span> SKY VIEW <i> / </i> STORE</Link><nav><Link href="/shop">DISCOVER</Link><Link href="/categories">CATEGORIES</Link><Link href="/deals">OFFERS</Link></nav><Link href="/demo-cart" className="sv-product-toplink">YOUR CART ↗</Link></div>
    <div className="sv-product-crumb"><Link href="/">HOME</Link><span> / </span><Link href="/shop">MARKETPLACE</Link><span> / </span><b>{product.category}</b></div>
    <section className="sv-product-hero">
      <div className="sv-product-gallery-panel"><div className="sv-product-index">01 <span> / PRODUCT VIEW</span></div><div className="sv-product-gallery"><div className="sv-product-main-image" style={{ filter: selectedMood.filter }}><StorefrontImage src={product.image} fallbackSrc={DEMO_CATEGORIES.find((item) => item.slug === product.categorySlug)?.image ?? DEMO_CATEGORIES[2].image} alt={product.title} priority sizes="(max-width: 900px) 100vw, 58vw" className="object-contain" /></div><span className="sv-product-demo-stamp">{t("demoTitle")}</span></div><div className="sv-product-gallery-caption"><span>CURATED PRODUCT VIEW</span><span>SCROLL TO EXPLORE ↓</span></div></div>
      <aside className="sv-product-info-panel"><div className="sv-product-overline"><span></span>{product.category} <i>·</i> SKY VIEW SELECTION</div><h1 className="sv-demo-product-title">{product.title}</h1><div className="sv-demo-product-price"><b>{formatETB(variantPrice)}</b><del>{formatETB(product.originalPriceETB)}</del></div><div className="sv-product-mood-picker" aria-label="Choose product presentation theme"><span>SCENE / {selectedMood.name.toUpperCase()}</span><div>{moods.map((item, index) => <button key={item.name} type="button" aria-label={`${item.name} background theme`} aria-pressed={mood === index} onClick={() => setMood(index)} style={{ "--swatch": item.accent } as CSSProperties} />)}</div></div><p className="sv-demo-product-description">{product.description}</p><div className="sv-demo-product-note">{t("demoListingNote")}. {t("demoOnly")}. No real stock or fulfilment is available.</div><div className="sv-demo-option-label"><span>{t("sampleOption")} · {variant}</span><div className="sv-demo-variant-options" role="group" aria-label="Choose demo product variant">{product.variants.map((item, index) => <button key={item} type="button" aria-pressed={selectedVariant === index} onClick={() => setSelectedVariant(index)}>{item}</button>)}</div><small className="sv-demo-stock-note">{demoStock} sample units shown · demo inventory only</small></div><div className="sv-demo-product-actions"><DemoAddToCart product={{ slug: `${product.slug}::variant-${selectedVariant}`, title: `${product.title} · ${variant}`, priceETB: variantPrice, image: product.image }} /><Link href="/demo-cart">VIEW CART ↗</Link></div><div className="sv-demo-specs"><h3>{t("sampleSpecifications")}</h3>{product.specifications.map((item) => <div key={item.label}><span>{item.label}</span><b>{item.value}</b></div>)}</div><div className="sv-product-trust-row"><span>◇ SECURE ACCOUNT</span><span>✧ SIMULATED CHECKOUT</span><span>↗ ETHIOPIA</span></div></aside>
    </section>
    <section className="sv-product-reviews"><div className="sv-demo-review-heading"><div><span className="sv-product-lower-kicker">COMMUNITY NOTES</span><h2>{t("demoReviews")}</h2></div><span>{t("sampleContent")}</span></div><p className="sv-demo-review-note">{t("sampleReviewsNote")}</p><div className="sv-demo-review-grid"><article><span>★★★★★</span><h3>Clear product presentation</h3><p>This sample review demonstrates how customer feedback will appear on a product page.</p><small>DEMO REVIEW · SAMPLE SHOPPER</small></article><article><span>★★★★☆</span><h3>Easy to explore options</h3><p>A second sample review shows the layout for product comments and feedback.</p><small>DEMO REVIEW · SAMPLE SHOPPER</small></article></div><Link href="/shop" className="sv-product-back-link">← {t("backToMarketplace")}</Link></section>
  </main>;
}
