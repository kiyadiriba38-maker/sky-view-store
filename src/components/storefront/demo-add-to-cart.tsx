"use client";

import { useState } from "react";

type CartLine = { slug: string; title: string; priceETB: number; image: string; quantity: number };

export default function DemoAddToCart({ product }: { product: Omit<CartLine, "quantity"> }) {
  const [added, setAdded] = useState(false);
  const add = () => {
    try {
      const current = JSON.parse(localStorage.getItem("sv-demo-cart") || "[]") as CartLine[];
      const existing = current.find((line) => line.slug === product.slug);
      const next = existing
        ? current.map((line) => line.slug === product.slug ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { ...product, quantity: 1 }];
      localStorage.setItem("sv-demo-cart", JSON.stringify(next));
      window.dispatchEvent(new Event("sv-demo-cart-change"));
      setAdded(true);
    } catch {
      setAdded(false);
    }
  };
  return <button type="button" onClick={add} className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white">{added ? "Added to demo cart ✓" : "Add to demo cart"}</button>;
}
