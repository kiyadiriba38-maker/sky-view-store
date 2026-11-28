import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "reports" (
      "id" serial PRIMARY KEY,
      "reporter_id" integer NOT NULL,
      "target_type" varchar NOT NULL,
      "target_product_id" integer,
      "target_seller_id" integer,
      "target_review_id" integer,
      "target_order_id" integer,
      "reason" varchar NOT NULL,
      "description" varchar NOT NULL,
      "status" varchar DEFAULT 'pending' NOT NULL,
      "moderator_notes" varchar,
      "created_at" timestamptz DEFAULT now() NOT NULL,
      "updated_at" timestamptz DEFAULT now() NOT NULL
    );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_reporter_id_fkey') THEN
        ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey"
        FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_target_product_id_fkey') THEN
        ALTER TABLE "reports" ADD CONSTRAINT "reports_target_product_id_fkey"
        FOREIGN KEY ("target_product_id") REFERENCES "products"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_target_seller_id_fkey') THEN
        ALTER TABLE "reports" ADD CONSTRAINT "reports_target_seller_id_fkey"
        FOREIGN KEY ("target_seller_id") REFERENCES "sellers"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_target_review_id_fkey') THEN
        ALTER TABLE "reports" ADD CONSTRAINT "reports_target_review_id_fkey"
        FOREIGN KEY ("target_review_id") REFERENCES "reviews"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_target_order_id_fkey') THEN
        ALTER TABLE "reports" ADD CONSTRAINT "reports_target_order_id_fkey"
        FOREIGN KEY ("target_order_id") REFERENCES "orders"("id") ON DELETE SET NULL;
      END IF;
    END
    $$;

    CREATE INDEX IF NOT EXISTS "reports_reporter_id_idx" ON "reports" ("reporter_id");
    CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports" ("status");
    CREATE INDEX IF NOT EXISTS "reports_target_type_idx" ON "reports" ("target_type");
    CREATE INDEX IF NOT EXISTS "reports_created_at_idx" ON "reports" ("created_at");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "reports" CASCADE;`);
}
