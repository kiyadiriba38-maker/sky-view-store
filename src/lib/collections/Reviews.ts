import type { CollectionConfig, PayloadRequest } from "payload";

import { adminOnlyAccess } from "@/lib/collections/base-fields";
import { revalidate } from "@/lib/collections/hooks";
import { CollectionName } from "@/lib/core/types/types";

const revalidateProductFromReview = async (
  doc: { product?: number | { id?: number } | null },
  req: PayloadRequest,
) => {
  const productId =
    typeof doc.product === "object" ? doc.product?.id : doc.product;
  if (!productId) return;

  try {
    const product = await req.payload.findByID({
      collection: CollectionName.products,
      id: productId,
      depth: 0,
      select: { slug: true },
    });
    revalidate(`${CollectionName.products}-${product.slug}`);
  } catch {}
};

export const Reviews: CollectionConfig = {
  slug: "reviews",
  access: {
    ...adminOnlyAccess,
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (!data || !req.user || operation !== "create") return data;

        // Only customers with a completed, non-cancelled order containing
        // this product may submit a genuine review. Demo reviews are seeded
        // separately without a customer session and remain explicitly marked.
        const rawProduct = data.product;
        const productId = typeof rawProduct === "object" && rawProduct
          ? rawProduct.id
          : rawProduct;
        if (!productId) throw new Error("A product is required for a review.");

        const orders = await req.payload.find({
          collection: "orders",
          depth: 0,
          limit: 100,
          pagination: false,
          where: { customer: { equals: req.user.id } },
          select: { status: true, items: true, isDemoOrder: true },
        });

        const orderDocs = orders.docs as unknown as Array<{
          isDemoOrder?: boolean;
          status?: string;
          items?: Array<{
            product: number | string | { id: number | string } | null;
            isDemo?: boolean;
          }>;
        }>;
        const hasEligiblePurchase = orderDocs.some((order) => {
          if (order.isDemoOrder || order.status !== "done") return false;
          return (order.items ?? []).some((item) => {
            const raw = item.product;
            const purchasedProductId = typeof raw === "object" && raw ? raw.id : raw;
            return !item.isDemo && String(purchasedProductId ?? "") === String(productId);
          });
        });

        if (!hasEligiblePurchase) {
          throw new Error("You can review this product after placing an order for it.");
        }

        // Never accept author identity, demo status, or verification claims
        // from the browser.
        return {
          ...data,
          authorName: "Customer",
          authorEmail: req.user.email,
          isDemo: false,
          verifiedPurchase: true,
        };
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        await revalidateProductFromReview(doc, req);
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await revalidateProductFromReview(doc, req);
      },
    ],
  },
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "product", "rating", "authorName", "createdAt"],
  },
  fields: [
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      index: true,
    },
    { name: "authorName", type: "text", required: true },
    {
      name: "authorEmail",
      type: "email",
      access: {
        read: adminOnlyAccess.read,
      },
    },
    { name: "title", type: "text", required: true },
    { name: "body", type: "textarea", required: true },
    { name: "rating", type: "number", min: 1, max: 5, required: true },
    { name: "isDemo", type: "checkbox", defaultValue: false, admin: { position: "sidebar", description: "Clearly labelled sample review; never present as a genuine customer review." } },
    { name: "verifiedPurchase", type: "checkbox", defaultValue: false, admin: { position: "sidebar", readOnly: true, description: "Only set by verified order workflows." } },
  ],
};