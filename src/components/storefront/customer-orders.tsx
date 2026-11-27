"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Order = { id: number; name?: string; status?: string; amount?: number; createdAt?: string; isDemoOrder?: boolean; items?: Array<{ title: string; quantity: number; lineTotal: number; isDemo?: boolean }> };

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
          <div className="mt-8 space-y-4">{orders.map((order) => <article key={order.id} className="rounded-2xl border border-white/10 bg-[#101a28] p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-white/40">Order #{order.id}</p><p className="mt-1 text-lg font-semibold">{order.items?.length ?? 0} items</p></div><div className="flex items-center gap-2"><span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-200">DEMO ORDER</span><span className="rounded-full border border-white/15 px-3 py-1.5 text-[9px] uppercase tracking-wider text-white/65">{order.status || "new"}</span></div></div><div className="mt-4 space-y-2">{order.items?.map((item,index)=><div key={index} className="flex justify-between gap-3 text-xs text-white/60"><span>{item.title} × {item.quantity}{item.isDemo ? " · Demo" : ""}</span><span>ETB {Number(item.lineTotal).toLocaleString("en-ET")}</span></div>)}</div><div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-4 text-xs"><span className="text-white/40">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-ET") : "Date unavailable"}</span><strong className="text-cyan-100">Total · ETB {Number(order.amount ?? 0).toLocaleString("en-ET")}</strong></div></article>)}</div>
        ) : <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-10 text-center"><p className="text-sm text-white/55">You have no orders yet.</p><Link href="/shop" className="mt-5 inline-flex rounded-full bg-cyan-200 px-5 py-3 text-xs font-bold text-[#07111a]">Explore products ↗</Link></div>}
      </div>
    </main>
  );
}
