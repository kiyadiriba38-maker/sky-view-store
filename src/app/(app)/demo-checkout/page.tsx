import DemoCheckoutPanel from "@/components/storefront/demo-checkout-panel";
import { StorefrontShell } from "@/components/storefront/storefront-pages";

export const metadata = { title: "Demo checkout | Sky View Store" };

export default function DemoCheckoutPage() {
  return <StorefrontShell eyebrow="Secure flow / Demo only" title="Demo checkout." description="Complete the sample shopping journey. No payment will be collected and no real shipment will be created."><DemoCheckoutPanel /></StorefrontShell>;
}
