import type { Access, CollectionConfig } from "payload";

import { isAdmin } from "@/lib/collections/base-fields";
import { createStoreNotification } from "@/lib/core/notifications";
import { createStoreAuditLog } from "@/lib/core/audit-log";

const reportReadAccess: Access = ({ req }) => {
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
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (!data || !req.user || operation !== "create") return data;

        const targetFields = {
          product: data.targetProduct,
          seller: data.targetSeller,
          review: data.targetReview,
          order: data.targetOrder,
        } as const;
        const selectedTargets = Object.entries(targetFields).filter(([, value]) => {
          if (value == null || value === "") return false;
          if (typeof value === "object" && "id" in value) {
            return Boolean((value as { id?: unknown }).id);
          }
          return true;
        });
        const targetType = data.targetType as keyof typeof targetFields;

        if (
          !(targetType in targetFields) ||
          selectedTargets.length !== 1 ||
          selectedTargets[0]?.[0] !== targetType
        ) {
          throw new Error("Choose exactly one report target that matches its type.");
        }

        // An order report must refer to the signed-in customer's own order.
        // Product, seller, and review reports remain available to all customers.
        if (targetType === "order") {
          const rawOrder = targetFields.order;
          const orderId = typeof rawOrder === "object" && rawOrder && "id" in rawOrder
            ? (rawOrder as { id: string | number }).id
            : rawOrder;
          if (orderId == null) throw new Error("Choose a valid order to report.");

          const order = await req.payload.findByID({
            collection: "orders",
            id: orderId as string | number,
            depth: 0,
            overrideAccess: true,
            select: { customer: true },
          });
          const rawCustomer = order.customer as
            | string
            | number
            | { id?: string | number }
            | null
            | undefined;
          const customerId = typeof rawCustomer === "object" && rawCustomer
            ? rawCustomer.id
            : rawCustomer;
          if (String(customerId ?? "") !== String(req.user.id)) {
            throw new Error("You can only report an order associated with your account.");
          }
        }

        return {
          ...data,
          reporter: req.user.id,
          status: "pending",
          moderatorNotes: undefined,
          targetProduct: targetType === "product" ? data.targetProduct : null,
          targetSeller: targetType === "seller" ? data.targetSeller : null,
          targetReview: targetType === "review" ? data.targetReview : null,
          targetOrder: targetType === "order" ? data.targetOrder : null,
        };
      },
    ],
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
      async ({ doc, operation, previousDoc, req }) => {
        if (operation === "create") {
          if (req.user) {
            await createStoreAuditLog(req.payload, {
              actor: req.user.id,
              action: "moderation_report_submitted",
              targetCollection: "reports",
              targetId: doc.id,
              summary: `A marketplace report was submitted for review.`,
            });
          }
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
        } else if (operation === "update" && previousDoc?.status !== doc.status && req.user?.roles?.includes("admin")) {
          await createStoreAuditLog(req.payload, {
            actor: req.user.id,
            action: "moderation_report_status_changed",
            targetCollection: "reports",
            targetId: doc.id,
            summary: `Moderation report status changed to ${String(doc.status)}.`,
          });
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
