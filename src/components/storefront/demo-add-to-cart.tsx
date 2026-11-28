"use client";

import { useState } from "react";

type CartLine = {
  slug: string;
  title: string;
  priceETB: number;
  image: string;
  quantity: number;
};

type AddState = "idle" | "added" | "error";

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<CartLine>;
  return typeof line.slug === "string" &&
    typeof line.title === "string" &&
    typeof line.image === "string" &&
    typeof line.priceETB === "number" &&
    Number.isFinite(line.priceETB) &&
    line.priceETB >= 0 &&
    typeof line.quantity === "number" &&
    Number.isInteger(line.quantity) &&
    line.quantity > 0 &&
    line.quantity <= 99;
}

export default function DemoAddToCart({
  product,
}: {
  product: Omit<CartLine, "quantity">;
}) {
  const [state, setState] = useState<AddState>("idle");

  const add = () => {
    if (
      !product.slug ||
      !product.title ||
      !product.image ||
      !Number.isFinite(product.priceETB) ||
      product.priceETB < 0
    ) {
      setState("error");
      return;
    }

    try {
      const stored: unknown = JSON.parse(localStorage.getItem("sv-demo-cart") || "[]");
      const current = Array.isArray(stored) ? stored.filter(isCartLine) : [];
      const existing = current.find((line) => line.slug === product.slug);
      const next = existing
        ? current.map((line) =>
            line.slug === product.slug
              ? { ...line, quantity: Math.min(99, line.quantity + 1) }
              : line,
          )
        : [...current, { ...product, quantity: 1 }];

      localStorage.setItem("sv-demo-cart", JSON.stringify(next));
      window.dispatchEvent(new Event("sv-demo-cart-change"));
      setState("added");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={add}
        aria-label={`Add ${product.title} to demo cart`}
        className="rounded-full bg-amber-300 px-6 py-3 text-sm font-extrabold text-[#17120b] transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
      >
        {state === "added"
          ? "Added to demo cart ✓"
          : state === "error"
            ? "Could not add — try again"
            : "Add to demo cart"}
      </button>
      <span role="status" aria-live="polite" className="min-h-4 text-[11px] text-amber-100/75">
        {state === "added"
          ? "This sample item is in your demo cart."
          : state === "error"
            ? "Browser storage is unavailable or the sample item is invalid."
            : ""}
      </span>
    </div>
  );
}
