"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type CartLine = {
  slug: string;
  title: string;
  priceETB: number;
  image: string;
  quantity: number;
};
type DemoOrder = {
  id: string;
  createdAt: string;
  customer: string;
  address: string;
  items: CartLine[];
  totalETB: number;
  paymentMethod: string;
};

const paymentOptions = [
  "Telebirr (simulation)",
  "CBE Birr (simulation)",
  "Bank transfer (simulation)",
  "Cash on delivery (simulation)",
];

const isCartLine = (value: unknown): value is CartLine => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartLine>;
  return typeof item.slug === "string" && item.slug.length > 0 &&
    typeof item.title === "string" && item.title.length > 0 &&
    typeof item.image === "string" &&
    typeof item.priceETB === "number" && Number.isFinite(item.priceETB) &&
    item.priceETB >= 0 && item.priceETB <= 1_000_000_000 &&
    typeof item.quantity === "number" && Number.isInteger(item.quantity) &&
    item.quantity > 0 && item.quantity <= 99;
};

const formatETB = (amount: number) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(amount);

export default function DemoCheckoutPanel() {
  const [items, setItems] = useState<CartLine[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState(paymentOptions[0]);
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem("sv-demo-cart") || "[]");
      setItems(Array.isArray(stored) ? stored.filter(isCartLine) : []);
    } catch {
      setItems([]);
      setStorageError(true);
    }
  }, []);

  const total = items.reduce((sum, item) => sum + item.priceETB * item.quantity, 0);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length || !name.trim() || !address.trim() || !paymentOptions.includes(payment)) return;

    const created: DemoOrder = {
      id: `SV-DEMO-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      customer: name.trim().slice(0, 80),
      address: address.trim().slice(0, 240),
      items,
      totalETB: total,
      paymentMethod: payment,
    };

    try {
      const previousValue: unknown = JSON.parse(localStorage.getItem("sv-demo-orders") || "[]");
      const previous = Array.isArray(previousValue)
        ? previousValue.filter((value): value is DemoOrder =>
            Boolean(value) && typeof value === "object" &&
            typeof (value as DemoOrder).id === "string" &&
            Array.isArray((value as DemoOrder).items),
          )
        : [];
      // Keep the demo order history free of user-entered delivery details.
      const historyEntry = {
        ...created,
        customer: "Demo customer",
        address: "Sample address (demo only)",
      };
      localStorage.setItem("sv-demo-orders", JSON.stringify([historyEntry, ...previous].slice(0, 50)));
      localStorage.removeItem("sv-demo-cart");
      window.dispatchEvent(new Event("sv-demo-cart-change"));
    } catch {
      setStorageError(true);
    }

    setOrder(created);
    setItems([]);
    setSubmitError(false);
  };

  if (order) {
    return (
      <div role="status" aria-live="polite" className="rounded-3xl border border-emerald-300/30 bg-emerald-300/5 p-8">
        <p className="text-xs font-black tracking-widest text-emerald-200">SIMULATED ORDER CREATED</p>
        <h2 className="mt-3 text-3xl font-bold">Thank you, {order.customer}.</h2>
        <p className="mt-3 text-sm text-white/60">Your demo order reference is <b>{order.id}</b>. No payment was processed and no real product will be shipped.</p>
        {storageError ? <p className="mt-3 text-xs text-amber-100">Your confirmation is shown for this visit, but browser storage could not save the demo history.</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/demo-orders" className="rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-[#17120b]">View demo orders</Link>
          <Link href="/shop" className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold">Continue shopping</Link>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center">
        <p>Your demo cart is empty.</p>
        <Link href="/shop" className="mt-4 inline-block text-amber-300">Browse products →</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="rounded-2xl border border-white/10 bg-[#191919] p-6">
        <h2 className="text-xl font-bold">Delivery details</h2>
        <p className="mt-2 text-xs text-white/45">Use sample information only. Do not enter your real name, home address, or contact details.</p>
        <label className="mt-5 block text-xs font-semibold">
          Sample name
          <input required autoComplete="off" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#191919] p-3 text-sm outline-none focus:border-amber-300" placeholder="Demo customer" />
        </label>
        <label className="mt-4 block text-xs font-semibold">
          Sample delivery address
          <input required autoComplete="off" maxLength={240} value={address} onChange={(event) => setAddress(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#191919] p-3 text-sm outline-none focus:border-amber-300" placeholder="Sample address, Addis Ababa" />
        </label>
        <label className="mt-4 block text-xs font-semibold">
          Demo payment method
          <select value={payment} onChange={(event) => setPayment(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#191919] p-3 text-sm text-white outline-none focus:border-amber-300">
            {paymentOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs leading-6 text-amber-100">
          DEMO CHECKOUT ONLY. Do not enter bank details, card numbers, PINs, OTPs, or real personal information. No money is collected.
        </div>
        {storageError || submitError ? (
          <p role="alert" className="mt-4 text-xs text-amber-100">
            {submitError ? "The demo order could not be saved to this browser. You can still review the sample checkout." : "Browser storage is unavailable; demo order history may not be saved."}
          </p>
        ) : null}
      </div>
      <aside className="h-fit rounded-2xl border border-white/10 bg-[#191919] p-6">
        <h2 className="font-bold">Order summary</h2>
        {items.map((item) => (
          <div key={item.slug} className="mt-3 flex justify-between gap-3 text-xs">
            <span>{item.title} × {item.quantity}</span>
            <b>{formatETB(item.priceETB * item.quantity)}</b>
          </div>
        ))}
        <div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-sm">
          <span>Total (demo)</span>
          <b>{formatETB(total)}</b>
        </div>
        <button type="submit" disabled={!name.trim() || !address.trim()} className="mt-5 w-full rounded-full bg-amber-300 px-5 py-3 text-sm font-extrabold text-[#17120b] transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50">
          Place simulated order
        </button>
      </aside>
    </form>
  );
}
