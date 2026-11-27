import type { Access, CollectionConfig, Where } from "payload";

import { isAdmin } from "@/lib/collections/base-fields";

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
    beforeValidate: [
      ({ data, req, operation }) => {
        if (!data) return data;
        if (operation === "create" && req.user && !isAdmin({ req })) {
          return {
            ...data,
            owner: req.user.id,
            approvalStatus: "pending",
          };
        }
        return data;
      },
    ],
    beforeChange: [
      ({ data, req, operation, originalDoc }) => {
        if (!data || !req.user || isAdmin({ req })) return data;
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
      admin: { position: "sidebar" },
    },
    { name: "responseTimeHours", type: "number", min: 0, admin: { readOnly: true } },
    { name: "completedOrders", type: "number", min: 0, defaultValue: 0, admin: { readOnly: true } },
  ],
};
