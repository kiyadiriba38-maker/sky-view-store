import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { ProductSinglePage } from "@/lib/core/types/types";

import ArchiveBlock from "@/components/blocks/archive";
import GalleryBlock from "@/components/blocks/gallery";
import ProductDescription from "@/components/shop/product/product-description";
import ProductReviews from "@/components/shop/product/review";

export default async function ProductPage({
  product,
}: {
  product: ProductSinglePage;
}) {
  const t = await getTranslations("product");

  return (
    <div className="container pb-2 ">
      <div className="flex flex-col  rounded-lg border  border-t-0 lg:p-8    lg:flex-row    ">
        <div className="h-full w-full basis-full lg:basis-1/2">
          <div className="w-full">
            {!product.gallery?.some((item) => item.image && typeof item.image === "object") && (product as ProductSinglePage & { demoImageUrl?: string }).demoImageUrl ? (
              <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-[#101a28]">
                <Image src={(product as ProductSinglePage & { demoImageUrl?: string }).demoImageUrl!} alt={product.title} fill unoptimized sizes="(max-width: 768px) 100vw, 448px" className="object-cover" />
              </div>
            ) : null}
            <GalleryBlock
              images={product.gallery ?? []}
              id={`product-${product.id}`}
              variant="product"
            />
          </div>
        </div>
        <div className="basis-full lg:basis-1/2 p-3 lg:p-8">
          <ProductDescription product={product} />
        </div>
      </div>
      {product.relatedProducts?.length ? (
        <div className="pt-8">
          <h3 className="mb-4 text-lg font-semibold">{t("relatedProducts")}</h3>
          <ArchiveBlock
            items={product.relatedProducts}
            displayMode="autoScroll"
          />
        </div>
      ) : null}
      <ProductReviews reviews={product.reviews} productId={product.id} />
    </div>
  );
}
