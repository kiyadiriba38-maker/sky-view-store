"use client";

import { useCallback, useState } from "react";

import GenericForm from "@/components/shared/generic-form";
import {
  checkoutFormConfig,
  type CheckoutFormData,
  type CheckoutFormProps,
} from "@/lib/core/types/form";
import { postJson } from "@/lib/core/util";
import { stripeConfig } from "@/lib/stripe/config";

const demoPaymentMethods = [
  { value: "telebirr", label: "Telebirr", detail: "Mobile money demo" },
  { value: "cbe_birr", label: "CBE Birr", detail: "Mobile wallet demo" },
  { value: "bank_transfer", label: "Bank transfer", detail: "Bank payment demo" },
  { value: "cash_on_delivery", label: "Cash on delivery", detail: "Delivery payment demo" },
] as const;

type DemoPaymentMethod = (typeof demoPaymentMethods)[number]["value"];

export default function CheckoutForm({
  cartId,
  clearCart,
  onSuccess,
}: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<DemoPaymentMethod>("telebirr");

  const submitOrder = useCallback(
    async (data: CheckoutFormData) => {
      const json = await postJson<{ doc: { id: number } }>("orders?depth=0", {
        cart: cartId,
        ...data,
        demoPaymentMethod: paymentMethod,
      });

      return String(json.doc.id);
    },
    [cartId, paymentMethod],
  );

  if (stripeConfig.ENABLED) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        Real payment checkout is disabled for this store. Turn off the Stripe
        environment setting before accepting orders.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        role="status"
        className="mb-5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-sm text-foreground"
      >
        <p className="font-semibold">Demo checkout — no real payment will be taken.</p>
        <p className="mt-1 text-muted-foreground">
          Choose an Ethiopian payment method to preview the experience. This
          records only a test order; no payment provider is contacted. Never
          enter a PIN, OTP, card number, or banking password.
        </p>
      </div>

      <div className="mb-5 space-y-3">
        <div>
          <h3 className="text-base font-semibold">Choose a demo payment method</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select how you would like the sample checkout to appear.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {demoPaymentMethods.map((method) => {
            const selected = paymentMethod === method.value;
            return (
              <button
                key={method.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setPaymentMethod(method.value)}
                className={`rounded-xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400 ${selected ? "border-cyan-400 bg-cyan-400/10 ring-1 ring-cyan-400/40" : "border-border bg-background"}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{method.label}</span>
                  <span className={`grid size-5 place-items-center rounded-full border text-xs ${selected ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-muted-foreground/50"}`}>
                    {selected ? "✓" : ""}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">{method.detail}</span>
              </button>
            );
          })}
        </div>
      </div>

      <GenericForm
        config={checkoutFormConfig}
        onSubmit={submitOrder}
        onSuccess={async (orderId) => {
          onSuccess(orderId);
          await clearCart?.();
        }}
        disabled={!cartId || !paymentMethod}
      />
    </div>
  );
}
