import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "notifications" (
      "id" serial PRIMARY KEY,
      "user_id" integer NOT NULL,
      "type" varchar NOT NULL,
      "title" varchar NOT NULL,
      "message" varchar,
      "href" varchar,
      "read" boolean DEFAULT false NOT NULL,
      "related_order_id" integer,
      "related_seller_id" integer,
      "related_product_id" integer,
      "created_at" timestamptz DEFAULT now() NOT NULL,
      "updated_at" timestamptz DEFAULT now() NOT NULL
    );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_fkey') THEN
        ALTER TABLE "notifications"
          ADD CONSTRAINT "notifications_user_id_fkey"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_related_order_id_fkey') THEN
        ALTER TABLE "notifications"
          ADD CONSTRAINT "notifications_related_order_id_fkey"
          FOREIGN KEY ("related_order_id") REFERENCES "orders"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_related_seller_id_fkey') THEN
        ALTER TABLE "notifications"
          ADD CONSTRAINT "notifications_related_seller_id_fkey"
          FOREIGN KEY ("related_seller_id") REFERENCES "sellers"("id") ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_related_product_id_fkey') THEN
        ALTER TABLE "notifications"
          ADD CONSTRAINT "notifications_related_product_id_fkey"
          FOREIGN KEY ("related_product_id") REFERENCES "products"("id") ON DELETE SET NULL;
      END IF;
    END
    $$;

    CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" ("user_id");
    CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications" ("read");
    CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" ("created_at");
    CREATE INDEX IF NOT EXISTS "notifications_user_read_idx" ON "notifications" ("user_id", "read");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "notifications" CASCADE;
  `);
}
