import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "return_request_status" varchar DEFAULT 'none' NOT NULL,
      ADD COLUMN IF NOT EXISTS "return_reason" varchar,
      ADD COLUMN IF NOT EXISTS "return_requested_at" timestamptz;

    CREATE INDEX IF NOT EXISTS "orders_return_status_idx"
      ON "orders" ("return_request_status");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "orders_return_status_idx";
    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "return_requested_at",
      DROP COLUMN IF EXISTS "return_reason",
      DROP COLUMN IF EXISTS "return_request_status";
  `);
}
