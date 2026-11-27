import type { Product } from "@/lib/core/types/payload-types";
import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type { Access, CollectionBeforeChangeHook, Field, PayloadRequest, Where } from "payload";

import {
  DESCRIPTION_FIELD,
  FAQS_FIELD,
  adminOnlyAccess,
  makeAdminPreview,
  metaTab,
  mixedSlugField,
  patchPricesGroupField,
  populateSlugOnCreate,
  isAdmin,
} from "@/lib/collections/base-fields";
import { makeRevalidateHooks, normalizeFaqs } from "@/lib/collections/hooks";
import { createStoreNotification } from "@/lib/core/notifications";
import { createStoreAuditLog } from "@/lib/core/audit-log";
import { CollectionName, RoutePath } from "@/lib/core/types/types";

const getFieldName = (field: Field) =>
  "name" in field && typeof field.name === "string" ? field.name : undefined;

const isSidebarField = (field: Field) =>
  field.admin && "position" in field.admin
    ? field.admin.position === "sidebar"
    : false;

const isListingModerator = ({ req }: { req: PayloadRequest }) => {
  const moderatorEmail = process.env.LISTING_MODERATOR_EMAIL?.trim().toLowerCase();
  return Boolean(
    moderatorEmail &&
    req.user &&
    isAdmin({ req }) &&
    req.user.email?.trim().toLowerCase() === moderatorEmail,
  );
};

const publicProductListings: Where = { and: [{ _status: { equals: "published" } }, { listingStatus: { equals: "approved" } }, { or: [{ isDemo: { equals: true } }, { listingPolicyReviewed: { equals: true } }] }] };

const readMarketplaceProducts: Access = async ({ req }) => {
  if (req.user?.roles?.includes("admin")) return true;
  if (!req.user) return publicProductListings;
  const sellers = await req.payload.find({
    collection: "sellers" as never,
    depth: 0,
    limit: 100,
    where: { owner: { equals: req.user.id } },
  });
  const ids = (sellers.docs as Array<{ id: number }>).map((seller) => seller.id);
  return ids.length ? ({ or: [publicProductListings, { seller: { in: ids } }] } as Where) : publicProductListings;
};

const canCreateSellerProduct: Access = async ({ req }) => {
  if (req.user?.roles?.includes("admin")) return true;
  if (!req.user) return false;
  const sellers = await req.payload.find({
    collection: "sellers" as never,
    depth: 0,
    limit: 1,
    where: { and: [{ owner: { equals: req.user.id } }, { approvalStatus: { equals: "approved" } }] },
  });
  return sellers.docs.length > 0;
};

const canManageSellerProducts: Access = async ({ req }) => {
  if (req.user?.roles?.includes("admin")) return true;
  if (!req.user) return false;
  const sellers = await req.payload.find({
    collection: "sellers" as never,
    depth: 0,
    limit: 100,
    where: { and: [{ owner: { equals: req.user.id } }, { approvalStatus: { equals: "approved" } }] },
  });
  const ids = (sellers.docs as Array<{ id: number }>).map((seller) => seller.id);
  return ids.length ? { seller: { in: ids } } : false;
};

const enforceSellerListing: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (!data || !req.user || req.user.roles?.includes("admin")) return data;
  const sellers = await req.payload.find({
    collection: "sellers" as never,
    depth: 0,
    limit: 1,
    where: { and: [{ owner: { equals: req.user.id } }, { approvalStatus: { equals: "approved" } }] },
  });
  const seller = (sellers.docs as Array<{ id: number }>)[0];
  if (!seller) throw new Error("An approved seller account is required to manage products.");
  if (operation === "create") {
    return { ...data, seller: seller.id, listingType: "marketplace_seller", isDemo: false, listingStatus: "pending", _status: "draft" };
  }
  return { ...data, seller: seller.id, listingType: "marketplace_seller", isDemo: false, listingStatus: "pending", _status: "draft" };
};

const requirePolicyReviewForPublication: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data;

  const listingStatus = data.listingStatus ?? originalDoc?.listingStatus;
  const documentStatus = data._status ?? originalDoc?._status;
  const isDemo = data.isDemo ?? originalDoc?.isDemo;
  const policyReviewed = data.listingPolicyReviewed ?? originalDoc?.listingPolicyReviewed;

  if (!isDemo && listingStatus === "approved" && documentStatus === "published") {
    if (!isListingModerator({ req }) || policyReviewed !== true) {
      throw new Error("A designated store moderator must complete the policy review before publishing this listing.");
    }
  }

  return data;
};

const enhanceVariantField = (field: Field): Field => {
  const name = getFieldName(field);

  if (name === "enableVariants") {
    return {
      ...field,
      label: "Enable product variants",
      admin: {
        ...field.admin,
        description:
          "Use combinations such as Color + Size. Every combination can have its own inventory and an optional custom price.",
      },
    } as Field;
  }

  if (name === "variantTypes") {
    return {
      ...field,
      admin: {
        ...field.admin,
        description:
          "Choose types in storefront order. Put primary choices such as Color before dependent choices such as Size.",
      },
    } as Field;
  }

  if (name === "variants") {
    return {
      ...field,
      admin: {
        ...field.admin,
        description:
          "Add the combinations you actually sell. Missing combinations are hidden; sold-out combinations stay visible so shoppers can select them and see the sold-out state.",
      },
    } as Field;
  }

  return field;
};

export const Products: CollectionOverride = ({ defaultCollection }) => {
  const revalidateHooks = makeRevalidateHooks(CollectionName.products);
  const pluginFields = ((defaultCollection.fields || []) as Field[])
    .filter((field) => getFieldName(field) !== "layout")
    .map((field) => {
      const group = field as Field & { admin?: { description?: string } };

      if (
        group.type === "group" &&
        group.admin?.description ===
          "Prices for this product in different currencies."
      ) {
        return patchPricesGroupField(group);
      }

      return enhanceVariantField(field);
    });

  const allFields: Field[] = [
    { name: "title", type: "text", required: true, localized: true },
    {
      name: "categories",
      type: "relationship",
      admin: { position: "sidebar", sortOptions: "title" },
      hasMany: true,
      relationTo: CollectionName.category,
    },
    mixedSlugField(),
    ...pluginFields,
    {
      name: "originalPriceInUSD",
      type: "number",
      min: 0,
      label: "Original price (ETB)",
      admin: {
        description:
          "Original price in Ethiopian birr (ETB), before discount. Shown as a strikethrough price when set.",
      },
    },
    {
      name: "productImageUrl",
      type: "text",
      validate: (value: unknown) => {
        if (!value) return true;
        try { return new URL(String(value)).protocol === "https:" ? true : "Use an HTTPS image URL."; }
        catch { return "Enter a valid HTTPS image URL."; }
      },
      admin: { position: "sidebar", description: "Seller-supplied product image URL. Only use images you are authorized to publish." },
    },
    {
      name: "demoImageUrl",
      type: "text",
      admin: { position: "sidebar", description: "Image URL used for clearly labelled demo listings only." },
    },
    {
      name: "isDemo",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Sample listing. Demo orders and reviews must remain clearly labelled." },
    },
    {
      name: "listingPolicyReviewed",
      type: "checkbox",
      defaultValue: false,
      access: {
        read: ({ req }) => isAdmin({ req }),
        create: ({ req }) => isListingModerator({ req }),
        update: ({ req }) => isListingModerator({ req }),
      },
      admin: {
        position: "sidebar",
        description: "Complete the store's product and seller policy review before approving and publishing this listing.",
      },
    },
    {
      name: "listingStatus",
      type: "select",
      defaultValue: "approved",
      options: [
        { label: "Pending review", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
        { label: "Suspended", value: "suspended" },
      ],
      access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => isListingModerator({ req }) },
      admin: { position: "sidebar" },
    },
    {
      name: "seller",
      type: "relationship",
      relationTo: "sellers",
      admin: { position: "sidebar" },
    } as unknown as Field,
    {
      name: "listingType",
      type: "select",
      required: true,
      defaultValue: "own_store",
      options: [
        { label: "Sky View Store product", value: "own_store" },
        { label: "Approved marketplace seller", value: "marketplace_seller" },
      ],
      admin: {
        position: "sidebar",
        description: "Choose whether customers order from Sky View Store or visit an external seller.",
      },
    },
    DESCRIPTION_FIELD,
    {
      name: "gallery",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "gallery-media",
          required: true,
        },
      ],
    },
    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      filterOptions: ({ id }) => ({
        id: id ? { not_in: [id] } : { exists: true },
      }),
    },
    FAQS_FIELD,
    {
      name: "reviews",
      type: "join",
      collection: "reviews",
      on: "product",
    },
  ];

  const variantNames = new Set(["enableVariants", "variantTypes", "variants"]);
  const sidebarFields = allFields.filter(isSidebarField);
  const variantFields = allFields.filter((field) =>
    variantNames.has(getFieldName(field) ?? ""),
  );
  const detailsFields = allFields.filter(
    (field) => !sidebarFields.includes(field) && !variantFields.includes(field),
  );

  return {
    ...defaultCollection,
    access: {
      read: readMarketplaceProducts,
      create: canCreateSellerProduct,
      update: canManageSellerProducts,
      delete: adminOnlyAccess.delete,
      admin: adminOnlyAccess.admin,
    },
    admin: {
      ...defaultCollection?.admin,
      defaultColumns: [
        "title",
        "isDemo",
        "listingStatus",
        "listingPolicyReviewed",
        "seller",
        "enableVariants",
        "_status",
        "variants.variants",
      ],
      ...makeAdminPreview(RoutePath.product),
      useAsTitle: "title",
    },
    hooks: {
      ...revalidateHooks,
      afterChange: [
        ...revalidateHooks.afterChange,
        async ({ doc, operation, previousDoc, req }) => {
          const sellerId = typeof doc.seller === "object" && doc.seller
            ? doc.seller.id
            : doc.seller;
          const statusChanged = operation === "create" ||
            previousDoc?.listingStatus !== doc.listingStatus ||
            previousDoc?._status !== doc._status;

          if (sellerId && statusChanged) {
            if (req.user && operation === "create") {
              await createStoreAuditLog(req.payload, {
                actor: req.user.id,
                action: "product_listing_submitted",
                targetCollection: "products",
                targetId: doc.id,
                summary: `Product listing "${doc.title}" submitted for moderation.`,
              });
            } else if (req.user && isAdmin({ req })) {
              await createStoreAuditLog(req.payload, {
                actor: req.user.id,
                action: "product_listing_reviewed",
                targetCollection: "products",
                targetId: doc.id,
                summary: `Product listing "${doc.title}" changed to ${String(doc.listingStatus ?? "pending")} / ${String(doc._status ?? "draft")}.`,
              });
            }
            const listingStatus = doc.listingStatus ?? "pending";
            const statusLabel = listingStatus === "approved" && doc._status === "published"
              ? "approved and published"
              : listingStatus === "pending"
                ? "pending review"
                : String(listingStatus);
            await createStoreNotification(req.payload, {
              user: sellerId,
              type: "listing_review",
              title: "Product listing updated",
              message: `Your listing "${doc.title}" is ${statusLabel}.`,
              href: "/seller/dashboard",
              relatedProduct: doc.id,
            });
          }

          if (operation === "create" && doc.listingStatus === "pending") {
            const admins = await req.payload.find({
              collection: "users",
              where: { roles: { contains: "admin" } },
              limit: 50,
              depth: 0,
              overrideAccess: true,
            });
            for (const admin of admins.docs) {
              await createStoreNotification(req.payload, {
                user: admin.id,
                type: "listing_review",
                title: "Product listing needs review",
                message: `A seller submitted "${doc.title}" for review.`,
                href: "/admin/collections/products",
                relatedProduct: doc.id,
              });
            }
          }

          return doc;
        },
      ],
      beforeChange: [populateSlugOnCreate, enforceSellerListing, requirePolicyReviewForPublication],
      beforeValidate: [
        ({ data }) => {
          if (!data) return data;

          const gallery = data.gallery as Product["gallery"] | undefined;
          if (gallery) {
            const filtered = gallery.filter(
              (item): item is NonNullable<Product["gallery"]>[number] =>
                Boolean(item) && item.image !== null,
            );

            data.gallery = filtered.length ? filtered : [{ image: null }];
          }

          return normalizeFaqs(data);
        },
      ],
    },
    fields: [
      ...sidebarFields,
      {
        type: "tabs",
        tabs: [
          {
            label: "Product details",
            fields: detailsFields,
          },
          {
            label: "Variants",
            fields: variantFields,
          },
          metaTab(),
        ],
      },
    ],
  };
};
