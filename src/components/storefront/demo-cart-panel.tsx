"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type CartLine = { slug: string; title: string; priceETB: number; image: string; quantity: number };

const readCart = (): CartLine[] => {
  try { return JSON.parse(localStorage.getItem("sv-demo-cart") || "[]") as CartLine[]; } catch { return []; }
};

export default function DemoCartPanel() {
  const [items, setItems] = useState<CartLine[]>([]);
  const refresh = useCallback(() => setItems(readCart()), []);
  useEffect(() => { refresh(); window.addEventListener("sv-demo-cart-change", refresh); window.addEventListener("storage", refresh); return () => { window.removeEventListener("sv-demo-cart-change", refresh); window.removeEventListener("storage", refresh); }; }, [refresh]);
  const update = (slug: string, quantity: number) => {
    const next = items.map((item) => item.slug === slug ? { ...item, quantity } : item).filter((item) => item.quantity > 0);
    localStorage.setItem("sv-demo-cart", JSON.stringify(next)); setItems(next); window.dispatchEvent(new Event("sv-demo-cart-change"));
  };
  const total = items.reduce((sum, item) => sum + item.priceETB * item.quantity, 0);
  if (!items.length) return <div className="rounded-3xl border border-dashed border-white/15 p-12 text-center"><p className="text-lg font-semibold">Your demo cart is empty.</p><p className="mt-2 text-sm text-white/45">Explore the sample catalogue and add products to try the shopping flow.</p><Link href="/shop" className="mt-6 inline-flex rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950">Explore products</Link></div>;
  return <div className="grid gap-6 lg:grid-cols-[1fr_330px]"><div className="grid gap-3">{items.map((item)=><article key={item.slug} className="flex gap-4 rounded-2xl border border-white/10 bg-[#101a28] p-4"><img src={item.image} alt="" className="size-24 rounded-xl object-cover"/><div className="min-w-0 flex-1"><p className="font-semibold">{item.title}</p><span className="mt-1 inline-flex rounded-full bg-amber-300/15 px-2 py-1 text-[9px] font-black tracking-widest text-amber-200">DEMO</span><p className="mt-2 text-sm font-bold">{new Intl.NumberFormat("en-ET",{style:"currency",currency:"ETB",maximumFractionDigits:0}).format(item.priceETB)}</p><div className="mt-3 flex items-center gap-3"><button onClick={()=>update(item.slug,item.quantity-1)} className="size-8 rounded-full border border-white/20">−</button><span className="text-sm">{item.quantity}</span><button onClick={()=>update(item.slug,item.quantity+1)} className="size-8 rounded-full border border-white/20">+</button><button onClick={()=>update(item.slug,0)} className="ml-3 text-xs text-rose-300">Remove</button></div></div></article>)}</div><aside className="h-fit rounded-2xl border border-white/10 bg-[#101a28] p-6"><h2 className="text-lg font-bold">Demo order summary</h2><p className="mt-2 text-xs leading-6 text-white/45">All items are sample listings. This cart cannot create a real purchase.</p><div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-sm"><span>Subtotal</span><b>{new Intl.NumberFormat("en-ET",{style:"currency",currency:"ETB",maximumFractionDigits:0}).format(total)}</b></div><Link href="/demo-checkout" className="mt-5 flex justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-extrabold text-slate-950">Continue to demo checkout</Link></aside></div>;
}
