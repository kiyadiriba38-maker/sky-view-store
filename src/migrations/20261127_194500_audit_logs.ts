import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" serial PRIMARY KEY,
      "actor_id" integer NOT NULL,
      "action" varchar NOT NULL,
      "target_collection" varchar NOT NULL,
      "target_id" varchar NOT NULL,
      "summary" varchar NOT NULL,
      "created_at" timestamptz DEFAULT now() NOT NULL,
      "updated_at" timestamptz DEFAULT now() NOT NULL
    );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_actor_id_fkey') THEN
        ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey"
        FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT;
      END IF;
    END
    $$;

    CREATE INDEX IF NOT EXISTS "audit_logs_actor_id_idx" ON "audit_logs" ("actor_id");
    CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" ("action");
    CREATE INDEX IF NOT EXISTS "audit_logs_target_collection_idx" ON "audit_logs" ("target_collection");
    CREATE INDEX IF NOT EXISTS "audit_logs_target_id_idx" ON "audit_logs" ("target_id");
    CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("created_at");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "audit_logs" CASCADE;`);
}
