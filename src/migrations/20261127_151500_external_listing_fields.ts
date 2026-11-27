import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN "listing_type" varchar DEFAULT 'own_store' NOT NULL,
      ADD COLUMN "external_marketplace" varchar,
      ADD COLUMN "external_url" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      DROP COLUMN "listing_type",
      DROP COLUMN "external_marketplace",
      DROP COLUMN "external_url";
  `);
}
