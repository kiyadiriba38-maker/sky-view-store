import type { CollectionConfig } from "payload";

import { isAdmin } from "@/lib/collections/base-fields";

export const AuditLogs: CollectionConfig = {
  slug: "audit-logs",
  admin: {
    useAsTitle: "action",
    group: "Marketplace",
    defaultColumns: ["action", "targetCollection", "targetId", "actor", "createdAt"],
    description: "Append-only records of important marketplace administration and moderation actions.",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: () => false,
    delete: () => false,
    admin: isAdmin,
  },
  fields: [
    { name: "actor", type: "relationship", relationTo: "users", required: true, index: true, access: { update: () => false } },
    { name: "action", type: "text", required: true, index: true, access: { update: () => false } },
    { name: "targetCollection", type: "text", required: true, index: true, access: { update: () => false } },
    { name: "targetId", type: "text", required: true, index: true, access: { update: () => false } },
    { name: "summary", type: "textarea", required: true, access: { update: () => false } },
  ],
};
