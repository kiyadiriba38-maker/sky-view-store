import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "listing_policy_reviewed" boolean DEFAULT false NOT NULL;

    CREATE INDEX IF NOT EXISTS "products_listing_policy_reviewed_idx"
      ON "products" ("listing_policy_reviewed");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "products_listing_policy_reviewed_idx";
    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "listing_policy_reviewed";
  `);
}
