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
  endpoints: [
    {
      path: "/me/metrics",
      method: "get",
      handler: async (req) => {
        if (!req.user) return Response.json({ message: "Sign in to view seller metrics." }, { status: 401 });

        const sellerResult = await req.payload.find({
          collection: "sellers" as never,
          where: { owner: { equals: req.user.id } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        } as never) as unknown as {
          docs: Array<{
            id: number | string;
            storeName: string;
            approvalStatus: string;
            completedOrders?: number;
            responseTimeHours?: number;
          }>;
        };
        const seller = sellerResult.docs[0];
        if (!seller) return Response.json({ message: "Seller profile not found." }, { status: 404 });

        const productResult = await req.payload.find({
          collection: "products",
          where: { seller: { equals: seller.id } },
          limit: 500,
          depth: 0,
          overrideAccess: true,
          select: { id: true, _status: true, listingStatus: true },
        } as never) as unknown as {
          docs: Array<{ id: number | string; _status?: string; listingStatus?: string }>;
        };
        const productIds = productResult.docs.map((product) => product.id);
        const reviewResult = productIds.length
          ? await req.payload.find({
              collection: "reviews",
              where: {
                and: [
                  { product: { in: productIds } },
                  { isDemo: { equals: false } },
                  { verifiedPurchase: { equals: true } },
                ],
              },
              limit: 1000,
              depth: 0,
              overrideAccess: true,
              select: { rating: true },
            } as never) as unknown as { docs: Array<{ rating?: number }> }
          : { docs: [] as Array<{ rating?: number }> };

        const verifiedReviewCount = reviewResult.docs.length;
        const averageRating = verifiedReviewCount
          ? Number((reviewResult.docs.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) / verifiedReviewCount).toFixed(2))
          : null;
        const completedOrders = Number(seller.completedOrders ?? 0);

        const approvedSellerResult = await req.payload.find({
          collection: "sellers" as never,
          where: { approvalStatus: { equals: "approved" } },
          limit: 500,
          depth: 0,
          overrideAccess: true,
          select: { id: true, completedOrders: true },
        } as never) as unknown as {
          docs: Array<{ id: number | string; completedOrders?: number }>;
        };
        const rankedSellers = approvedSellerResult.docs
          .filter((item) => Number(item.completedOrders ?? 0) > 0)
          .sort((a, b) => Number(b.completedOrders ?? 0) - Number(a.completedOrders ?? 0));
        const rankIndex = rankedSellers.findIndex((item) => String(item.id) === String(seller.id));

        const badges: string[] = [];
        if (completedOrders >= 50) badges.push("Trusted seller");
        if (averageRating !== null && averageRating >= 4.5 && verifiedReviewCount >= 10) badges.push("Top rated");
        if (completedOrders < 5) badges.push("New seller");

        return Response.json({
          seller: {
            id: seller.id,
            storeName: seller.storeName,
            approvalStatus: seller.approvalStatus,
          },
          metrics: {
            totalProducts: productResult.docs.length,
            publishedProducts: productResult.docs.filter((product) => product._status === "published" && product.listingStatus === "approved").length,
            pendingProducts: productResult.docs.filter((product) => product.listingStatus === "pending").length,
            completedOrders,
            averageRating,
            verifiedReviewCount,
            responseTimeHours: seller.responseTimeHours ?? null,
            deliveryPerformance: null,
            rank: rankIndex >= 0 ? rankIndex + 1 : null,
            approvedSellerCount: approvedSellerResult.docs.length,
            badges,
          },
        });
      },
    },
  ],
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
      access: { read: ({ req }) => Boolean(req.user), update: isDesignatedModerator },
      admin: { position: "sidebar" },
    },
    { name: "responseTimeHours", type: "number", min: 0, admin: { readOnly: true } },
    { name: "completedOrders", type: "number", min: 0, defaultValue: 0, admin: { readOnly: true } },
  ],
};
