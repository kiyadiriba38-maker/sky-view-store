"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "@/lib/demo/catalog";
import type { Product } from "@/lib/core/types/payload-types";
import { resolveMediaUrl } from "@/lib/core/util";
import { useStoreLocale } from "@/lib/providers/intl";
import StorefrontImage from "@/components/storefront/storefront-image";

type Props = { realProducts: Product[] };

export default function DemoShopBrowser({ realProducts }: Props) {
  const { locale } = useStoreLocale();
  const t = useTranslations("marketplace");
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("all");
  const [kind,setKind]=useState("all");
  const [sort,setSort]=useState("featured");
  const [page,setPage]=useState(1);
  useEffect(()=>{const params=new URLSearchParams(window.location.search);const selected=params.get("category");if(selected)setCategory(selected)},[]);
  const real=useMemo(()=>realProducts.map(product=>{
    const extended=product as Product & {isDemo?:boolean;demoImageUrl?:string|null;productImageUrl?:string|null};
    const demo=Boolean(extended.isDemo);
    const categories=Array.isArray(product.categories)?product.categories as Array<{title?:string;slug?:string}>:[];
    const firstCategory=categories.find((category)=>typeof category==="object"&&category!==null);
    const category=firstCategory?.title??"Marketplace";
    const categorySlug=firstCategory?.slug??"real-products";
    const imageUrl=demo?extended.demoImageUrl:extended.productImageUrl;
    const image=demo?(DEMO_CATEGORIES.find((item)=>item.slug===categorySlug)?.image??DEMO_CATEGORIES[2].image):(imageUrl||(product.meta?.image&&typeof product.meta.image==="object"?resolveMediaUrl(product.meta.image):DEMO_CATEGORIES[2].image));
    return {id:`database-${product.id}`,slug:product.slug,title:product.title,category,categorySlug,priceETB:Number(product.priceInUSD??0),image,demo,databaseBacked:true as const};
  }),[realProducts]);
  const demoFallback=real.some(item=>item.demo)?[]:DEMO_PRODUCTS;
  const categoryOptions=useMemo(()=>{
    const options=new Map<string,string>();
    for(const item of real){if(item.categorySlug&&item.category!=="Marketplace")options.set(item.categorySlug,item.category)}
    return options.size?[...options].map(([slug,name])=>({slug,name})):DEMO_CATEGORIES.map(({slug,name})=>({slug,name}));
  },[real]);
  const filtered=useMemo(()=>[...real,...demoFallback].filter(item=>{
    const matchText=`${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const matchCategory=category==="all"||item.categorySlug===category||item.category===category;
    const matchKind=kind==="all"||(kind==="demo"?item.demo:!item.demo);
    return matchText&&matchCategory&&matchKind;
  }),[real,demoFallback,query,category,kind]);
  const sorted=useMemo(()=>[...filtered].sort((a,b)=>sort==="price-low"?a.priceETB-b.priceETB:sort==="price-high"?b.priceETB-a.priceETB:sort==="name"?a.title.localeCompare(b.title):0),[filtered,sort]);
  const shown=sorted.slice(0,page*24);
  return <div>
    <div className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-[#191919] p-4 md:grid-cols-[1fr_220px_180px]">
      <input aria-label={t("searchPlaceholder")} value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder={t("searchPlaceholder")} className="w-full rounded-xl border border-white/15 bg-[#191919] px-4 py-3 text-sm text-white outline-none focus:border-amber-300"/>
      <select aria-label={t("allCategories")} value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}} className="rounded-xl border border-white/15 bg-[#191919] px-4 py-3 text-sm text-white"><option value="all">{t("allCategories")}</option>{categoryOptions.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}<option value="real-products">Real products</option></select>
      <select aria-label={t("featured")} value={sort} onChange={e=>{setSort(e.target.value);setPage(1)}} className="rounded-xl border border-white/15 bg-[#191919] px-4 py-3 text-sm text-white"><option value="featured">{t("featured")}</option><option value="price-low">{t("priceLowToHigh")}</option><option value="price-high">{t("priceHighToLow")}</option><option value="name">{t("nameAZ")}</option></select>
      <div className="flex flex-wrap gap-2 md:col-span-2">{[["all",t("allProducts")],["demo",t("demoProducts")],["real",t("realProducts")]].map(([value,label])=><button key={value} onClick={()=>{setKind(value);setPage(1)}} className={`rounded-full border px-4 py-2 text-xs font-bold ${kind===value?"border-amber-300 bg-amber-300 text-[#17120b]":"border-white/15 text-white/65"}`}>{label}</button>)}</div>
    </div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/55"><span aria-live="polite">{t("showing")} <strong className="text-white">{shown.length.toLocaleString()}</strong>of<strong className="text-white">{filtered.length.toLocaleString()}</strong> {t("productsFound")}</span>{(query||category!=="all"||kind!=="all"||sort!=="featured")?<button type="button" onClick={()=>{setQuery("");setCategory("all");setKind("all");setSort("featured");setPage(1)}} className="rounded-full border border-amber-200/25 px-3 py-2 font-semibold text-amber-100 transition hover:border-amber-200/60 hover:bg-amber-200/10">Clear filters</button>:null}</div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {shown.map(item=>{
        const href=item.demo&&!((item as (typeof real)[number]).databaseBacked)?`/demo-product/${item.slug}`: `/product/${item.slug}`;
        const price=item.priceETB;
        return <article key={item.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#191919] transition hover:-translate-y-1 hover:border-amber-300/50">
          <Link href={href} className="block"><div className="relative aspect-square bg-[#202020]"><StorefrontImage src={item.image} fallbackSrc={DEMO_CATEGORIES[2].image} alt={item.title} sizes="(max-width: 640px) 50vw, 20vw" className="object-cover transition duration-500 group-hover:scale-105"/><span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[8px] font-black tracking-wider ${item.demo?"bg-amber-300 text-[#17120b]":"bg-emerald-300 text-[#17120b]"}`}>{item.demo?t("demoBadge"):t("realBadge")}</span></div><div className="p-3"><p className="text-[9px] uppercase tracking-wider text-white/45">{item.category}</p><h2 className="mt-1 line-clamp-2 min-h-9 text-xs font-semibold leading-5">{item.title}</h2><p className="mt-3 text-sm font-extrabold">{new Intl.NumberFormat(locale==="am"?"am-ET":locale==="om"?"om-ET":"en-ET",{style:"currency",currency:"ETB",maximumFractionDigits:0}).format(price)}</p><p className="mt-1 text-[9px] text-white/40">{item.demo?t("demoListingNote"):t("publishedListingNote")}</p></div></Link>
        </article>
      })}
    </div>
    {shown.length===0?<div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-sm text-white/50">{t("noResults")}</div>:null}
    {shown.length<filtered.length?<div className="mt-8 text-center"><button onClick={()=>setPage(value=>value+1)} className="rounded-full border border-amber-300/50 px-7 py-3 text-sm font-bold text-amber-100 hover:bg-amber-300 hover:text-[#17120b]">{t("loadMore")}</button></div>:null}
  </div>;
}
