"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DemoOrderItem = {
  slug: string;
  title: string;
  priceETB: number;
  quantity: number;
};
type DemoOrder = {
  id: string;
  createdAt: string;
  customer: string;
  address: string;
  items: DemoOrderItem[];
  totalETB: number;
  paymentMethod: string;
};

const isOrderItem = (value: unknown): value is DemoOrderItem => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<DemoOrderItem>;
  return typeof item.slug === "string" &&
    typeof item.title === "string" &&
    typeof item.priceETB === "number" && Number.isFinite(item.priceETB) && item.priceETB >= 0 &&
    typeof item.quantity === "number" && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99;
};

const isDemoOrder = (value: unknown): value is DemoOrder => {
  if (!value || typeof value !== "object") return false;
  const order = value as Partial<DemoOrder>;
  return typeof order.id === "string" &&
    typeof order.createdAt === "string" && Number.isFinite(Date.parse(order.createdAt)) &&
    Array.isArray(order.items) && order.items.length > 0 && order.items.every(isOrderItem) &&
    typeof order.totalETB === "number" && Number.isFinite(order.totalETB) && order.totalETB >= 0 &&
    typeof order.paymentMethod === "string";
};

const formatETB = (amount: number) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DemoOrdersPanel() {
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("sv-demo-orders") || "[]");
      setOrders(Array.isArray(saved) ? saved.filter(isDemoOrder).slice(0, 50) : []);
    } catch {
      setOrders([]);
      setStorageAvailable(false);
    }
  }, []);

  const clearHistory = () => {
    try {
      localStorage.removeItem("sv-demo-orders");
      setOrders([]);
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  };

  if (!orders.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center">
        <p>No demo orders yet.</p>
        {!storageAvailable ? <p role="alert" className="mt-3 text-xs text-amber-100">Browser storage is unavailable.</p> : null}
        <Link href="/shop" className="mt-4 inline-block text-amber-200">Explore the demo catalogue →</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <button type="button" onClick={clearHistory} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/60 transition hover:border-amber-300/50 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
          Clear demo history
        </button>
      </div>
      {orders.map((order) => (
        <article key={order.id} className="rounded-2xl border border-white/10 bg-[#191919] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-200">DEMO ORDER</span>
              <h2 className="mt-1 font-bold">{order.id}</h2>
            </div>
            <span className="rounded-full bg-amber-300/10 px-3 py-2 text-xs text-amber-200">Simulated · Processing</span>
          </div>
          <p className="mt-3 text-xs text-white/50">{new Date(order.createdAt).toLocaleString()} · {order.paymentMethod}</p>
          <div className="mt-4 border-t border-white/10 pt-4">
            {order.items.map((item, index) => (
              <div key={`${order.id}-${item.slug}-${index}`} className="flex justify-between gap-3 py-2 text-xs">
                <span>{item.title} × {item.quantity}</span>
                <b>{formatETB(item.priceETB * item.quantity)}</b>
              </div>
            ))}
          </div>
          <p className="mt-3 text-right font-bold">{formatETB(order.totalETB)}</p>
          <p className="mt-2 text-xs text-white/40">Demo tracking events are simulated. No delivery has been arranged.</p>
        </article>
      ))}
      <p className="text-[10px] text-white/35" aria-live="polite">{orders.length} saved demo {orders.length === 1 ? "order" : "orders"} on this device.</p>
    </div>
  );
}
