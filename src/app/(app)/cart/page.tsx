import type { Metadata } from "next";

import CartPageClient from "@/components/storefront/cart-page-client";
import { StorefrontShell } from "@/components/storefront/storefront-pages";

export const metadata: Metadata = { title: "Your cart | Sky View Store", description: "Review and update your shopping cart." };

export default function CartPage() {
  return <StorefrontShell eyebrow="Your selection / 10" title="Your shopping cart." description="Review products, adjust quantities and continue to the demo checkout.">
    <CartPageClient />
  </StorefrontShell>;
}
