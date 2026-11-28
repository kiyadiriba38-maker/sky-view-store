"use client";

import Link from "next/link";
import StorefrontImage from "@/components/storefront/storefront-image";
import { DEMO_CATEGORIES } from "@/lib/demo/catalog";
import { useCallback, useEffect, useState } from "react";

type CartLine = {
  slug: string;
  title: string;
  priceETB: number;
  image: string;
  quantity: number;
};

const isCartLine = (value: unknown): value is CartLine => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartLine>;
  return typeof item.slug === "string" && item.slug.length > 0 &&
    typeof item.title === "string" && item.title.length > 0 &&
    typeof item.image === "string" &&
    (item.image.startsWith("/") && !item.image.startsWith("//") || /^https:\/\//i.test(item.image)) &&
    typeof item.priceETB === "number" && Number.isFinite(item.priceETB) &&
    item.priceETB >= 0 && item.priceETB <= 1_000_000_000 &&
    typeof item.quantity === "number" && Number.isInteger(item.quantity) &&
    item.quantity > 0 && item.quantity <= 99;
};

const readCart = (): { items: CartLine[]; available: boolean } => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("sv-demo-cart") || "[]");
    return {
      items: Array.isArray(value) ? value.filter(isCartLine) : [],
      available: true,
    };
  } catch {
    return { items: [], available: false };
  }
};

const formatETB = (amount: number) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DemoCartPanel() {
  const [items, setItems] = useState<CartLine[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);

  const refresh = useCallback(() => {
    const result = readCart();
    setItems(result.items);
    setStorageAvailable(result.available);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("sv-demo-cart-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("sv-demo-cart-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const update = (slug: string, quantity: number) => {
    const next = items
      .map((item) => item.slug === slug
        ? { ...item, quantity: Math.min(99, quantity) }
        : item)
      .filter((item) => item.quantity > 0);

    try {
      localStorage.setItem("sv-demo-cart", JSON.stringify(next));
      setItems(next);
      setStorageAvailable(true);
      window.dispatchEvent(new Event("sv-demo-cart-change"));
    } catch {
      setStorageAvailable(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.priceETB * item.quantity, 0);

  return (
    <div className="space-y-5">
      {!storageAvailable ? (
        <p role="status" className="rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-xs text-amber-100/80">
          Browser storage is unavailable. Cart changes may not be saved.
        </p>
      ) : null}
      {!items.length ? (
        <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center">
          <p className="text-lg font-semibold">Your demo cart is empty.</p>
          <p className="mt-2 text-sm text-white/45">Explore the sample catalogue and add products to try the shopping flow.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-full bg-amber-300 px-6 py-3 text-sm font-bold text-[#17120b] transition hover:bg-amber-200">Explore products</Link>
        </div>
      ) : (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="grid gap-3">
            {items.map((item) => (
              <article key={item.slug} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-[#191919] p-4 sm:flex-row sm:gap-4">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
                  <StorefrontImage src={item.image} fallbackSrc={DEMO_CATEGORIES[2].image} alt={item.title} sizes="96px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words font-semibold">{item.title}</p>
                  <span className="mt-1 inline-flex rounded-full bg-amber-300/15 px-2 py-1 text-[9px] font-black tracking-widest text-amber-200">DEMO</span>
                  <p className="mt-2 text-sm font-bold">{formatETB(item.priceETB)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button type="button" aria-label={`Decrease quantity of ${item.title}`} onClick={() => update(item.slug, item.quantity - 1)} className="grid size-9 place-items-center rounded-full border border-white/20 transition hover:border-amber-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">−</button>
                    <span className="min-w-5 text-center text-sm tabular-nums" aria-live="polite">{item.quantity}</span>
                    <button type="button" aria-label={`Increase quantity of ${item.title}`} disabled={item.quantity >= 99} onClick={() => update(item.slug, item.quantity + 1)} className="grid size-9 place-items-center rounded-full border border-white/20 transition hover:border-amber-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-35">+</button>
                    <button type="button" aria-label={`Remove ${item.title} from cart`} onClick={() => update(item.slug, 0)} className="ml-1 rounded-full px-2 py-2 text-xs text-rose-300 transition hover:bg-rose-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">Remove</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-2xl border border-white/10 bg-[#191919] p-6">
            <h2 className="text-lg font-bold">Demo order summary</h2>
            <p className="mt-2 text-xs leading-6 text-white/45">All items are sample listings. This cart cannot create a real purchase.</p>
            <div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-sm">
              <span>Subtotal</span>
              <b aria-live="polite">{formatETB(total)}</b>
            </div>
            <Link href="/demo-checkout" className="mt-5 flex justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-extrabold text-[#17120b] transition hover:bg-amber-200">Continue to demo checkout</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
