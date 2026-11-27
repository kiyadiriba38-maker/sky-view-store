"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Order = { id: number; name?: string; status?: string; amount?: number; createdAt?: string; isDemoOrder?: boolean; returnRequestStatus?: string; returnReason?: string; returnRequestedAt?: string; items?: Array<{ title: string; quantity: number; lineTotal: number; isDemo?: boolean }> };

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [returnReasons, setReturnReasons] = useState<Record<number, string>>({});
  const [returnMessages, setReturnMessages] = useState<Record<number, string>>({});
  const [returnBusy, setReturnBusy] = useState<number | null>(null);

  async function submitReturn(orderId: number) {
    const reason = (returnReasons[orderId] ?? "").trim();
    if (reason.length < 10) {
      setReturnMessages((current) => ({ ...current, [orderId]: "Please explain the reason in at least 10 characters." }));
      return;
    }
    setReturnBusy(orderId);
    setReturnMessages((current) => ({ ...current, [orderId]: "" }));
    try {
      const response = await fetch(`/api/orders/${orderId}/return-request`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Could not submit the return request.");
      setOrders((current) => current.map((order) => order.id === orderId
        ? { ...order, returnRequestStatus: "requested", returnReason: reason, returnRequestedAt: new Date().toISOString() }
        : order));
      setReturnMessages((current) => ({ ...current, [orderId]: result?.message || "Return request submitted." }));
    } catch (error) {
      setReturnMessages((current) => ({ ...current, [orderId]: error instanceof Error ? error.message : "Could not submit the return request." }));
    } finally {
      setReturnBusy(null);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const meResponse = await fetch("/api/users/me", { credentials: "include", cache: "no-store" });
        if (!meResponse.ok) throw new Error("Sign in to view your orders.");
        const me = await meResponse.json();
        const url = new URL("/api/orders", window.location.origin);
        url.searchParams.set("where[customer][equals]", String(me?.user?.id ?? ""));
        url.searchParams.set("limit", "100");
        url.searchParams.set("sort", "-createdAt");
        url.searchParams.set("depth", "0");
        const response = await fetch(url, { credentials: "include", cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.errors?.[0]?.message || "Could not load your orders.");
        if (active) setOrders(data?.docs ?? []);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load orders.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  return (
    <main className="sv-page min-h-[75vh] bg-[#070b12] px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/account" className="text-xs text-cyan-200 hover:text-white">← My account</Link>
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[.25em] text-cyan-200">Customer / Orders</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Your orders.</h1>
        <p className="mt-3 text-sm text-white/50">Order history and simulated shipment status.</p>
        {loading ? <p className="mt-8 text-sm text-white/50">Loading orders…</p> : message ? <p className="mt-8 rounded-xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm text-amber-100">{message}</p> : orders.length ? (
          <div className="mt-8 space-y-4">{orders.map((order) => <article key={order.id} className="rounded-2xl border border-white/10 bg-[#101a28] p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-white/40">Order #{order.id}</p><p className="mt-1 text-lg font-semibold">{order.items?.length ?? 0} items</p></div><div className="flex items-center gap-2"><span className={`rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider ${order.isDemoOrder ? "border-amber-300/30 bg-amber-300/10 text-amber-200" : "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"}`}>{order.isDemoOrder ? "DEMO ORDER" : "CUSTOMER ORDER"}</span><span className="rounded-full border border-white/15 px-3 py-1.5 text-[9px] uppercase tracking-wider text-white/65">{order.status || "new"}</span></div></div><div className="mt-4 space-y-2">{order.items?.map((item,index)=><div key={index} className="flex justify-between gap-3 text-xs text-white/60"><span>{item.title} × {item.quantity}{item.isDemo ? " · Demo" : ""}</span><span>ETB {Number(item.lineTotal).toLocaleString("en-ET")}</span></div>)}</div><div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-4 text-xs"><span className="text-white/40">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-ET") : "Date unavailable"}</span><strong className="text-cyan-100">Total · ETB {Number(order.amount ?? 0).toLocaleString("en-ET")}</strong></div>
            {order.status === "done" && (order.returnRequestStatus ?? "none") === "none" ? <section className="mt-5 rounded-xl border border-white/10 bg-white/[.03] p-4"><p className="text-xs font-semibold text-white/80">Need to return this order?</p><p className="mt-1 text-[10px] leading-5 text-white/45">Submit a request for the store team to review. Demo orders only simulate this process; no real refund is issued.</p><textarea value={returnReasons[order.id] ?? ""} onChange={(event) => setReturnReasons((current) => ({ ...current, [order.id]: event.target.value }))} rows={3} maxLength={1000} placeholder="Tell us why you are requesting a return…" className="mt-3 w-full rounded-lg border border-white/15 bg-[#07111a] p-3 text-xs text-white outline-none focus:border-cyan-200/60" /><button type="button" disabled={returnBusy === order.id} onClick={() => void submitReturn(order.id)} className="mt-3 rounded-full bg-cyan-200 px-4 py-2.5 text-[10px] font-bold text-[#07111a] disabled:opacity-50">{returnBusy === order.id ? "Submitting…" : "Submit return request"}</button>{returnMessages[order.id] ? <p role="status" className="mt-3 text-[10px] leading-5 text-cyan-100">{returnMessages[order.id]}</p> : null}</section> : order.returnRequestStatus && order.returnRequestStatus !== "none" ? <p className="mt-5 rounded-xl border border-cyan-200/15 bg-cyan-200/5 p-4 text-xs text-cyan-100">Return request: {order.returnRequestStatus}. {order.isDemoOrder ? "Demo simulation only — no payment or refund was processed." : "The store team will review your request."}</p> : null}
          </article>)}</div>
        ) : <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-10 text-center"><p className="text-sm text-white/55">You have no orders yet.</p><Link href="/shop" className="mt-5 inline-flex rounded-full bg-cyan-200 px-5 py-3 text-xs font-bold text-[#07111a]">Explore products ↗</Link></div>}
      </div>
    </main>
  );
}
