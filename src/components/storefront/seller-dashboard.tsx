"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Seller = { id: number; storeName: string; approvalStatus: "pending" | "approved" | "suspended" | "rejected"; city?: string };
type SellerProduct = { id: number; title: string; slug: string; listingStatus?: string; _status?: string; inventory?: number; priceInUSD?: number };
type SellerMetrics = { totalProducts: number; publishedProducts: number; pendingProducts: number; completedOrders: number; averageRating: number | null; verifiedReviewCount: number; responseTimeHours: number | null; deliveryPerformance: number | null; rank: number | null; approvedSellerCount: number; badges: string[] };

export default function SellerDashboard() {
  const t = useTranslations("seller");
  const [metrics, setMetrics] = useState<SellerMetrics | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("1200");
  const [inventory, setInventory] = useState("10");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const meResponse = await fetch("/api/users/me", { credentials: "include", cache: "no-store" });
      if (!meResponse.ok) throw new Error("Sign in to open Seller Center.");
      const me = await meResponse.json();
      const sellerUrl = new URL("/api/sellers", window.location.origin);
      sellerUrl.searchParams.set("where[owner][equals]", String(me?.user?.id ?? ""));
      sellerUrl.searchParams.set("limit", "1");
      const sellerResponse = await fetch(sellerUrl, { credentials: "include", cache: "no-store" });
      const sellerData = await sellerResponse.json();
      const current = sellerData?.docs?.[0] as Seller | undefined;
      if (!sellerResponse.ok) throw new Error("Could not load your seller profile.");
      setSeller(current ?? null);
      if (current) {
        const metricsResponse = await fetch("/api/sellers/me/metrics", { credentials: "include", cache: "no-store" });
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setMetrics(metricsData?.metrics ?? null);
        }
        const productsUrl = new URL("/api/products", window.location.origin);
        productsUrl.searchParams.set("where[seller][equals]", String(current.id));
        productsUrl.searchParams.set("limit", "100");
        productsUrl.searchParams.set("depth", "0");
        const productResponse = await fetch(productsUrl, { credentials: "include", cache: "no-store" });
        const productData = await productResponse.json();
        if (productResponse.ok) setProducts(productData?.docs ?? []);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load Seller Center.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!seller || seller.approvalStatus !== "approved") return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36),
          inventory: Number(inventory),
          priceInUSDEnabled: true,
          priceInUSD: Number(price),
          description: {
            root: {
              type: "root",
              children: [{ type: "paragraph", children: [{ type: "text", text: description.trim(), detail: 0, format: 0, mode: "normal", style: "", version: 1 }], direction: "ltr", format: "", indent: 0, version: 1 }],
              direction: "ltr", format: "", indent: 0, version: 1,
            },
          },
          meta: { title: title.trim(), description: description.trim(), image: null },
          productImageUrl: imageUrl.trim() || undefined,
          gallery: [],
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.errors?.[0]?.message || result?.message || "Product could not be submitted.");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setMessage("Product submitted for admin review. It will remain a draft until approved.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Product submission failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="sv-page min-h-[75vh] bg-[#070b12] px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/account" className="text-xs text-cyan-200 hover:text-white">← Customer account</Link>
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[.25em] text-cyan-200">Marketplace / Seller Center</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Your store workspace.</h1>
        {loading ? <p className="mt-8 text-sm text-white/50">Loading seller workspace…</p> : !seller ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#101a28] p-7">
            <h2 className="text-xl font-semibold">You do not have a seller profile yet.</h2>
            <p className="mt-3 text-sm text-white/50">Apply to open a store. An administrator must approve your application before you can list products.</p>
            <Link href="/seller/apply" className="mt-6 inline-flex rounded-full bg-cyan-200 px-5 py-3 text-sm font-bold text-[#07111a]">Apply to sell ↗</Link>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#101a28] p-6">
              <div><p className="text-xs text-white/40">Store profile</p><h2 className="mt-1 text-2xl font-semibold">{seller.storeName}</h2><p className="mt-1 text-xs text-white/45">{seller.city || "Ethiopia"}</p></div>
              <span className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-wider ${seller.approvalStatus === "approved" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200" : "border-amber-300/30 bg-amber-300/10 text-amber-200"}`}>{seller.approvalStatus}</span>
            </div>
            <section className="mt-5 rounded-2xl border border-white/10 bg-[#101a28] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{t("metricsTitle")}</h2>
                <span className="text-[9px] uppercase tracking-wider text-white/35">{t("badges")}</span>
              </div>
              <p className="mt-2 text-xs leading-6 text-white/45">{t("reputationNote")}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-white/[.025] p-4"><p className="text-[10px] text-white/45">{t("publishedListings")}</p><strong className="mt-2 block text-2xl">{metrics?.publishedProducts ?? "—"}</strong></div>
                <div className="rounded-xl border border-white/10 bg-white/[.025] p-4"><p className="text-[10px] text-white/45">{t("pendingReview")}</p><strong className="mt-2 block text-2xl">{metrics?.pendingProducts ?? "—"}</strong></div>
                <div className="rounded-xl border border-white/10 bg-white/[.025] p-4"><p className="text-[10px] text-white/45">{t("completedOrders")}</p><strong className="mt-2 block text-2xl">{metrics?.completedOrders ?? "—"}</strong></div>
                <div className="rounded-xl border border-white/10 bg-white/[.025] p-4"><p className="text-[10px] text-white/45">{t("verifiedRating")}</p><strong className="mt-2 block text-lg">{metrics?.averageRating === null || metrics?.averageRating === undefined ? t("awaitingVerifiedReviews") : `${metrics.averageRating.toFixed(2)} / 5 · ${metrics.verifiedReviewCount}`}</strong></div>
                <div className="rounded-xl border border-white/10 bg-white/[.025] p-4"><p className="text-[10px] text-white/45">{t("responseTime")}</p><strong className="mt-2 block text-sm">{metrics?.responseTimeHours == null ? t("notMeasured") : `${metrics.responseTimeHours} h`}</strong></div>
                <div className="rounded-xl border border-white/10 bg-white/[.025] p-4"><p className="text-[10px] text-white/45">{t("deliveryPerformance")}</p><strong className="mt-2 block text-sm">{metrics?.deliveryPerformance == null ? t("notMeasured") : `${metrics.deliveryPerformance}%`}</strong></div>
                <div className="rounded-xl border border-white/10 bg-white/[.025] p-4"><p className="text-[10px] text-white/45">{t("sellerRank")}</p><strong className="mt-2 block text-sm">{metrics?.rank ? `#${metrics.rank} / ${metrics.approvedSellerCount}` : t("notRanked")}</strong></div>
                <div className="rounded-xl border border-white/10 bg-white/[.025] p-4"><p className="text-[10px] text-white/45">{t("badges")}</p><div className="mt-2 flex flex-wrap gap-1.5">{(metrics?.badges ?? []).map((badge) => <span key={badge} className="rounded-full border border-cyan-200/20 bg-cyan-200/5 px-2 py-1 text-[9px] text-cyan-100">{badge === "Trusted seller" ? t("trustedSeller") : badge === "Top rated" ? t("topRated") : t("newSeller")}</span>)}</div></div>
              </div>
            </section>
            {seller.approvalStatus !== "approved" ? (
              <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6 text-sm leading-7 text-amber-100">Your seller application is {seller.approvalStatus}. Product listing tools unlock after an administrator approves your store.</div>
            ) : (
              <div className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
                <form onSubmit={addProduct} className="h-fit rounded-2xl border border-white/10 bg-[#101a28] p-6">
                  <h2 className="text-xl font-semibold">Submit a product</h2>
                  <p className="mt-2 text-xs leading-6 text-white/45">New seller listings are reviewed by an administrator before becoming visible.</p>
                  <label className="mt-5 block text-xs text-white/70">Product title<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-4 py-3 text-sm outline-none focus:border-cyan-200" /></label>
                  <label className="mt-4 block text-xs text-white/70">Product image URL (HTTPS)<input type="url" pattern="https://.*" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-4 py-3 text-sm outline-none focus:border-cyan-200" /></label>
                  <label className="mt-4 block text-xs text-white/70">Description<textarea required minLength={20} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-4 py-3 text-sm outline-none focus:border-cyan-200" /></label>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="block text-xs text-white/70">Price (ETB)<input required type="number" min="1" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-3 py-3 text-sm outline-none focus:border-cyan-200" /></label>
                    <label className="block text-xs text-white/70">Stock<input required type="number" min="0" value={inventory} onChange={(event) => setInventory(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-3 py-3 text-sm outline-none focus:border-cyan-200" /></label>
                  </div>
                  <button disabled={busy} className="mt-5 w-full rounded-full bg-cyan-200 px-5 py-3 text-sm font-bold text-[#07111a] disabled:opacity-50">{busy ? "Submitting…" : "Submit for review"}</button>
                </form>
                <section className="rounded-2xl border border-white/10 bg-[#101a28] p-6">
                  <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Your products</h2><span className="text-xs text-white/40">{products.length} listings</span></div>
                  <div className="mt-5 space-y-3">
                    {products.length ? products.map((product) => <article key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4"><div><h3 className="text-sm font-semibold">{product.title}</h3><p className="mt-1 text-[10px] text-white/40">Stock: {product.inventory ?? 0} · ETB {Number(product.priceInUSD ?? 0).toLocaleString("en-ET")}</p></div><span className="rounded-full border border-white/10 px-3 py-1.5 text-[9px] uppercase tracking-wider text-white/60">{product.listingStatus || product._status || "pending"}</span></article>) : <p className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">No products submitted yet.</p>}
                  </div>
                </section>
              </div>
            )}
          </>
        )}
        {message ? <p role="status" className="mt-5 rounded-xl border border-cyan-200/20 bg-cyan-200/5 p-4 text-sm text-cyan-100">{message}</p> : null}
      </div>
    </main>
  );
}
