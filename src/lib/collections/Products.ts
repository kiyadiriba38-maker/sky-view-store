import type { Product } from "@/lib/core/types/payload-types";
import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type { Field } from "payload";

import {
  DESCRIPTION_FIELD,
  FAQS_FIELD,
  adminOnlyAccess,
  makeAdminPreview,
  metaTab,
  mixedSlugField,
  patchPricesGroupField,
  populateSlugOnCreate,
} from "@/lib/collections/base-fields";
import { makeRevalidateHooks, normalizeFaqs } from "@/lib/collections/hooks";
import { CollectionName, RoutePath } from "@/lib/core/types/types";

const getFieldName = (field: Field) =>
  "name" in field && typeof field.name === "string" ? field.name : undefined;

const isSidebarField = (field: Field) =>
  field.admin && "position" in field.admin
    ? field.admin.position === "sidebar"
    : false;

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
      name: "isDemo",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Sample listing. Demo orders and reviews must remain clearly labelled." },
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
      admin: { position: "sidebar" },
    },
    {
      name: "seller",
      type: "relationship",
      relationTo: "sellers",
      admin: { position: "sidebar" },
    },
    {
      name: "listingType",
      type: "select",
      required: true,
      defaultValue: "own_store",
      options: [
        { label: "Sky View Store product", value: "own_store" },
        { label: "External marketplace listing", value: "external" },
      ],
      admin: {
        position: "sidebar",
        description: "Choose whether customers order from Sky View Store or visit an external seller.",
      },
    },
    {
      name: "externalMarketplace",
      type: "select",
      options: [
        { label: "Jiji Ethiopia", value: "jiji" },
        { label: "Amazon", value: "amazon" },
        { label: "eBay", value: "ebay" },
        { label: "Other seller", value: "other" },
      ],
      admin: {
        position: "sidebar",
        condition: (_, siblingData) => siblingData?.listingType === "external",
        description: "Marketplace hosting the original listing.",
      },
    },
    {
      name: "externalUrl",
      type: "text",
      validate: (value) => {
        if (!value) return true;
        try {
          const url = new URL(String(value));
          return url.protocol === "https:" || url.protocol === "http:"
            ? true
            : "Use a valid http or https seller URL.";
        } catch {
          return "Enter a valid seller URL beginning with https://.";
        }
      },
      admin: {
        position: "sidebar",
        condition: (_, siblingData) => siblingData?.listingType === "external",
        description: "Full URL to the original seller's product page. Customers will be sent there to buy.",
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
      ...adminOnlyAccess,
      read: () => true,
    },
    admin: {
      ...defaultCollection?.admin,
      defaultColumns: [
        "title",
        "isDemo",
        "listingStatus",
        "seller",
        "enableVariants",
        "_status",
        "variants.variants",
      ],
      ...makeAdminPreview(RoutePath.product),
      useAsTitle: "title",
    },
    hooks: {
      ...makeRevalidateHooks(CollectionName.products),
      beforeChange: [populateSlugOnCreate],
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
