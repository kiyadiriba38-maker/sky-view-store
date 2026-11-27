import type { Payload } from "payload";

export type StoreNotificationType =
  | "order_update"
  | "return_update"
  | "seller_application"
  | "seller_approval"
  | "listing_review"
  | "system";

export type StoreNotificationInput = {
  user: number | string;
  type: StoreNotificationType;
  title: string;
  message?: string;
  href?: string;
  relatedOrder?: number | string;
  relatedSeller?: number | string;
  relatedProduct?: number | string;
};

export async function createStoreNotification(
  payload: Payload,
  input: StoreNotificationInput,
): Promise<void> {
  try {
    const href = input.href && input.href.startsWith("/") && !input.href.startsWith("//")
      ? input.href
      : undefined;
    await payload.create({
      collection: "notifications",
      data: { ...input, href, read: false } as never,
      overrideAccess: true,
    });
  } catch {
    // Notification delivery is best-effort and must not block an order or review workflow.
  }
}
