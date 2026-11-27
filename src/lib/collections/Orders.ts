import { addDataAndFileToRequest } from "payload";
import { sql } from "@payloadcms/db-postgres";

import type { Product, Variant } from "@/lib/core/types/payload-types";
import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type {
  CollectionAfterChangeHook,
  CollectionBeforeValidateHook,
  PayloadRequest,
} from "payload";

import {
  adminOnlyAccess,
  isAdmin,
  stripAdminFieldComponent,
} from "@/lib/collections/base-fields";
import { revalidate } from "@/lib/collections/hooks";
import appConfig from "@/lib/core/config";
import { getOrderDashboard } from "@/lib/core/dal/order-dashboard";
import { OrderNotifier } from "@/lib/core/OrderNotifier";
import {
  type CartItem,
  type OrderItem,
  CollectionName,
  OrderStatus,
} from "@/lib/core/types/types";
import { isValidOrderStatusTransition } from "@/lib/core/util";
import { stripeConfig } from "@/lib/stripe/config";
import {
  stripePaymentIntentField,
  verifyStripePaymentIntent,
} from "@/lib/stripe/server";

type InventoryCollection = typeof CollectionName.products | "variants";

const changeInventoryAtomically = async ({
  req,
  collection,
  id,
  quantity,
  direction,
}: {
  req: PayloadRequest;
  collection: InventoryCollection;
  id: number | string;
  quantity: number;
  direction: "reserve" | "restore";
}) => {
  const adapter = req.payload.db as unknown as {
    execute: (args: { db?: unknown; sql: unknown }) => Promise<{ rows?: Array<{ id: number | string }> }>;
    sessions?: Record<string, { db: unknown }>;
  };
  const transactionID = await req.transactionID;
  const transaction = transactionID
    ? adapter.sessions?.[String(transactionID)]?.db
    : undefined;
  const tableName = collection === "variants" ? '"variants"' : '"products"';
  const statement = direction === "reserve"
    ? sql`UPDATE ${sql.raw(tableName)}
        SET "inventory" = "inventory" - ${quantity}
        WHERE "id" = ${id} AND "inventory" >= ${quantity}
        RETURNING "id"`
    : sql`UPDATE ${sql.raw(tableName)}
        SET "inventory" = "inventory" + ${quantity}
        WHERE "id" = ${id}
        RETURNING "id"`;

  const result = await adapter.execute({ db: transaction, sql: statement });
  if (!result.rows?.length) {
    throw new Error(
      direction === "reserve"
        ? "Stock changed while checkout was being completed. Please refresh your cart and try again."
        : "Could not restore inventory for the cancelled order.",
    );
  }
};

export const Orders: CollectionOverride = ({ defaultCollection }) => {
  return {
    ...defaultCollection,

    admin: {
      ...(defaultCollection.admin || {}),
      useAsTitle: "name",
      defaultColumns: ["name", "phone", "email", "createdAt"],
    },

    access: {
      ...adminOnlyAccess,
      read: ({ req }) => {
        if (isAdmin({ req })) return true;
        if (!req.user) return false;
        return { customer: { equals: req.user.id } };
      },
      // Checkout is account-only; never allow anonymous order creation.
      create: ({ req }) => Boolean(req.user),
    },

    fields: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((defaultCollection.fields || []) as any[])
        .filter(
          (f) =>
            f?.type !== "tabs" &&
            (!f?.name || !["customerEmail", "transactions"].includes(f.name)),
        )
        .map((f) => {
          if (f?.name === "customer")
            return {
              ...f,
              required: false,
              admin: {
                ...(f.admin || {}),
                position: "sidebar",
                hidden: true,
                condition: () => false,
                readOnly: true,
                disabled: true,
              },
            };

          if (f?.name === "status")
            return {
              ...f,
              defaultValue: OrderStatus.NEW,
              options: Object.values(OrderStatus),
              admin: {
                ...(f.admin || {}),
                position: "sidebar",
                hidden: true,
                readOnly: true,
                disabled: true,
              },
            };

          if (f.type !== "row" || !Array.isArray(f.fields)) return f;

          const amountField = f.fields[0];
          const fixedAmount = {
            ...amountField,
            admin: stripAdminFieldComponent(amountField.admin),
          };

          return { ...f, fields: [fixedAmount] };
        }),

      { name: "name", type: "text", required: true },
      { name: "phone", type: "text", required: true },
      { name: "email", type: "email", required: true },
      {
        name: "cart",
        type: "relationship",
        relationTo: "carts",
        admin: { position: "sidebar", readOnly: true },
      },
      {
        name: "isDemoOrder",
        type: "checkbox",
        defaultValue: true,
        admin: { position: "sidebar", readOnly: true, description: "All orders remain simulated until real payments are approved and activated." },
      },
      {
        name: "demoPaymentMethod",
        type: "text",
        required: false,
        defaultValue: "telebirr",
        admin: {
          position: "sidebar",
          readOnly: true,
          description: "Demo selection only. No payment was processed.",
        },
      },
      {
        name: "returnRequestStatus",
        type: "select",
        defaultValue: "none",
        options: [
          { label: "No request", value: "none" },
          { label: "Requested", value: "requested" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Completed", value: "completed" },
        ],
        admin: { position: "sidebar", description: "Customer return request review status." },
      },
      {
        name: "returnReason",
        type: "textarea",
        admin: { position: "sidebar", readOnly: true },
      },
      {
        name: "returnRequestedAt",
        type: "date",
        admin: { position: "sidebar", readOnly: true },
      },
      // Stripe integration touch point 1/2 — see @/lib/stripe/server
      stripePaymentIntentField,
      {
        name: "OrderView",
        type: "ui",
        admin: {
          position: "sidebar",
          components: {
            Field: "@/components/admin/order-view#OrderView",
          },
        },
      },

      {
        name: "items",
        type: "array",
        required: true,
        fields: [
          {
            name: "product",
            type: "relationship",
            relationTo: CollectionName.products,
            required: true,
          },
          {
            name: "variant",
            type: "relationship",
            relationTo: "variants",
          },

          { name: "title", type: "text", required: true },
          { name: "quantity", type: "number", required: true },
          { name: "unitPrice", type: "number", required: true },
          { name: "lineTotal", type: "number", required: true },
          { name: "isDemo", type: "checkbox", defaultValue: false, admin: { readOnly: true } },
        ],
      },
    ],

    endpoints: [
      ...(defaultCollection.endpoints || []),
      {
        path: "/dashboard",
        method: "get",
        handler: getOrderDashboard,
      },
      {
        path: "/:id/return-request",
        method: "post",
        handler: async (req) => {
          if (!req.user) {
            return Response.json({ message: "Sign in to request a return." }, { status: 401 });
          }

          await addDataAndFileToRequest(req);
          const id = req.routeParams?.id;
          const reason = typeof req.data?.reason === "string" ? req.data.reason.trim() : "";
          if (!id || reason.length < 10 || reason.length > 1000) {
            return Response.json({ message: "Please provide a return reason between 10 and 1,000 characters." }, { status: 400 });
          }

          const order = await req.payload.findByID({
            collection: "orders",
            id: String(id),
            depth: 0,
            req,
          });
          const customer = typeof order.customer === "object" && order.customer
            ? order.customer.id
            : order.customer;
          if (String(customer ?? "") !== String(req.user.id)) {
            return Response.json({ message: "You can only request a return for your own order." }, { status: 403 });
          }
          if (order.status !== OrderStatus.DONE) {
            return Response.json({ message: "Return requests are available after an order is marked delivered." }, { status: 400 });
          }

          const returnStatus = (order as typeof order & { returnRequestStatus?: string }).returnRequestStatus ?? "none";
          if (returnStatus !== "none") {
            return Response.json({ message: "A return request has already been submitted for this order." }, { status: 409 });
          }

          const updated = await req.payload.update({
            collection: "orders",
            id: String(id),
            data: {
              returnRequestStatus: "requested",
              returnReason: reason,
              returnRequestedAt: new Date().toISOString(),
            } as never,
            overrideAccess: true,
            req,
            context: { skipOrderNotification: true },
          });

          const isDemo = Boolean((order as typeof order & { isDemoOrder?: boolean }).isDemoOrder);
          return Response.json({
            message: isDemo
              ? "Demo return request recorded. This only simulates the review process; no real refund or payment is involved."
              : "Your return request has been submitted for review.",
            order: updated,
          });
        },
      },
      {
        path: "/:id/status",
        method: "post",
        handler: async (req) => {
          if (!isAdmin({ req })) {
            return Response.json({ message: "Forbidden" }, { status: 403 });
          }

          await addDataAndFileToRequest(req);
          const id = req.routeParams?.id;
          const nextStatus = req.data?.status;
          if (!id || typeof nextStatus !== "string") {
            return Response.json(
              { message: "status is required" },
              { status: 400 },
            );
          }

          const order = await req.payload.findByID({
            collection: "orders",
            id: String(id),
          });

          if (
            !isValidOrderStatusTransition(
              order.status as unknown as OrderStatus,
              nextStatus,
            )
          ) {
            return Response.json(
              { message: "Invalid status transition" },
              { status: 400 },
            );
          }

          const updated = await req.payload.update({
            collection: "orders",
            id: String(id),
            data: { status: nextStatus },
            req,
          });

          return Response.json(updated);
        },
      },
    ],

    hooks: {
      ...(defaultCollection.hooks || {}),

      afterChange: [
        ...((defaultCollection.hooks?.afterChange ||
          []) as CollectionAfterChangeHook[]),

        async (args) => {
          const { operation, doc, req, previousDoc } = args;

          // Restore stock once when an order is cancelled. The status
          // transition rules below prevent reopening a cancelled order,
          // which would otherwise make repeated restocking possible.
          if (
            operation === "update" &&
            doc.status === OrderStatus.CANCELED &&
            previousDoc?.status !== OrderStatus.CANCELED
          ) {
            const cancelledItems: OrderItem[] = Array.isArray(doc.items) ? doc.items : [];
            const restoredProductIds = new Set<number>();
            for (const item of cancelledItems) {
              const quantity = Number(item?.quantity ?? 0);
              if (!Number.isSafeInteger(quantity) || quantity < 1) continue;
              const variantId = typeof item.variant === "object" ? item.variant?.id : item.variant;
              const productId = typeof item.product === "object" ? item.product?.id : item.product;
              const targetId = variantId ?? productId;
              if (!targetId) continue;
              await changeInventoryAtomically({
                req,
                collection: variantId ? "variants" : CollectionName.products,
                id: targetId,
                quantity,
                direction: "restore",
              });
              if (productId) restoredProductIds.add(productId);
            }

            if (restoredProductIds.size) {
              const products = await req.payload.find({
                collection: CollectionName.products,
                depth: 0,
                pagination: false,
                limit: restoredProductIds.size,
                where: { id: { in: Array.from(restoredProductIds) } },
                select: { slug: true },
              });
              for (const product of products.docs) {
                if (product.slug) revalidate(`${CollectionName.products}-${product.slug}`);
              }
            }
          }

          if (operation !== "create" || req.context?.skipOrderNotification)
            return doc;

          const items: OrderItem[] = Array.isArray(doc.items) ? doc.items : [];
          const touchedProductIds = new Set<number>();

          for (const item of items) {
            const quantity = Number(item?.quantity ?? 0);
            if (!quantity) continue;

            const variantId =
              typeof item.variant === "object"
                ? item.variant?.id
                : item.variant;
            const productId =
              typeof item.product === "object"
                ? item.product?.id
                : item.product;

            const targetId = variantId ?? productId;
            if (!targetId) continue;

            await changeInventoryAtomically({
              req,
              collection: variantId ? "variants" : CollectionName.products,
              id: targetId,
              quantity,
              direction: "reserve",
            });

            if (productId) touchedProductIds.add(productId);
          }

          if (touchedProductIds.size) {
            const products = await req.payload.find({
              collection: CollectionName.products,
              depth: 0,
              pagination: false,
              limit: touchedProductIds.size,
              where: { id: { in: Array.from(touchedProductIds) } },
              select: { slug: true },
            });

            for (const product of products.docs) {
              if (product.slug) {
                revalidate(`${CollectionName.products}-${product.slug}`);
              }
            }
          }

          return doc;
        },

        async (args) => {
          const { operation, doc, req } = args;
          if (
            operation !== "create" ||
            req.context?.skipOrderNotification ||
            !appConfig.SEND_EMAIL_WHATSAPP
          )
            return doc;

          await new OrderNotifier(req.payload).send(doc);

          return doc;
        },
      ],
      beforeValidate: [
        ...((defaultCollection.hooks
          ?.beforeValidate as CollectionBeforeValidateHook[]) || []),
        async ({ data, req, operation }) => {
          if (!data) return data;

          // Order line items and totals are immutable snapshots after creation.
          // Status changes and return-request updates must never be rebuilt
          // from a cart that may have changed or been emptied since checkout.
          if (operation !== "create") return data;

          if (operation === "create") {
            if (!req.user) throw new Error("Sign in before placing an order.");
            data.status = OrderStatus.NEW;
            data.isDemoOrder = !stripeConfig.ENABLED;
            data.customer = req.user.id;
            // Order notifications must go only to the authenticated account
            // address, never an arbitrary address supplied in the request.
            data.email = req.user.email;
          }

          const rawCart = data.cart;
          const cartId = typeof rawCart === "object" ? rawCart?.id : rawCart;
          if (!cartId) {
            if (operation === "create") throw new Error("A valid cart is required to place an order.");
            return data;
          }

          if (operation === "create" && !req.user) {
            throw new Error("Sign in before placing an order.");
          }

          const cart = await req.payload.findByID({
            collection: "carts",
            id: cartId,
            depth: 3,
          });

          if (operation === "create") {
            const cartCustomer = (cart as typeof cart & { customer?: number | string | { id: number | string } }).customer;
            const cartCustomerId = typeof cartCustomer === "object" && cartCustomer
              ? cartCustomer.id
              : cartCustomer;
            if (!req.user || String(cartCustomerId ?? "") !== String(req.user.id)) {
              throw new Error("This cart does not belong to your signed-in account.");
            }
          }

          const items: CartItem[] = Array.isArray(cart?.items) ? cart.items : [];
          const verifiedItems: CartItem[] = [];

          if (operation === "create") {
            if (!items.length) throw new Error("Your cart is empty.");

            for (const item of items) {
              const quantity = Number(item?.quantity ?? 0);
              if (!Number.isSafeInteger(quantity) || quantity < 1) {
                throw new Error("Cart quantities must be positive whole numbers.");
              }

              const productId = typeof item.product === "object"
                ? item.product?.id
                : item.product;
              if (!productId) throw new Error("A cart item is missing its product.");

              // Always re-read current product and variant records. Never trust
              // prices, status, or inventory copied into a stale client cart.
              const product = await req.payload.findByID({
                collection: CollectionName.products,
                id: productId,
                depth: 0,
              }) as Product & { listingStatus?: string; isDemo?: boolean };

              if (
                product._status !== "published" ||
                ["pending", "rejected", "suspended"].includes(product.listingStatus ?? "")
              ) {
                throw new Error("A product in your cart is no longer available.");
              }

              const variantId = typeof item.variant === "object"
                ? item.variant?.id
                : item.variant;
              const variant = variantId
                ? await req.payload.findByID({
                    collection: "variants",
                    id: variantId,
                    depth: 0,
                  }) as Variant
                : null;

              if (variant) {
                const variantProductId = typeof variant.product === "object"
                  ? variant.product?.id
                  : variant.product;
                if (String(variantProductId) !== String(productId)) {
                  throw new Error("Cart variant does not belong to its product.");
                }
              }

              const available = Number(variant?.inventory ?? product.inventory ?? 0);
              if (available < quantity) {
                throw new Error(`Not enough stock for ${product.title}. Available: ${available}.`);
              }

              verifiedItems.push({
                ...item,
                product,
                ...(variant ? { variant } : {}),
              } as CartItem);
            }
          } else {
            verifiedItems.push(...items);
          }

          const snapshot = verifiedItems
            .map((it) => {
              const quantity = Number(it?.quantity ?? 0);
              if (!quantity) return null;

              const product =
                typeof it.product === "object" && it.product
                  ? it.product
                  : undefined;

              const variant =
                typeof it.variant === "object" && it.variant
                  ? (it.variant as Variant)
                  : undefined;

              const productId =
                typeof it.product === "object" ? it.product?.id : it.product;

              if (!productId || !product) return null;

              const optionLabels = (variant?.options ?? [])
                .map((option) =>
                  typeof option === "object" ? option.label : null,
                )
                .filter((label): label is string => Boolean(label));

              const title = optionLabels.length
                ? `${product.title} – ${optionLabels.join(" / ")}`
                : (product.title ?? "");

              const unitPrice =
                variant?.priceInUSDEnabled && variant.priceInUSD != null
                  ? Number(variant.priceInUSD)
                  : Number(product.priceInUSD ?? 0);

              return {
                product: productId,
                variant: variant?.id,
                title,
                quantity,
                unitPrice,
                lineTotal: unitPrice * quantity,
                isDemo: Boolean((product as Product & { isDemo?: boolean }).isDemo),
              };
            })
            .filter(
              (
                x,
              ): x is {
                product: number;
                variant: number | undefined;
                title: string;
                quantity: number;
                unitPrice: number;
                lineTotal: number;
                isDemo: boolean;
              } => Boolean(x),
            );

          const verifiedTotal = snapshot.reduce((total, item) => total + item.lineTotal, 0);

          // Verify payment against the same server-calculated amount stored
          // on the order, not a potentially stale cart subtotal.
          if (
            stripeConfig.ENABLED &&
            operation === "create" &&
            !isAdmin({ req })
          ) {
            await verifyStripePaymentIntent({
              paymentIntentId: data.paymentIntentId,
              cartId,
              expectedAmount: verifiedTotal,
              payload: req.payload,
            });
          }

          data.items = snapshot;
          data.amount = verifiedTotal;

          return data;
        },
      ],
    },
  };
};
