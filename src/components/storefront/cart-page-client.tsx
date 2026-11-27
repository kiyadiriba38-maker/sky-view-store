"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import Link from "next/link";
import { useMemo } from "react";

import type { Cart } from "@/payload-types";

import { DeleteItemButton, EditItemQuantityButton } from "@/components/shop/cart/cart-controls";
import { Price } from "@/components/shared/elements-ssr";
import { buildCartRows } from "@/lib/core/adapter";

export default function CartPageClient() {
  const { cart, clearCart } = useCart();
  const rows = useMemo(() => buildCartRows(cart), [cart]);
  const quantity = rows.reduce((total, row) => total + Number(row.item.quantity ?? 0), 0);
  const subtotal = typeof cart?.subtotal === "number" ? cart.subtotal : 0;

  if (!rows.length) {
    return <div className="rounded-3xl border border-dashed border-white/15 bg-white/[.025] px-6 py-16 text-center"><p className="text-4xl">🛒</p><h2 className="mt-4 text-2xl font-semibold">Your cart is empty</h2><p className="mt-2 text-sm text-white/45">Explore the catalogue and add products to your cart.</p><Link href="/shop" className="mt-7 inline-flex rounded-full bg-cyan-200 px-6 py-3 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#07111a] hover:bg-white">Continue shopping ↗</Link></div>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <section className="space-y-3">
        {rows.map(({ item, data }, index) => {
          const { product, variant, isVariant, price, originalPrice } = data;
          return <article key={item.id ?? index} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#101a28] p-4 sm:flex-row sm:items-center">
            <Link href={`/product/${product.slug}`} className="min-w-0 flex-1">
              <p className="font-semibold">{product.title}</p>
              {isVariant && variant ? <p className="mt-1 text-xs text-white/45">{Array.isArray(variant.options) ? variant.options.map((option) => typeof option === "object" && option && "label" in option ? String(option.label) : null).filter(Boolean).join(" / ") : ""}</p> : null}
              <p className="mt-3 text-sm font-bold"><Price amount={price} /></p>
              {typeof originalPrice === "number" ? <p className="text-xs text-white/35 line-through"><Price amount={originalPrice} /></p> : null}
            </Link>
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="flex h-10 items-center gap-1 rounded-full border border-white/15 px-1"><EditItemQuantityButton item={item as NonNullable<Cart["items"]>[number]} type="minus" /><span className="min-w-6 text-center text-sm">{item.quantity}</span><EditItemQuantityButton item={item as NonNullable<Cart["items"]>[number]} type="plus" /></div>
              <DeleteItemButton item={item as NonNullable<Cart["items"]>[number]} />
            </div>
          </article>;
        })}
      </section>
      <aside className="h-fit rounded-2xl border border-cyan-200/20 bg-[#101a28] p-6">
        <p className="text-[9px] font-bold uppercase tracking-[.2em] text-cyan-200">Order summary</p>
        <div className="mt-6 flex justify-between text-sm text-white/55"><span>Items</span><span>{quantity}</span></div>
        <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-base font-bold"><span>Subtotal</span><Price amount={subtotal} /></div>
        <p className="mt-4 text-xs leading-5 text-white/40">Shipping and final details are confirmed during the demo checkout.</p>
        <Link href="/checkout" className="mt-6 flex w-full justify-center rounded-full bg-cyan-200 px-5 py-4 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#07111a] transition hover:bg-white">Continue to checkout ↗</Link>
        <button type="button" onClick={() => clearCart()} className="mt-4 w-full text-center text-[9px] font-bold uppercase tracking-[.15em] text-white/40 transition hover:text-white">Clear cart</button>
      </aside>
    </div>
  );
}
