"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useStoreLocale } from "@/lib/providers/intl";

import DemoAddToCart from "@/components/storefront/demo-add-to-cart";
import { StorefrontShell } from "@/components/storefront/storefront-pages";
import type { DemoProduct } from "@/lib/demo/catalog";

export default function DemoProductDetail({ product }: { product: DemoProduct }) {
  const t = useTranslations("marketplace");
  const { locale } = useStoreLocale();
  const formatETB = (amount: number) => new Intl.NumberFormat(locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : "en-ET", { style: "currency", currency: "ETB", maximumFractionDigits: 0 }).format(amount);
  return <StorefrontShell eyebrow={`DEMO LISTING / ${product.category}`} title={product.title} description={t("demoDescription")}>
    <div className="grid gap-8 lg:grid-cols-[1fr_.9fr]">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-[#101a28]">
        <Image src={product.image} alt={product.title} fill unoptimized priority className="object-cover" />
        <span className="absolute left-4 top-4 rounded-full bg-amber-300 px-4 py-2 text-xs font-black tracking-widest text-slate-950">{t("demoTitle")}</span>
      </div>
      <div className="rounded-3xl border border-white/10 bg-[#101a28] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">{product.category}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">{product.title}</h2>
        <div className="mt-6 flex items-center gap-3"><span className="text-3xl font-black">{formatETB(product.priceETB)}</span><del className="text-sm text-white/40">{formatETB(product.originalPriceETB)}</del></div>
        <p className="mt-5 text-sm leading-7 text-white/65">{product.description}</p>
        <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/5 p-4 text-xs leading-6 text-amber-100">{t("demoListingNote")}. {t("demoOnly")}. No real stock or fulfilment is available.</div>
        <div className="mt-6 grid gap-3"><label className="text-xs font-semibold text-white/70">{t("sampleOption")}<select className="mt-2 w-full rounded-xl border border-white/15 bg-[#0a1421] p-3 text-sm text-white">{product.variants.map((variant) => <option key={variant}>{variant}</option>)}</select></label><div className="flex flex-wrap gap-3"><DemoAddToCart product={{slug:product.slug,title:product.title,priceETB:product.priceETB,image:product.image}}/><Link href="/demo-cart" className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold">{t("viewCart")}</Link></div></div>
        <div className="mt-8 border-t border-white/10 pt-6"><h3 className="font-bold">{t("sampleSpecifications")}</h3><dl className="mt-3 grid gap-3">{product.specifications.map((item)=><div key={item.label} className="flex justify-between gap-4 text-xs"><dt className="text-white/45">{item.label}</dt><dd className="text-right font-semibold">{item.value}</dd></div>)}</dl></div>
      </div>
    </div>
    <section className="mt-12 rounded-3xl border border-white/10 bg-[#101a28] p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-semibold">{t("demoReviews")}</h2><span className="rounded-full border border-amber-300/30 px-3 py-1 text-[10px] font-black tracking-widest text-amber-200">{t("sampleContent")}</span></div><p className="mt-2 text-xs text-white/45">{t("sampleReviewsNote")}</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border border-white/10 p-5"><span className="text-amber-200">★★★★★</span><h3 className="mt-2 font-semibold">Clear product presentation</h3><p className="mt-2 text-sm leading-6 text-white/55">This sample review demonstrates how customer feedback will appear on a product page.</p><small className="mt-3 block text-[10px] font-bold tracking-widest text-amber-200">DEMO REVIEW · SAMPLE SHOPPER</small></article><article className="rounded-2xl border border-white/10 p-5"><span className="text-amber-200">★★★★☆</span><h3 className="mt-2 font-semibold">Easy to explore options</h3><p className="mt-2 text-sm leading-6 text-white/55">A second sample review shows the layout for product comments and feedback.</p><small className="mt-3 block text-[10px] font-bold tracking-widest text-amber-200">DEMO REVIEW · SAMPLE SHOPPER</small></article></div></section>
    <div className="mt-8"><Link href="/shop" className="text-sm font-bold text-cyan-200">← {t("backToMarketplace")}</Link></div>
  </StorefrontShell>;
}
