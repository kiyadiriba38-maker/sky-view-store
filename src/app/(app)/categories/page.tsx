import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { DEMO_CATEGORIES } from "@/lib/demo/catalog";
import { StorefrontShell } from "@/components/storefront/storefront-pages";
import DAL from "@/lib/core/dal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Categories | Sky View Store", description: "Explore marketplace categories from technology and fashion to home, sports and more." };

export default async function CategoriesPage() {
  const categories = await DAL.queryArchiveCategories({ limit: 0 });
  return <StorefrontShell page="categories" eyebrow="Browse by interest / 03" title="Explore every category." description="Discover products across technology, fashion, home, beauty, sports, automotive, hobbies and more. Demo catalogue categories are available immediately; real product availability depends on published listings.">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {DEMO_CATEGORIES.map((category,index)=><Link key={category.slug} href={`/shop?category=${category.slug}`} className="group relative min-h-48 overflow-hidden rounded-2xl border border-white/10 bg-[#101a28]">
        <Image src={category.image} alt="" fill unoptimized sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105"/>
        <span className="absolute inset-0 bg-gradient-to-t from-[#07111df2] via-[#07111d22] to-transparent"/>
        <span className="absolute bottom-4 left-4 right-4"><small className="text-[9px] font-black tracking-widest text-cyan-200">{String(index+1).padStart(2,"0")} / CATEGORY</small><b className="mt-1 block text-sm">{category.name}</b><span className="mt-1 block text-[10px] text-white/60">Explore sample listings →</span></span>
      </Link>)}
    </div>
    {categories.length?<section className="mt-12"><h2 className="mb-4 text-xl font-bold">Real store categories</h2><div className="flex flex-wrap gap-2">{categories.map(category=><Link key={category.id} href={`/category/${category.slug}`} className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:border-cyan-200">{category.title}</Link>)}</div></section>:null}
  </StorefrontShell>;
}
