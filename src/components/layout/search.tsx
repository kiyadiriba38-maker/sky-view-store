"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

import type { Product } from "@/lib/core/types/payload-types";

import { Price } from "@/components/shared/elements-ssr";
import ImageVideo from "@/components/shared/image-video";
import { Button } from "@/components/ui";
import { RoutePath } from "@/lib/core/types/types";

export default function Search({
  products,
  onClose,
}: {
  products: Product[];
  onClose: () => void;
}) {
  const t = useTranslations("general");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return products;
    }

    return products
      .map((p) => {
        const title = p.title.toLowerCase();
        const slug = p.slug.toLowerCase();
        const price = String(p.priceInUSD);

        let score = 0;

        if (title === q) score = 100;
        else if (title.startsWith(q)) score = 80;
        else if (title.includes(q)) score = 60;

        if (slug.includes(q)) score += 40;
        if (price.includes(q)) score += 20;

        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.p.title.localeCompare(b.p.title))
      .map((x) => x.p);
  }, [products, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) onClose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-2xl">
      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          aria-label={t("search")}
          aria-controls="search-results"
          role="combobox"
          aria-expanded
          className="
        w-full rounded-xl border border-amber-300/20 bg-[#171717] px-4 py-3 pe-10 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/20
      "
        />

        <div className="absolute inset-y-0 end-1 flex items-center justify-center">
          {query ? (
            <Button
              variant="outline"
              size="icon"
              aria-label={t("clear")}
              className="h-8 w-8 border-0 text-amber-200/65 transition hover:cursor-pointer hover:text-amber-100"
              onClick={() => setQuery("")}
            >
              <FiX className="h-5 w-5" />
            </Button>
          ) : (
            <FiSearch className="h-5 w-5 text-amber-200/65" />
          )}
        </div>
      </div>

      <div
        id="search-results"
        className="
        mt-2 overflow-hidden rounded-xl border border-amber-300/20 bg-[#171717] text-white shadow-[0_22px_65px_rgba(0,0,0,.48)] backdrop-blur-2xl
      "
      >
        <div className="border-b border-white/10 px-4 py-3 text-[9px] font-bold uppercase tracking-[.18em] text-amber-200/75">
          {t("products")}
        </div>

        <div className="max-h-[min(20rem,55dvh)] overflow-y-auto overscroll-contain">
          {results.length > 0 ? (
            results.map((product) => (
              <Link
                key={product.id}
                href={`/${RoutePath.product}/${product.slug}`}
                onClick={onClose}
                className="
                flex items-center gap-3 px-4 py-3
                transition-colors hover:bg-amber-300/[.08]
              "
              >
                <div
                  className="
                  h-10 w-10 overflow-hidden rounded-lg border
                  border-neutral-200 bg-neutral-50
                  dark:border-neutral-700 dark:bg-neutral-800
                "
                >
                  {typeof product.meta?.image === "object" && (
                    <ImageVideo resource={product.meta.image} variant="card" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">
                    {product.title}
                  </div>
                </div>

                <div className="shrink-0 text-sm font-semibold text-amber-100">
                  <Price amount={product.priceInUSD!} />
                </div>
              </Link>
            ))
          ) : (
            <div className="p-5 text-sm text-white/50">
              {t("noMatch")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
