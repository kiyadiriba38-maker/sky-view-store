import type { CollectionConfig } from "payload";

import { isAdmin } from "@/lib/collections/base-fields";
import { createStoreNotification } from "@/lib/core/notifications";

const reportReadAccess = ({ req }: { req: { user?: { id: number | string; roles?: string[] } | null } }) => {
  if (!req.user) return false;
  if (req.user.roles?.includes("admin")) return true;
  return { reporter: { equals: req.user.id } };
};

export const Reports: CollectionConfig = {
  slug: "reports",
  admin: {
    useAsTitle: "reason",
    group: "Marketplace",
    defaultColumns: ["reason", "targetType", "status", "reporter", "createdAt"],
    description: "Private customer reports for marketplace moderation and fraud review.",
  },
  access: {
    read: reportReadAccess,
    create: ({ req }) => Boolean(req.user),
    update: isAdmin,
    delete: isAdmin,
    admin: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        if (!data || !req.user) return data;
        if (operation === "create") {
          return { ...data, reporter: req.user.id, status: "pending", moderatorNotes: undefined };
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === "create") {
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
              type: "system",
              title: "Marketplace report submitted",
              message: `A customer submitted a ${String(doc.reason).replaceAll("_", " ")} report for review.`,
              href: "/admin/collections/reports",
            });
          }
        }
        return doc;
      },
    ],
  },
  fields: [
    { name: "reporter", type: "relationship", relationTo: "users", required: true, index: true, access: { update: () => false } },
    {
      name: "targetType",
      type: "select",
      required: true,
      options: [
        { label: "Product", value: "product" },
        { label: "Seller", value: "seller" },
        { label: "Review", value: "review" },
        { label: "Order", value: "order" },
      ],
      access: { update: () => false },
    },
    { name: "targetProduct", type: "relationship", relationTo: "products", access: { update: () => false } },
    { name: "targetSeller", type: "relationship", relationTo: "sellers" as never, access: { update: () => false } },
    { name: "targetReview", type: "relationship", relationTo: "reviews", access: { update: () => false } },
    { name: "targetOrder", type: "relationship", relationTo: "orders", access: { update: () => false } },
    {
      name: "reason",
      type: "select",
      required: true,
      options: [
        { label: "Misleading listing", value: "misleading_listing" },
        { label: "Counterfeit concern", value: "counterfeit_concern" },
        { label: "Unsafe content", value: "unsafe_content" },
        { label: "Seller conduct", value: "seller_conduct" },
        { label: "Review abuse", value: "review_abuse" },
        { label: "Other", value: "other" },
      ],
      access: { update: () => false },
    },
    { name: "description", type: "textarea", required: true, maxLength: 2000, access: { update: () => false } },
    {
      name: "status",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Investigating", value: "investigating" },
        { label: "Resolved", value: "resolved" },
        { label: "Dismissed", value: "dismissed" },
      ],
      access: { update: isAdmin },
    },
    { name: "moderatorNotes", type: "textarea", access: { read: isAdmin, create: isAdmin, update: isAdmin } },
  ],
};
