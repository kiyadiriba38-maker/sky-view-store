import DemoOrdersPanel from "@/components/storefront/demo-orders-panel";
import { StorefrontShell } from "@/components/storefront/storefront-pages";

export const metadata = { title: "Demo orders | Sky View Store" };

export default function DemoOrdersPage() {
  return <StorefrontShell eyebrow="Order history / Demo" title="Your demo orders." description="Review simulated orders created through the demo checkout. These are not real purchases."><DemoOrdersPanel /></StorefrontShell>;
}
