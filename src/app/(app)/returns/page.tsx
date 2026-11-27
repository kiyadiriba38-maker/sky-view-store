import type { Metadata } from "next";

import { StorefrontShell } from "@/components/storefront/storefront-pages";

export const metadata: Metadata = { title: "Returns | Sky View Store", description: "Returns information for Sky View Store." };

export default function ReturnsPage() {
  return <StorefrontShell eyebrow="After your order / 08" title="Returns and refunds." description="A clear returns policy is important before a store accepts real orders.">
    <div className="max-w-3xl rounded-2xl border border-white/10 bg-[#101a28] p-7 sm:p-10"><h2 className="text-xl font-semibold">Returns policy pending</h2><p className="mt-4 text-sm leading-7 text-white/55">The store operator must publish the return window, eligible item conditions, return address, refund process and customer support contact before launch. Purchases from external sellers are governed by those sellers' own policies. Checkout on this website remains demo-only.</p></div>
  </StorefrontShell>;
}
