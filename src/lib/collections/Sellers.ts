import type { Access, CollectionConfig, PayloadRequest, Where } from "payload";

import { isAdmin } from "@/lib/collections/base-fields";
import { createStoreNotification } from "@/lib/core/notifications";

const isDesignatedModerator = ({ req }: { req: PayloadRequest }) => {
  const moderatorEmail = process.env.LISTING_MODERATOR_EMAIL?.trim().toLowerCase();
  return Boolean(
    moderatorEmail &&
    req.user &&
    isAdmin({ req }) &&
    req.user.email?.trim().toLowerCase() === moderatorEmail,
  );
};

const readSellerProfiles: Access = ({ req }) => {
  if (isAdmin({ req })) return true;
  if (!req.user) return { approvalStatus: { equals: "approved" } } as Where;
  return { or: [{ approvalStatus: { equals: "approved" } }, { owner: { equals: req.user.id } }] } as Where;
};

const isOwnerOrAdmin: Access = ({ req }) => {
  if (!req.user) return false;
  if (req.user.roles?.includes("admin")) return true;
  return {
    owner: { equals: req.user.id },
  };
};

export const Sellers: CollectionConfig = {
  slug: "sellers",
  admin: {
    useAsTitle: "storeName",
    group: "Marketplace",
    defaultColumns: ["storeName", "approvalStatus", "country", "updatedAt"],
    description: "Seller applications and approved marketplace stores.",
  },
  access: {
    read: readSellerProfiles,
    create: ({ req }) => Boolean(req.user),
    update: isOwnerOrAdmin,
    delete: isAdmin,
    admin: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        const ownerId = typeof doc.owner === "object" && doc.owner
          ? doc.owner.id
          : doc.owner;

        if (operation === "create") {
          if (ownerId) {
            await createStoreNotification(req.payload, {
              user: ownerId,
              type: "seller_application",
              title: "Seller application received",
              message: "Your seller application is pending review by the designated store moderator.",
              href: "/seller/dashboard",
              relatedSeller: doc.id,
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
              type: "seller_application",
              title: "Seller application needs review",
              message: `${doc.storeName} submitted a seller application.`,
              href: "/admin/collections/sellers",
              relatedSeller: doc.id,
            });
          }
        } else if (ownerId && previousDoc?.approvalStatus !== doc.approvalStatus) {
          await createStoreNotification(req.payload, {
            user: ownerId,
            type: "seller_approval",
            title: "Seller application updated",
            message: `Your seller application status is now ${String(doc.approvalStatus)}.`,
            href: "/seller/dashboard",
            relatedSeller: doc.id,
          });
        }

        return doc;
      },
    ],
    beforeValidate: [
      ({ data, req, operation, originalDoc }) => {
        if (!data || !req.user) return data;

        if (isAdmin({ req })) {
          if (!isDesignatedModerator({ req })) {
            return {
              ...data,
              approvalStatus: operation === "create"
                ? "pending"
                : originalDoc?.approvalStatus ?? "pending",
            };
          }
          return data;
        }

        if (operation === "create") {
          return { ...data, owner: req.user.id, approvalStatus: "pending" };
        }

        return data;
      },
    ],
    beforeChange: [
      ({ data, req, operation, originalDoc }) => {
        if (!data || !req.user) return data;

        if (isAdmin({ req })) {
          if (!isDesignatedModerator({ req })) {
            return {
              ...data,
              approvalStatus: operation === "create"
                ? "pending"
                : originalDoc?.approvalStatus ?? "pending",
            };
          }
          return data;
        }

        if (operation === "create") {
          return { ...data, owner: req.user.id, approvalStatus: "pending" };
        }

        return {
          ...data,
          owner: originalDoc?.owner ?? req.user.id,
          approvalStatus: originalDoc?.approvalStatus ?? "pending",
        };
      },
    ],
  },
  fields: [
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
      access: { read: isAdmin },
      admin: { position: "sidebar", readOnly: true },
    },
    { name: "storeName", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "description", type: "textarea" },
    { name: "logoUrl", type: "text" },
    { name: "country", type: "text", defaultValue: "Ethiopia" },
    { name: "city", type: "text" },
    {
      name: "approvalStatus",
      type: "select",
      defaultValue: "pending",
      options: [
        { label: "Pending approval", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Suspended", value: "suspended" },
        { label: "Rejected", value: "rejected" },
      ],
      access: { read: isAdmin, update: isDesignatedModerator },
      admin: { position: "sidebar" },
    },
    { name: "responseTimeHours", type: "number", min: 0, admin: { readOnly: true } },
    { name: "completedOrders", type: "number", min: 0, defaultValue: 0, admin: { readOnly: true } },
  ],
};
