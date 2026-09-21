import path from "path";
import fs from "fs";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { getDb } from "./index.js";

/**
 * Runs pending Drizzle database migrations for PostgreSQL.
 */
export async function runMigrations(): Promise<void> {
  console.log(`[Migrations] Running migrations for provider: postgresql...`);

  try {
    const db = getDb();

    const migrationsFolder = path.resolve(process.cwd(), "server/src/db/migrations/postgresql");
    if (!fs.existsSync(migrationsFolder)) {
      console.warn(`[Migrations] Migrations folder not found at ${migrationsFolder}`);
      return;
    }
    await migratePg(db as any, { migrationsFolder });
    console.log("[Migrations] PostgreSQL migrations applied successfully.");
    return;
  } catch (err) {
    console.error("[Migrations] Migration failed:", err);
    throw err;
  }
}

// Allow direct execution: `tsx server/src/db/migrate.ts`
if (process.argv[1]?.endsWith("migrate.ts") || process.argv[1]?.endsWith("migrate.js")) {
  runMigrations()
    .then(() => {
      console.log("[Migrations] Migration process completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Migrations] Migration error:", err);
      process.exit(1);
    });
}

export default runMigrations;
