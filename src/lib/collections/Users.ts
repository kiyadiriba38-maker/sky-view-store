import type { CollectionConfig } from "payload";

import { isAdmin } from "@/lib/collections/base-fields";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    group: "Other",
    defaultColumns: ["email"],
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      domain: undefined,
    },
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    // Public registration is safe because the hook below always assigns
    // the customer role to unauthenticated sign-ups.
    create: () => true,
    delete: () => false,
    update: isAdmin,
    admin: isAdmin,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data;
        if (!req.user) {
          return { ...data, roles: ["customer"] };
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "roles",
      type: "select",
      hasMany: true,
      defaultValue: ["customer"],
      options: [
        { label: "admin", value: "admin" },
        { label: "customer", value: "customer" },
      ],
      admin: {
        hidden: true,
      },
    },
  ],
};