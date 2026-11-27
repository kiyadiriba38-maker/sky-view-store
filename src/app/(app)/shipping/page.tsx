import type { Metadata } from "next";

import { StorefrontShell } from "@/components/storefront/storefront-pages";

export const metadata: Metadata = { title: "Shipping information | Sky View Store", description: "Shipping information for Sky View Store." };

export default function ShippingPage() {
  return <StorefrontShell eyebrow="Delivery information / 07" title="Shipping information." description="Delivery options and timelines must be confirmed by the store operator before live orders are accepted.">
    <div className="max-w-3xl rounded-2xl border border-white/10 bg-[#101a28] p-7 sm:p-10"><h2 className="text-xl font-semibold">Shipping policy not configured</h2><p className="mt-4 text-sm leading-7 text-white/55">This storefront does not yet publish verified delivery areas, shipping prices, carriers or delivery estimates. These details should be added once the store's actual fulfilment arrangements are confirmed. External marketplace purchases follow the original seller's shipping terms.</p></div>
  </StorefrontShell>;
}
