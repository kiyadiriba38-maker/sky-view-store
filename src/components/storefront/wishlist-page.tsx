"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { FiHeart, FiTrash2 } from "react-icons/fi";
import StorefrontImage from "@/components/storefront/storefront-image";
import { DEMO_CATEGORIES } from "@/lib/demo/catalog";

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

const isSafeImage = (value: unknown): value is string =>
  typeof value === "string" &&
  (value.startsWith("/") && !value.startsWith("//") ||
    /^https:\/\//i.test(value));

const isSafeProductPath = (value: unknown): value is string =>
  typeof value === "string" &&
  !value.includes("\\") &&
  !value.startsWith("//") &&
  (/^\/(?:product|demo-product)\/[a-zA-Z0-9_-]+$/.test(value));

function normalizeSavedProduct(value: unknown): SavedProduct | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<SavedProduct>;
  if (
    typeof item.id !== "string" ||
    typeof item.slug !== "string" ||
    typeof item.title !== "string" ||
    !isSafeImage(item.image) ||
    !isSafeProductPath(item.href)
  ) return null;

  const price = Number(item.priceETB);
  return {
    id: item.id.slice(0, 180),
    slug: item.slug.slice(0, 180),
    title: item.title.slice(0, 240),
    image: item.image,
    priceETB: Number.isFinite(price) && price >= 0 ? price : 0,
    category: typeof item.category === "string" ? item.category.slice(0, 100) : "Marketplace",
    demo: item.demo === true,
    href: item.href,
  };
}

export default function WishlistPage() {\n  const t = useTranslations("marketplace");
  const [items, setItems] = useState<SavedProduct[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);

  const load = useCallback(() => {
    try {
      const saved: unknown = JSON.parse(window.localStorage.getItem("sv-wishlist") || "[]");
      setItems(Array.isArray(saved)
        ? saved.map(normalizeSavedProduct).filter((item): item is SavedProduct => item !== null)
        : []);
      setStorageAvailable(true);
    } catch {
      setItems([]);
      setStorageAvailable(false);
    }
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

  function persist(next: SavedProduct[]) {
    setItems(next);
    try {
      window.localStorage.setItem("sv-wishlist", JSON.stringify(next));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
    window.dispatchEvent(new Event("sv-wishlist-change"));
  }

  function remove(id: string) {
    persist(items.filter((item) => item.id !== id));
  }

  function clearAll() {
    persist([]);
  }

  return (
    <main className="sv-page min-h-[75vh] bg-[#121212] px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-xs text-amber-200 transition hover:text-white">← {t("wishlistBack")}</Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.25em] text-amber-200">{t("wishlistEyebrow")}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t("wishlistTitle")}</h1>
            <p className="mt-3 text-sm text-white/50" aria-live="polite">{t("wishlistCount", { count: items.length })}</p>
          </div>
          {items.length ? (
            <button type="button" onClick={clearAll} className="rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/65 transition hover:border-rose-300/40 hover:text-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
              {t("wishlistClear")}
            </button>
          ) : null}
        </div>

        {!storageAvailable ? (
          <p role="status" className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-xs text-amber-100/80">
            {t("wishlistStorageUnavailable")}
          </p>
        ) : null}

        {items.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <article key={item.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#191919] transition duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:shadow-[0_18px_50px_rgba(0,0,0,.25)]">
                <Link href={item.href} className="relative block aspect-square overflow-hidden bg-white/[.03]">
                  <StorefrontImage src={item.image} alt={item.title} fallbackSrc={DEMO_CATEGORIES[2].image} sizes="(max-width: 640px) 90vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white">{item.demo ? t("wishlistDemoItem") : t("wishlistMarketplaceItem")}</span>
                </Link>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">{item.category}</p>
                  <Link href={item.href} className="mt-2 block min-h-10 text-sm font-semibold text-white transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">{item.title}</Link>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <strong className="text-sm text-amber-100">ETB {item.priceETB.toLocaleString("en-ET", { maximumFractionDigits: 0 })}</strong>
                    <button type="button" onClick={() => remove(item.id)} aria-label={t("wishlistRemove", { title: item.title })} className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-rose-300/40 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[.02] px-6 py-16 text-center">
            <FiHeart aria-hidden="true" className="mx-auto h-8 w-8 text-amber-200/70" />
            <h2 className="mt-5 text-xl font-semibold">{t("wishlistEmptyTitle")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">{t("wishlistEmptyText")}</p>
            <Link href="/shop" className="mt-6 inline-flex rounded-full bg-amber-300 px-5 py-3 text-xs font-bold text-[#15100a] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">{t("wishlistExplore")} ↗</Link>
          </div>
        )}
        <p className="mt-8 text-[10px] leading-5 text-white/30">{t("wishlistLocalNote")}</p>
      </div>
    </main>
  );
}
