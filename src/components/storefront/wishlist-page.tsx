"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FiHeart, FiTrash2 } from "react-icons/fi";
import StorefrontImage from "@/components/storefront/storefront-image";

type SavedProduct = {
  id: string;
  slug: string;
  title: string;
  image: string;
  priceETB: number;
  category: string;
  demo: boolean;
  href: string;
};

export default function WishlistPage() {
  const [items, setItems] = useState<SavedProduct[]>([]);
  const load = useCallback(() => {
    try {
      const saved: unknown = JSON.parse(window.localStorage.getItem("sv-wishlist") || "[]");
      setItems(Array.isArray(saved) ? saved.filter((item): item is SavedProduct =>
        item && typeof item.id === "string" && typeof item.title === "string" &&
        typeof item.image === "string" && typeof item.href === "string"
      ) : []);
    } catch { setItems([]); }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener("storage", load);
    window.addEventListener("sv-wishlist-change", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("sv-wishlist-change", load);
    };
  }, [load]);

  function remove(id: string) {
    const next = items.filter((item) => item.id !== id);
    window.localStorage.setItem("sv-wishlist", JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event("sv-wishlist-change"));
  }

  function clearAll() {
    window.localStorage.removeItem("sv-wishlist");
    setItems([]);
    window.dispatchEvent(new Event("sv-wishlist-change"));
  }

  return (
    <main className="sv-page min-h-[75vh] bg-[#121212] px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-xs text-amber-200 hover:text-white">← Continue shopping</Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.25em] text-amber-200">Sky View / Saved collection</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Your wishlist.</h1>
            <p className="mt-3 text-sm text-white/50">{items.length} saved {items.length === 1 ? "item" : "items"} on this device.</p>
          </div>
          {items.length ? <button type="button" onClick={clearAll} className="rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/65 transition hover:border-rose-300/40 hover:text-rose-100">Clear wishlist</button> : null}
        </div>
        {items.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#191919]">
                <Link href={item.href} className="relative block aspect-square overflow-hidden bg-white/[.03]">
                  <StorefrontImage src={item.image} alt={item.title} fallbackSrc="https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80" sizes="(max-width: 640px) 90vw, 25vw" className="object-cover transition duration-500 hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white">{item.demo ? "Demo item" : "Marketplace item"}</span>
                </Link>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">{item.category}</p>
                  <Link href={item.href} className="mt-2 block min-h-10 text-sm font-semibold text-white hover:text-amber-200">{item.title}</Link>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <strong className="text-sm text-amber-100">ETB {Number(item.priceETB || 0).toLocaleString("en-ET")}</strong>
                    <button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.title} from wishlist`} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-rose-300/40 hover:text-rose-200"><FiTrash2 /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[.02] px-6 py-16 text-center">
            <FiHeart className="mx-auto h-8 w-8 text-amber-200/70" />
            <h2 className="mt-5 text-xl font-semibold">Your wishlist is waiting.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">Save products with the heart button while browsing. They will appear here on this device.</p>
            <Link href="/shop" className="mt-6 inline-flex rounded-full bg-amber-300 px-5 py-3 text-xs font-bold text-[#15100a] transition hover:bg-white">Explore products ↗</Link>
          </div>
        )}
        <p className="mt-8 text-[10px] leading-5 text-white/30">Wishlist items are stored locally in this browser. They are not synced between devices or accounts yet. Demo items are examples, not real offers for sale.</p>
      </div>
    </main>
  );
}
