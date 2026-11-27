"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "@/lib/demo/catalog";
import type { Product } from "@/lib/core/types/payload-types";
import { resolveMediaUrl } from "@/lib/core/util";

type Props = { realProducts: Product[] };

export default function DemoShopBrowser({ realProducts }: Props) {
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("all");
  const [kind,setKind]=useState("all");
  const [page,setPage]=useState(1);
  useEffect(()=>{const params=new URLSearchParams(window.location.search);const selected=params.get("category");if(selected)setCategory(selected)},[]);
  const real=useMemo(()=>realProducts.map(product=>{
    const demo=Boolean(product.isDemo);
    const categories=Array.isArray(product.categories)?product.categories:[];
    const firstCategory=categories.find((category)=>typeof category==="object"&&category!==null);
    const category=firstCategory&&typeof firstCategory==="object"?"title" in firstCategory&&typeof firstCategory.title==="string"?firstCategory.title:"Marketplace":"Marketplace";
    const categorySlug=firstCategory&&typeof firstCategory==="object"&&"slug" in firstCategory&&typeof firstCategory.slug==="string"?firstCategory.slug:"real-products";
    const imageUrl=demo?product.demoImageUrl:product.productImageUrl;
    const image=imageUrl||(product.meta?.image&&typeof product.meta.image==="object"?resolveMediaUrl(product.meta.image):DEMO_CATEGORIES[2].image);
    return {id:`database-${product.id}`,slug:product.slug,title:product.title,category,categorySlug,price:Number(product.priceInUSD??0),image,demo,databaseBacked:true as const};
  }),[realProducts]);
  const demoFallback=real.some(item=>item.demo)?[]:DEMO_PRODUCTS;
  const filtered=useMemo(()=>[...real,...demoFallback].filter(item=>{
    const matchText=`${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const matchCategory=category==="all"||item.categorySlug===category||item.category===category;
    const matchKind=kind==="all"||(kind==="demo"?item.demo:!item.demo);
    return matchText&&matchCategory&&matchKind;
  }),[real,demoFallback,query,category,kind]);
  const shown=filtered.slice(0,page*24);
  return <div>
    <div className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-[#101a28] p-4 md:grid-cols-[1fr_220px]">
      <input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="Search 1,000+ sample listings and real products" className="w-full rounded-xl border border-white/15 bg-[#091321] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"/>
      <select value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}} className="rounded-xl border border-white/15 bg-[#091321] px-4 py-3 text-sm text-white"><option value="all">All categories</option>{DEMO_CATEGORIES.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}<option value="real-products">Real products</option></select>
      <div className="flex flex-wrap gap-2 md:col-span-2">{[["all","All products"],["demo","Demo products"],["real","Real products"]].map(([value,label])=><button key={value} onClick={()=>{setKind(value);setPage(1)}} className={`rounded-full border px-4 py-2 text-xs font-bold ${kind===value?"border-cyan-300 bg-cyan-300 text-slate-950":"border-white/15 text-white/65"}`}>{label}</button>)}</div>
    </div>
    <div className="mb-4 flex items-center justify-between text-xs text-white/45"><span>{filtered.length.toLocaleString()} products found</span><span>Showing {shown.length.toLocaleString()}</span></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {shown.map(item=>{
        const href=item.demo&&!((item as (typeof real)[number]).databaseBacked)?`/demo-product/${item.slug}`: `/product/${item.slug}`;
        const price=item.demo?item.priceETB:(item as (typeof real)[number]).price;
        return <article key={item.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101a28] transition hover:-translate-y-1 hover:border-cyan-200/50">
          <Link href={href} className="block"><div className="relative aspect-square bg-[#172436]"><Image src={item.image} alt={item.title} fill unoptimized sizes="(max-width: 640px) 50vw, 20vw" className="object-cover transition duration-500 group-hover:scale-105"/><span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[8px] font-black tracking-wider ${item.demo?"bg-amber-300 text-slate-950":"bg-emerald-300 text-slate-950"}`}>{item.demo?"DEMO":"REAL PRODUCT"}</span></div><div className="p-3"><p className="text-[9px] uppercase tracking-wider text-white/45">{item.category}</p><h2 className="mt-1 line-clamp-2 min-h-9 text-xs font-semibold leading-5">{item.title}</h2><p className="mt-3 text-sm font-extrabold">{new Intl.NumberFormat("en-ET",{style:"currency",currency:"ETB",maximumFractionDigits:0}).format(price)}</p><p className="mt-1 text-[9px] text-white/40">{item.demo?"Simulated listing · no real stock":"Published marketplace listing"}</p></div></Link>
        </article>
      })}
    </div>
    {shown.length===0?<div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-sm text-white/50">No listings match those filters.</div>:null}
    {shown.length<filtered.length?<div className="mt-8 text-center"><button onClick={()=>setPage(value=>value+1)} className="rounded-full border border-cyan-200/50 px-7 py-3 text-sm font-bold text-cyan-100 hover:bg-cyan-200 hover:text-slate-950">Load more products</button></div>:null}
  </div>;
}
