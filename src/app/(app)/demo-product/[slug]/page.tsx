import { notFound } from "next/navigation";

import DemoProductDetail from "@/components/storefront/demo-product-detail";
import { getDemoProduct } from "@/lib/demo/catalog";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getDemoProduct(decodeURIComponent(slug));
  return product ? { title: `${product.title} | Demo product | Sky View Store`, description: product.description } : { robots: "noindex" };
}

export default async function DemoProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getDemoProduct(decodeURIComponent(slug));
  if (!product) notFound();
  return <DemoProductDetail product={product} />;
}
