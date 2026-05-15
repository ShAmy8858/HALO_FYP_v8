/**
 * Minimal migration: adds only the new tables/columns needed for Phase 2.
 * Run with: npx tsx src/db/migrate-subscription.ts
 */
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("[migrate] Connected to database");

    // 1. Create payment_status enum if not exists
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."payment_status" AS ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    console.log("[migrate] ✓ payment_status enum");

    // 2. Update subscription_tier enum to new values
    // Check if old values exist
    const { rows: enumVals } = await client.query(`
      SELECT enumlabel FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_tier')
      ORDER BY enumsortorder;
    `);
    const labels = enumVals.map((r: any) => r.enumlabel);
    
    if (labels.includes("BASIC")) {
      console.log("[migrate] Updating subscription_tier enum: BASIC→STARTER, STANDARD→PROFESSIONAL, PREMIUM→ENTERPRISE");
      await client.query(`ALTER TYPE "public"."subscription_tier" RENAME VALUE 'BASIC' TO 'STARTER'`);
      await client.query(`ALTER TYPE "public"."subscription_tier" RENAME VALUE 'STANDARD' TO 'PROFESSIONAL'`);
      await client.query(`ALTER TYPE "public"."subscription_tier" RENAME VALUE 'PREMIUM' TO 'ENTERPRISE'`);
    } else if (!labels.includes("STARTER")) {
      // Enum exists but doesn't have our values — add them
      await client.query(`ALTER TYPE "public"."subscription_tier" ADD VALUE IF NOT EXISTS 'STARTER'`);
      await client.query(`ALTER TYPE "public"."subscription_tier" ADD VALUE IF NOT EXISTS 'PROFESSIONAL'`);
      await client.query(`ALTER TYPE "public"."subscription_tier" ADD VALUE IF NOT EXISTS 'ENTERPRISE'`);
    }
    console.log("[migrate] ✓ subscription_tier enum updated");

    // 3. Create subscription_payments table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "subscription_payments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "hospital_id" uuid NOT NULL REFERENCES "hospitals"("id") ON DELETE CASCADE,
        "submitted_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "selected_plan" "subscription_tier" NOT NULL,
        "receipt_url" text NOT NULL,
        "storage_key" text NOT NULL,
        "bank_reference" varchar(120),
        "payment_method" varchar(80),
        "amount" integer,
        "status" "payment_status" DEFAULT 'PENDING_REVIEW' NOT NULL,
        "admin_notes" text,
        "reviewed_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "reviewed_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS "subscription_payments_hospital_idx" ON "subscription_payments" USING btree ("hospital_id")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "subscription_payments_status_idx" ON "subscription_payments" USING btree ("status")`);
    console.log("[migrate] ✓ subscription_payments table");

    // 4. Add payment_methods column to platform_settings if not exists
    const { rows: cols } = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'platform_settings' AND column_name = 'payment_methods';
    `);
    if (cols.length === 0) {
      await client.query(`ALTER TABLE "platform_settings" ADD COLUMN "payment_methods" jsonb`);
      console.log("[migrate] ✓ payment_methods column added to platform_settings");
    } else {
      console.log("[migrate] ✓ payment_methods column already exists");
    }

    console.log("\n[migrate] ✅ All migrations applied successfully!");
  } catch (err) {
    console.error("[migrate] ❌ Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
