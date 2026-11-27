import type { ProductSinglePage } from "@/lib/core/types/types";

import { Price } from "@/components/shared/elements-ssr";
import { ProductPurchaseSection } from "@/components/shared/wrappers";
import { Faq, RichText } from "@/components/ui";
import { isRtl } from "@/lib/core/util";

export default function ProductDescription({
  product,
}: {
  product: ProductSinglePage;
}) {
  const isLongTitle = (product.title || "").length > 30;
  const rtl = isRtl(product.title);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b pb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <h1
            dir={rtl ? "rtl" : "ltr"}
            className={[
              "font-bold leading-tight break-words",
              isLongTitle ? "text-3xl" : "text-4xl",
              rtl ? "text-right" : "text-left",
            ].join(" ")}
          >
            {product.title}
          </h1>

          <div className="flex lg:justify-end">
            <div className="rounded-full bg-[#9F1239] px-4 py-1 text-2xl font-bold text-white whitespace-nowrap">
              {product.purchase_section.variants.length > 0 ? (
                <Price
                  highestAmount={product.purchase_section.priceRange.max}
                  lowestAmount={product.purchase_section.priceRange.min}
                />
              ) : (
                <Price amount={product.purchase_section.price} />
              )}
            </div>
          </div>
        </div>
      </div>

      {product.listingType === "external" ? (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5">
          <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
            External marketplace listing
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This item is listed by an independent seller. Sky View Store does not stock or sell it, and checkout takes place on the seller&apos;s website.
          </p>
          {product.externalUrl && /^https?:\/\//i.test(product.externalUrl) ? (
            <a
              href={product.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-400"
            >
              Visit original seller ↗
            </a>
          ) : (
            <p className="mt-3 text-sm font-medium text-amber-600">
              Seller link not added yet. This listing cannot be purchased here.
            </p>
          )}
        </div>
      ) : (
        <div
          className={
            product.purchase_section.variants.length
              ? "min-h-[12rem]"
              : "min-h-[3rem]"
          }
        >
          <ProductPurchaseSection product={product.purchase_section} />
        </div>
      )}

      <div className="border-t pt-1 text-[1.125rem] leading-relaxed">
        <RichText
          data={product.description}
          enableGutter={false}
          enableProse={false}
        />
      </div>

      <Faq faqs={product.faqs} title={product.title} />
    </div>
  );
}
