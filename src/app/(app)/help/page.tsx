import type { Metadata } from "next";

import { StorefrontShell } from "@/components/storefront/storefront-pages";

export const metadata: Metadata = { title: "Help centre | Sky View Store", description: "Find help using Sky View Store." };

const topics = [
  ["Finding products", "Use Shop to browse published products, or Categories to explore the catalogue by collection."],
  ["External listings", "An external listing belongs to an independent seller. Use its seller link to view the original listing and seller terms."],
  ["Checkout", "Checkout is currently a demonstration flow. No real payment is collected or processed."],
  ["Product feedback", "Only genuine customer feedback should be presented as a customer review. Sample content must be labelled as a demo."],
  ["Accounts", "Customer sign-in and Google sign-in are not available until the account system has been safely configured."],
];

export default function HelpPage() {
  return <StorefrontShell eyebrow="Support / 06" title="How can we help?" description="Quick guidance for using the current Sky View Store experience.">
    <div className="grid max-w-4xl gap-3">{topics.map(([title, body], index) => <details key={title} className="group rounded-2xl border border-white/10 bg-[#101a28] p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">{title}<span className="text-cyan-200 transition group-open:rotate-45">＋</span></summary><p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">{body}</p></details>)}</div>
  </StorefrontShell>;
}
