import DemoCartPanel from "@/components/storefront/demo-cart-panel";
import { StorefrontShell } from "@/components/storefront/storefront-pages";

export const metadata = { title: "Demo cart | Sky View Store" };

export default function DemoCartPage() {
  return <StorefrontShell eyebrow="Shopping bag / Demo" title="Your demo cart." description="Review sample listings before placing a simulated order. Demo items are separate from real marketplace inventory."><DemoCartPanel /></StorefrontShell>;
}
