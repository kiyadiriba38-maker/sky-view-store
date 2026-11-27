import type { Payload } from "payload";

export type StoreAuditLogInput = {
  actor: number | string;
  action: string;
  targetCollection: string;
  targetId: number | string;
  summary: string;
};

export async function createStoreAuditLog(
  payload: Payload,
  input: StoreAuditLogInput,
): Promise<void> {
  try {
    await payload.create({
      collection: "audit-logs" as never,
      data: input as never,
      overrideAccess: true,
    });
  } catch {
    // Audit logging must not interrupt a core customer transaction.
  }
}
