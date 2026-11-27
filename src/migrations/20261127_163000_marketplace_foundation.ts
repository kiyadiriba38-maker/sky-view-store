import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "sellers" (
      "id" serial PRIMARY KEY,
      "store_name" varchar NOT NULL,
      "slug" varchar NOT NULL UNIQUE,
      "description" varchar,
      "logo_url" varchar,
      "country" varchar DEFAULT 'Ethiopia',
      "city" varchar,
      "approval_status" varchar DEFAULT 'pending' NOT NULL,
      "response_time_hours" numeric,
      "completed_orders" numeric DEFAULT 0,
      "updated_at" timestamptz DEFAULT now() NOT NULL,
      "created_at" timestamptz DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "sellers_rels" (
      "id" serial PRIMARY KEY,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "sellers"("id") ON DELETE CASCADE,
      "path" varchar NOT NULL,
      "users_id" integer REFERENCES "users"("id") ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS "sellers_slug_idx" ON "sellers" ("slug");
    CREATE INDEX IF NOT EXISTS "sellers_status_idx" ON "sellers" ("approval_status");
    CREATE INDEX IF NOT EXISTS "sellers_rels_parent_idx" ON "sellers_rels" ("parent_id");
    CREATE INDEX IF NOT EXISTS "sellers_rels_users_idx" ON "sellers_rels" ("users_id");

    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "product_image_url" varchar,
      ADD COLUMN IF NOT EXISTS "demo_image_url" varchar,
      ADD COLUMN IF NOT EXISTS "is_demo" boolean DEFAULT false NOT NULL,
      ADD COLUMN IF NOT EXISTS "listing_status" varchar DEFAULT 'approved' NOT NULL;

    ALTER TABLE "products_rels"
      ADD COLUMN IF NOT EXISTS "sellers_id" integer REFERENCES "sellers"("id") ON DELETE SET NULL;

    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "is_demo_order" boolean DEFAULT true NOT NULL;

    ALTER TABLE "orders_items"
      ADD COLUMN IF NOT EXISTS "is_demo" boolean DEFAULT false NOT NULL;

    ALTER TABLE "reviews"
      ADD COLUMN IF NOT EXISTS "is_demo" boolean DEFAULT false NOT NULL,
      ADD COLUMN IF NOT EXISTS "verified_purchase" boolean DEFAULT false NOT NULL;

    CREATE INDEX IF NOT EXISTS "products_listing_status_idx" ON "products" ("listing_status");
    CREATE INDEX IF NOT EXISTS "products_is_demo_idx" ON "products" ("is_demo");
    CREATE INDEX IF NOT EXISTS "products_rels_sellers_idx" ON "products_rels" ("sellers_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "products_rels_sellers_idx";
    DROP INDEX IF EXISTS "products_is_demo_idx";
    DROP INDEX IF EXISTS "products_listing_status_idx";
    ALTER TABLE "products_rels" DROP COLUMN IF EXISTS "sellers_id";
    ALTER TABLE "orders_items" DROP COLUMN IF EXISTS "is_demo";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "is_demo_order";
    ALTER TABLE "reviews" DROP COLUMN IF EXISTS "verified_purchase", DROP COLUMN IF EXISTS "is_demo";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "listing_status", DROP COLUMN IF EXISTS "is_demo", DROP COLUMN IF EXISTS "demo_image_url", DROP COLUMN IF EXISTS "product_image_url";
    DROP TABLE IF EXISTS "sellers_rels";
    DROP TABLE IF EXISTS "sellers";
  `);
}
