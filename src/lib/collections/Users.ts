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
    maxLoginAttempts: 10,
    lockTime: 15 * 60 * 1000,
    useSessions: true,
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      domain: undefined,
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.roles?.includes("admin")) return true;
      return { id: { equals: user.id } };
    },
    // Public registration remains available, but signed-in non-admin users
    // cannot create accounts or assign roles through the API.
    create: ({ req }) => !req.user || isAdmin({ req }),
    delete: () => false,
    update: isAdmin,
    admin: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data;
        // Only an administrator may assign privileged roles. This also
        // protects public registration if a caller submits roles: ["admin"].
        if (!isAdmin({ req })) {
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
        { label: "seller", value: "seller" },
      ],
      admin: {
        hidden: true,
      },
    },
  ],
};
