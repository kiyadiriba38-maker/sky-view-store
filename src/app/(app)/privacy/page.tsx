import type { Metadata } from "next";

import { StorefrontShell } from "@/components/storefront/storefront-pages";

export const metadata: Metadata = { title: "Privacy | Sky View Store", description: "Privacy information for Sky View Store." };

export default function PrivacyPage() {
  return <StorefrontShell eyebrow="Your information / 09" title="Privacy matters." description="This page is a launch placeholder, not a substitute for a reviewed privacy policy.">
    <div className="max-w-3xl rounded-2xl border border-white/10 bg-[#101a28] p-7 sm:p-10"><h2 className="text-xl font-semibold">Privacy notice needs configuration</h2><p className="mt-4 text-sm leading-7 text-white/55">Before public launch, the store operator must document what customer information is collected, why it is needed, how long it is kept, which service providers process it, and how customers can request access or deletion. This demo checkout does not process real payments and should never ask customers to enter bank PINs, OTPs or payment passwords.</p></div>
  </StorefrontShell>;
}
