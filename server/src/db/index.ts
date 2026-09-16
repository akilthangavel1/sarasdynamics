import fs from "fs";
import path from "path";
import { createClient, type Client as LibSqlClient } from "@libsql/client";
import { drizzle as drizzleLibsql, type LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import config from "../config/index.js";
import { schema } from "./schema.js";

const { Pool } = pg;

export type AppDatabase = LibSQLDatabase<typeof schema> | NodePgDatabase<typeof schema>;

let dbInstance: AppDatabase | null = null;
export let rawLibSqlClient: LibSqlClient | null = null;
export let rawPgPool: pg.Pool | null = null;

/**
 * Initializes and returns the active database connection.
 * Development: SQLite (via @libsql/client local file)
 * Production: PostgreSQL (via pg connection pool)
 */
export function getDb(): AppDatabase {
  if (dbInstance) {
    return dbInstance;
  }

  const { provider, url } = config.database;

  if (provider === "sqlite") {
    // Ensure the data directory exists before opening SQLite database
    const dbPath = url.startsWith("file:") ? url.replace(/^file:/, "") : url;
    const resolvedPath = path.resolve(process.cwd(), dbPath);
    const dir = path.dirname(resolvedPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    rawLibSqlClient = createClient({
      url: `file:${resolvedPath}`,
    });

    dbInstance = drizzleLibsql(rawLibSqlClient, { schema });
    return dbInstance;
  }

  if (provider === "postgresql") {
    if (!url) {
      throw new Error("DATABASE_URL environment variable is required when using PostgreSQL.");
    }

    rawPgPool = new Pool({
      connectionString: url,
    });

    dbInstance = drizzlePg(rawPgPool, { schema });
    return dbInstance;
  }

  throw new Error(`Unsupported database provider: ${provider}`);
}

/**
 * Verifies database connectivity by executing a lightweight test query.
 * Does not expose connection strings, passwords, or sensitive credentials.
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  provider: "sqlite" | "postgresql";
  latencyMs?: number;
  error?: string;
}> {
  const provider = config.database.provider;
  const start = Date.now();

  try {
    getDb();

    if (provider === "sqlite" && rawLibSqlClient) {
      await rawLibSqlClient.execute("SELECT 1 AS probe");
      const latencyMs = Date.now() - start;
      return { connected: true, provider, latencyMs };
    }

    if (provider === "postgresql" && rawPgPool) {
      const client = await rawPgPool.connect();
      try {
        await client.query("SELECT 1 AS probe");
      } finally {
        client.release();
      }
      const latencyMs = Date.now() - start;
      return { connected: true, provider, latencyMs };
    }

    return { connected: false, provider, error: "Database client not initialized" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown database connection error";
    // Sanitize to avoid leaking credentials in connection errors
    const sanitizedMessage = message.replace(/:\/\/[^@]+@/, "://***:***@");
    return {
      connected: false,
      provider,
      error: sanitizedMessage,
    };
  }
}

/**
 * Closes open database pools/connections for graceful shutdown.
 */
export async function closeDatabase(): Promise<void> {
  if (rawPgPool) {
    await rawPgPool.end();
    rawPgPool = null;
  }
  if (rawLibSqlClient) {
    rawLibSqlClient.close();
    rawLibSqlClient = null;
  }
  dbInstance = null;
}

export default getDb;
