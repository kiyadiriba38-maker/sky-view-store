import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { ProductSinglePage } from "@/lib/core/types/types";

import ArchiveBlock from "@/components/blocks/archive";
import GalleryBlock from "@/components/blocks/gallery";
import ProductDescription from "@/components/shop/product/product-description";
import ProductReviews from "@/components/shop/product/review";
import ReportListingButton from "@/components/storefront/report-listing-button";
import { resolveMediaUrl } from "@/lib/core/util";

export default async function ProductPage({ product }: { product: ProductSinglePage }) {
  const isDemo = Boolean((product as ProductSinglePage & { isDemo?: boolean }).isDemo);
  const extended = product as ProductSinglePage & { demoImageUrl?: string | null; productImageUrl?: string | null };
  const galleryImage = product.gallery?.find((item) => item.image && typeof item.image === "object")?.image;
  const heroImage = extended.productImageUrl || extended.demoImageUrl || (galleryImage && typeof galleryImage === "object" ? resolveMediaUrl(galleryImage) : null);
  const category = product.categories?.map((item) => typeof item === "object" && item ? item.title : "").filter(Boolean)[0] || "Selected collection";
  const backdropStyle = heroImage ? { "--sv-product-backdrop": `url("${heroImage}")` } as CSSProperties : undefined;

  return (
    <main className="sv-product-experience" style={backdropStyle}>
      <div className="sv-product-topbar">
        <Link href="/shop" className="sv-product-wordmark"><span>SV</span> SKY VIEW <i> / </i> STORE</Link>
        <nav aria-label="Product navigation"><Link href="/shop">DISCOVER</Link><Link href="/categories">CATEGORIES</Link><Link href="/deals">OFFERS</Link></nav>
        <Link href="/demo-cart" className="sv-product-toplink">YOUR CART ↗</Link>
      </div>
      <div className="sv-product-crumb"><Link href="/">HOME</Link><span> / </span><Link href="/shop">MARKETPLACE</Link><span> / </span><b>{category}</b></div>
      <section className="sv-product-hero">
        <div className="sv-product-gallery-panel">
          <div className="sv-product-index">01 <span> / PRODUCT VIEW</span></div>
          <div className="sv-product-gallery">
            {heroImage && !product.gallery?.some((item) => item.image && typeof item.image === "object") ? (
              <div className="sv-product-main-image">
                <Image src={heroImage} alt={product.title} fill unoptimized priority sizes="(max-width: 900px) 100vw, 58vw" className="object-contain" />
              </div>
            ) : null}
            <GalleryBlock images={product.gallery ?? []} id={`product-${product.id}`} variant="product" />
            {!heroImage ? <div className="sv-product-image-placeholder"><span>SKY VIEW</span><b>{product.title}</b></div> : null}
          </div>
          <div className="sv-product-gallery-caption"><span>CURATED PRODUCT VIEW</span><span>SCROLL TO EXPLORE ↓</span></div>
        </div>
        <aside className="sv-product-info-panel">
          <div className="sv-product-overline"><span></span>{category} <i>·</i> SKY VIEW SELECTION</div>
          <ProductDescription product={product} />
          <div className="sv-product-trust-row"><span>◇ SECURE ACCOUNT</span><span>✧ SIMULATED CHECKOUT</span><span>↗ ETHIOPIA</span></div>
        </aside>
      </section>
      <section className="sv-product-lower">
        <div><span className="sv-product-lower-kicker">MORE TO EXPLORE</span><h2>Made to stand out.</h2><p>Explore more finds selected for the Sky View marketplace.</p></div>
        {product.relatedProducts?.length ? <ArchiveBlock items={product.relatedProducts} displayMode="autoScroll" /> : <p className="sv-product-empty-related">More products are being curated for this collection.</p>}
      </section>
      <section className="sv-product-reviews"><ProductReviews reviews={product.reviews} productId={product.id} />{!isDemo ? <ReportListingButton productId={product.id} productSlug={product.slug} /> : null}</section>
    </main>
  );
}
