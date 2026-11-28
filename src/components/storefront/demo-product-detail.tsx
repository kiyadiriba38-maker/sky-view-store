"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useStoreLocale } from "@/lib/providers/intl";

import DemoAddToCart from "@/components/storefront/demo-add-to-cart";
import type { DemoProduct } from "@/lib/demo/catalog";

export default function DemoProductDetail({ product }: { product: DemoProduct }) {
  const t = useTranslations("marketplace");
  const { locale } = useStoreLocale();
  const formatETB = (amount: number) => new Intl.NumberFormat(locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : "en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(amount);
  const category = product.category.toLowerCase();
  const accent = /fashion|shoe|cloth|beauty|watch|bag/.test(category) ? "#ff9b63" : /tech|electronic|computer|phone/.test(category) ? "#71dff1" : /home|furniture|decor/.test(category) ? "#d5b6ff" : "#8be3c5";
  return <main className="sv-product-experience" style={{ "--sv-product-backdrop": `url("${product.image}")`, "--sv-product-accent": accent } as React.CSSProperties}>
    <div className="sv-product-topbar"><Link href="/shop" className="sv-product-wordmark"><span>SV</span> SKY VIEW <i> / </i> STORE</Link><nav><Link href="/shop">DISCOVER</Link><Link href="/categories">CATEGORIES</Link><Link href="/deals">OFFERS</Link></nav><Link href="/demo-cart" className="sv-product-toplink">YOUR CART ↗</Link></div>
    <div className="sv-product-crumb"><Link href="/">HOME</Link><span> / </span><Link href="/shop">MARKETPLACE</Link><span> / </span><b>{product.category}</b></div>
    <section className="sv-product-hero">
      <div className="sv-product-gallery-panel"><div className="sv-product-index">01 <span> / PRODUCT VIEW</span></div><div className="sv-product-gallery"><div className="sv-product-main-image"><Image src={product.image} alt={product.title} fill unoptimized priority sizes="(max-width: 900px) 100vw, 58vw" className="object-contain" /></div><span className="sv-product-demo-stamp">{t("demoTitle")}</span></div><div className="sv-product-gallery-caption"><span>CURATED PRODUCT VIEW</span><span>SCROLL TO EXPLORE ↓</span></div></div>
      <aside className="sv-product-info-panel"><div className="sv-product-overline"><span></span>{product.category} <i>·</i> SKY VIEW SELECTION</div><h1 className="sv-demo-product-title">{product.title}</h1><div className="sv-demo-product-price"><b>{formatETB(product.priceETB)}</b><del>{formatETB(product.originalPriceETB)}</del></div><p className="sv-demo-product-description">{product.description}</p><div className="sv-demo-product-note">{t("demoListingNote")}. {t("demoOnly")}. No real stock or fulfilment is available.</div><label className="sv-demo-option-label">{t("sampleOption")}<select className="sv-demo-option-select">{product.variants.map((variant) => <option key={variant}>{variant}</option>)}</select></label><div className="sv-demo-product-actions"><DemoAddToCart product={{ slug: product.slug, title: product.title, priceETB: product.priceETB, image: product.image }} /><Link href="/demo-cart">VIEW CART ↗</Link></div><div className="sv-demo-specs"><h3>{t("sampleSpecifications")}</h3>{product.specifications.map((item) => <div key={item.label}><span>{item.label}</span><b>{item.value}</b></div>)}</div><div className="sv-product-trust-row"><span>◇ SECURE ACCOUNT</span><span>✧ SIMULATED CHECKOUT</span><span>↗ ETHIOPIA</span></div></aside>
    </section>
    <section className="sv-product-reviews"><div className="sv-demo-review-heading"><div><span className="sv-product-lower-kicker">COMMUNITY NOTES</span><h2>{t("demoReviews")}</h2></div><span>{t("sampleContent")}</span></div><p className="sv-demo-review-note">{t("sampleReviewsNote")}</p><div className="sv-demo-review-grid"><article><span>★★★★★</span><h3>Clear product presentation</h3><p>This sample review demonstrates how customer feedback will appear on a product page.</p><small>DEMO REVIEW · SAMPLE SHOPPER</small></article><article><span>★★★★☆</span><h3>Easy to explore options</h3><p>A second sample review shows the layout for product comments and feedback.</p><small>DEMO REVIEW · SAMPLE SHOPPER</small></article></div><Link href="/shop" className="sv-product-back-link">← {t("backToMarketplace")}</Link></section>
  </main>;
}
