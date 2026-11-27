import { getTranslations } from "next-intl/server";
import { FaStar } from "react-icons/fa";

import type { Review } from "@/payload-types";

import { ReviewForm } from "@/components/shared/wrappers";
import { calculateAverageRating, cn, formatDate } from "@/lib/core/util";

const Stars = ({ rating, className }: { rating: number; className?: string }) => (
  <div className={cn("flex items-center gap-1", className)} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "text-cyan-300" : "text-white/15"}`} />
    ))}
  </div>
);

export default async function ProductReviews({
  reviews,
  productId,
}: {
  reviews: Review[];
  productId: number;
}) {
  const t = await getTranslations("product");
  const safeReviews = reviews ?? [];
  const average = safeReviews.length ? calculateAverageRating(safeReviews) : 0;
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: safeReviews.filter((review) => Math.round(review.rating) === rating).length,
  }));

  return (
    <section className="relative mt-16 overflow-hidden rounded-[26px] border border-white/10 bg-[#0b121d] px-5 py-9 text-white sm:px-8 sm:py-12 lg:px-12">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-cyan-200/10 shadow-[0_0_100px_rgba(34,211,238,.08)]" />
      <div className="relative">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.3em] text-cyan-200">Community / product feedback</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-.035em] sm:text-4xl">{t("customer_reviews")}</h2>
            <p className="mt-2 max-w-lg text-xs leading-6 text-white/45">Real feedback helps everyone make a more confident choice. Reviews shown here come from this product's review submissions.</p>
          </div>
          <div className="shrink-0"><ReviewForm productId={productId} /></div>
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-2xl border border-white/10 bg-white/[.035] p-6">
            <p className="text-[9px] font-bold uppercase tracking-[.22em] text-white/40">Overall rating</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-6xl font-semibold leading-none tracking-[-.07em]">{safeReviews.length ? average.toFixed(1) : "—"}</span>
              <span className="pb-1 text-xs text-white/35">/ 5</span>
            </div>
            <Stars rating={average} className="mt-4" />
            <p className="mt-3 text-[10px] text-white/40">{safeReviews.length ? `Based on ${safeReviews.length} customer ${safeReviews.length === 1 ? "review" : "reviews"}` : "No customer reviews yet"}</p>
            <div className="mt-7 space-y-3">
              {distribution.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-3 text-[10px]">
                  <span className="w-3 text-white/50">{rating}</span>
                  <FaStar className="h-3 w-3 text-cyan-300" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-200 transition-all" style={{ width: safeReviews.length ? `${(count / safeReviews.length) * 100}%` : "0%" }} /></div>
                  <span className="w-5 text-right tabular-nums text-white/35">{count}</span>
                </div>
              ))}
            </div>
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div><p className="text-[9px] font-bold uppercase tracking-[.22em] text-cyan-200">Customer voices</p><p className="mt-1 text-sm font-semibold">{safeReviews.length ? `${safeReviews.length} published ${safeReviews.length === 1 ? "review" : "reviews"}` : "Be the first to share feedback"}</p></div>
              <span className="rounded-full border border-white/10 px-3 py-2 text-[8px] font-bold uppercase tracking-[.15em] text-white/35">Verified by submission</span>
            </div>

            {safeReviews.length ? (
              <div className="space-y-3">
                {safeReviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-5 transition hover:border-cyan-200/25 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><p className="text-sm font-semibold">{review.authorName}</p><Stars rating={review.rating} className="mt-2" /></div>
                      <time className="text-[9px] uppercase tracking-[.12em] text-white/35">{formatDate(review.createdAt)}</time>
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{review.title}</h3>
                    <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-white/55">{review.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[245px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[.02] px-6 py-10 text-center">
                <span className="grid size-12 place-items-center rounded-full border border-cyan-200/25 bg-cyan-200/10 text-xl text-cyan-200">✦</span>
                <h3 className="mt-4 text-lg font-semibold">Your experience belongs here.</h3>
                <p className="mt-2 max-w-sm text-xs leading-6 text-white/40">There are no reviews yet. Share useful, honest feedback to help the next shopper.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
