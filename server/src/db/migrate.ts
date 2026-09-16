import path from "path";
import fs from "fs";
import { migrate as migrateLibsql } from "drizzle-orm/libsql/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { getDb, rawLibSqlClient, rawPgPool } from "./index.js";
import config from "../config/index.js";

/**
 * Runs pending Drizzle database migrations for the configured database provider.
 */
export async function runMigrations(): Promise<void> {
  const provider = config.database.provider;
  console.log(`[Migrations] Running migrations for provider: ${provider}...`);

  try {
    const db = getDb();

    if (provider === "sqlite") {
      const migrationsFolder = path.resolve(process.cwd(), "server/src/db/migrations/sqlite");
      if (!fs.existsSync(migrationsFolder)) {
        console.warn(`[Migrations] Migrations folder not found at ${migrationsFolder}`);
        return;
      }
      await migrateLibsql(db as any, { migrationsFolder });
      console.log("[Migrations] SQLite migrations applied successfully.");
      return;
    }

    if (provider === "postgresql") {
      const migrationsFolder = path.resolve(process.cwd(), "server/src/db/migrations/postgresql");
      if (!fs.existsSync(migrationsFolder)) {
        console.warn(`[Migrations] Migrations folder not found at ${migrationsFolder}`);
        return;
      }
      await migratePg(db as any, { migrationsFolder });
      console.log("[Migrations] PostgreSQL migrations applied successfully.");
      return;
    }
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
