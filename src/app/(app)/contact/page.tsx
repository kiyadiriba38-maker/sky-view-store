import type { Metadata } from "next";

import { StorefrontShell } from "@/components/storefront/storefront-pages";

export const metadata: Metadata = { title: "Contact | Sky View Store", description: "Contact and support information for Sky View Store." };

export default function ContactPage() {
  return <StorefrontShell eyebrow="We're here to help / 05" title="Contact Sky View Store." description="For a real store launch, the operator must configure and publish verified support contact details before customers place live orders.">
    <div className="max-w-3xl rounded-2xl border border-white/10 bg-[#101a28] p-7 sm:p-10">
      <p className="text-sm leading-7 text-white/60">Customer support channels are not configured on this deployment yet. We are not displaying a made-up email address or phone number. The store administrator should add a monitored support email and phone number in the site settings before launch.</p>
      <div className="mt-7 rounded-xl border border-cyan-200/20 bg-cyan-200/[.05] p-5"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-cyan-200">Store status</p><p className="mt-2 text-sm text-white/70">Demo storefront — support contact details pending configuration.</p></div>
    </div>
  </StorefrontShell>;
}
