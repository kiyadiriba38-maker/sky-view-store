import type { Metadata } from "next";

import { StorefrontShell } from "@/components/storefront/storefront-pages";

export const metadata: Metadata = { title: "About | Sky View Store", description: "Learn about the Sky View Store shopping experience." };

export default function AboutPage() {
  return <StorefrontShell eyebrow="Our direction / 04" title="A new perspective on online shopping." description="Sky View Store is being built as a modern product-discovery and ecommerce experience, with clear product information and a simple path from discovery to checkout.">
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ["Discover", "Explore products and categories through a clean, searchable catalogue."],
        ["Shop with clarity", "Store-owned products and independent marketplace listings are labelled separately."],
        ["Keep improving", "Customer accounts, order tools and more store services are being developed in stages."],
      ].map(([title, body], index) => <article key={title} className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-7"><span className="text-[9px] font-bold tracking-[.2em] text-amber-300">0{index + 1} / PRINCIPLE</span><h2 className="mt-6 text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-white/50">{body}</p></article>)}
    </div>
    <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/[.05] p-7"><h2 className="text-lg font-semibold">Built for transparent shopping</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">A preview concept is not a product for sale. An external listing is not fulfilled by Sky View Store. We aim to keep these differences visible so shoppers know who is offering each item.</p></div>
  </StorefrontShell>;
}
