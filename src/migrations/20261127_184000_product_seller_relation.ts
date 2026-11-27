import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "seller_id" integer;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'products_seller_id_fkey'
      ) THEN
        ALTER TABLE "products"
          ADD CONSTRAINT "products_seller_id_fkey"
          FOREIGN KEY ("seller_id") REFERENCES "sellers"("id")
          ON DELETE SET NULL;
      END IF;
    END
    $$;

    CREATE INDEX IF NOT EXISTS "products_seller_id_idx"
      ON "products" ("seller_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "products_seller_id_idx";
    ALTER TABLE "products"
      DROP CONSTRAINT IF EXISTS "products_seller_id_fkey",
      DROP COLUMN IF EXISTS "seller_id";
  `);
}
