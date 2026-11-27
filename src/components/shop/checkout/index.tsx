"use client";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import CheckoutForm from "@/components/shop/checkout/checkout-form";
import CheckoutSummary from "@/components/shop/checkout/checkout-summary";
import { Button } from "@/components/ui";

export default function CheckoutClient() {
  const t = useTranslations("checkout.page");
  const { cart, clearCart } = useCart();
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<"loading" | "signed-in" | "signed-out">("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/users/me", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const data = response.ok ? await response.json().catch(() => null) : null;
        if (active) setAuthStatus(data?.user ? "signed-in" : "signed-out");
      })
      .catch(() => { if (active) setAuthStatus("signed-out"); });
    return () => { active = false; };
  }, []);

  const cartIsEmpty = !cart?.items?.length;

  const cartId = useMemo(() => {
    const id = cart?.id;
    return typeof id === "number" ? id : undefined;
  }, [cart]);

  if (cartIsEmpty && !successOrderId) {
    return (
      <div className="py-12 flex flex-col items-center text-center text-foreground">
        <p className="text-lg font-medium">{t("emptyCart")}</p>

        <Link
          href="/"
          className="mt-4  underline underline-offset-4 hover:opacity-80"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  if (authStatus === "loading" && !successOrderId) {
    return <div className="my-8 rounded-2xl border border-white/10 bg-white/[.03] p-8 text-center text-sm text-muted-foreground">Checking your customer account…</div>;
  }

  if (authStatus === "signed-out" && !successOrderId) {
    return (
      <div className="mx-auto my-8 w-full max-w-xl rounded-2xl border border-cyan-200/20 bg-cyan-200/5 p-7 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">Customer sign-in required</p>
        <h2 className="mt-3 text-2xl font-semibold">Sign in to continue checkout.</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Your cart is kept separate from your account. Sign in or create a customer account to place a demo order.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/account/login?next=%2Fcheckout" className="rounded-full bg-cyan-200 px-6 py-3 text-xs font-bold text-slate-950">Sign in</Link>
          <Link href="/account/register?next=%2Fcheckout" className="rounded-full border border-white/20 px-6 py-3 text-xs font-bold">Create account</Link>
        </div>
      </div>
    );
  }

  return successOrderId ? (
    <div className="flex justify-center w-full my-8">
      <div className="rounded-lg p-6 w-full max-w-md text-center">
        <p className="font-medium">{t("orderReceived")}</p>
        <p className="text-sm opacity-80 mt-1">
          {t("orderId", { id: successOrderId })}
        </p>
        <Button className="mt-4" variant="outline">
          <Link href="/">{t("backToShop")}</Link>
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col md:flex-row justify-center items-start w-full max-w-5xl mx-auto gap-6 my-8">
      <CheckoutForm
        cartId={cartId}
        clearCart={clearCart}
        onSuccess={(orderId) => setSuccessOrderId(orderId)}
      />

      <CheckoutSummary />
    </div>
  );
}
