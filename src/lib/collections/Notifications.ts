import type { CollectionConfig } from "payload";

import { isAdmin } from "@/lib/collections/base-fields";

const ownerAccess = ({ req }: { req: { user?: { id: number | string; roles?: string[] } | null } }) => {
  if (!req.user) return false;
  if (req.user.roles?.includes("admin")) return true;
  return { user: { equals: req.user.id } };
};

export const Notifications: CollectionConfig = {
  slug: "notifications",
  admin: {
    useAsTitle: "title",
    group: "Marketplace",
    defaultColumns: ["title", "type", "user", "read", "createdAt"],
    description: "Private in-site customer and seller notifications.",
  },
  access: {
    read: ownerAccess,
    create: isAdmin,
    update: ownerAccess,
    delete: isAdmin,
    admin: isAdmin,
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
      access: { create: isAdmin, update: () => false },
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Order update", value: "order_update" },
        { label: "Return update", value: "return_update" },
        { label: "Seller application", value: "seller_application" },
        { label: "Seller approval", value: "seller_approval" },
        { label: "Listing review", value: "listing_review" },
        { label: "System", value: "system" },
      ],
      access: { create: isAdmin, update: () => false },
    },
    { name: "title", type: "text", required: true, access: { create: isAdmin, update: () => false } },
    { name: "message", type: "textarea", access: { create: isAdmin, update: () => false } },
    {
      name: "href",
      type: "text",
      validate: (value: unknown) => {
        if (value == null || value === "") return true;
        if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\\\")) {
          return "Notification links must be relative paths inside the store.";
        }
        return true;
      },
      access: { create: isAdmin, update: () => false },
    },
    { name: "read", type: "checkbox", defaultValue: false, index: true, access: { create: isAdmin, update: ({ req }) => Boolean(req.user) } },
    { name: "relatedOrder", type: "relationship", relationTo: "orders", access: { create: isAdmin, update: () => false } },
    { name: "relatedSeller", type: "relationship", relationTo: "sellers", access: { create: isAdmin, update: () => false } },
    { name: "relatedProduct", type: "relationship", relationTo: "products", access: { create: isAdmin, update: () => false } },
  ],
  endpoints: [
    {
      path: "/mine",
      method: "get",
      handler: async (req) => {
        if (!req.user) return Response.json({ message: "Sign in to view notifications." }, { status: 401 });
        const result = await req.payload.find({
          collection: "notifications",
          where: { user: { equals: req.user.id } },
          sort: "-createdAt",
          limit: 50,
          depth: 0,
          overrideAccess: true,
        });
        return Response.json({ docs: result.docs, totalDocs: result.totalDocs });
      },
    },
    {
      path: "/:id/read",
      method: "post",
      handler: async (req) => {
        if (!req.user) return Response.json({ message: "Sign in to update notifications." }, { status: 401 });
        const id = req.routeParams?.id;
        if (!id) return Response.json({ message: "Notification ID is required." }, { status: 400 });
        const notification = await req.payload.findByID({
          collection: "notifications",
          id: String(id),
          depth: 0,
          overrideAccess: true,
        });
        const owner = typeof notification.user === "object" && notification.user
          ? notification.user.id
          : notification.user;
        if (String(owner ?? "") !== String(req.user.id)) {
          return Response.json({ message: "You can only update your own notifications." }, { status: 403 });
        }
        const updated = await req.payload.update({
          collection: "notifications",
          id: String(id),
          data: { read: true },
          overrideAccess: true,
          req,
        });
        return Response.json({ notification: updated });
      },
    },
    {
      path: "/read-all",
      method: "post",
      handler: async (req) => {
        if (!req.user) return Response.json({ message: "Sign in to update notifications." }, { status: 401 });
        const result = await req.payload.find({
          collection: "notifications",
          where: { and: [{ user: { equals: req.user.id } }, { read: { equals: false } }] },
          limit: 100,
          depth: 0,
          overrideAccess: true,
        });
        for (const item of result.docs) {
          await req.payload.update({
            collection: "notifications",
            id: item.id,
            data: { read: true },
            overrideAccess: true,
            req,
          });
        }
        return Response.json({ updated: result.docs.length });
      },
    },
  ],
};
