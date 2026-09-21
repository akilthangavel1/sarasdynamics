import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import config from "../config/index.js";
import { schema } from "./schema.js";

const { Pool } = pg;

export type AppDatabase = NodePgDatabase<typeof schema>;

let dbInstance: AppDatabase | null = null;
export let rawPgPool: pg.Pool | null = null;

/**
 * Initializes and returns the active database connection (PostgreSQL).
 */
export function getDb(): AppDatabase {
  if (dbInstance) {
    return dbInstance;
  }

  const { url } = config.database;

  if (!url) {
    throw new Error("DATABASE_URL environment variable is required when using PostgreSQL.");
  }

  rawPgPool = new Pool({
    connectionString: url,
  });

  dbInstance = drizzlePg(rawPgPool, { schema });
  return dbInstance;
}

/**
 * Verifies database connectivity by executing a lightweight test query.
 * Does not expose connection strings, passwords, or sensitive credentials.
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  provider: "postgresql";
  latencyMs?: number;
  error?: string;
}> {
  const provider = "postgresql" as const;
  const start = Date.now();

  try {
    getDb();

    if (rawPgPool) {
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
  dbInstance = null;
}

export default getDb;

