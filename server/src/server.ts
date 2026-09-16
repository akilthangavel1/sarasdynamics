import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createServer as createViteServer } from "vite";
import config, { assertValidConfig, getSanitizedConfig } from "./config/index.js";
import { app } from "./app.js";
import { getDb, checkDatabaseConnection, closeDatabase } from "./db/index.js";
import { runMigrations } from "./db/migrate.js";
import { seedDatabase } from "./db/seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // 1. Fail-Fast Environment Configuration Assertion
  try {
    assertValidConfig(config);
    console.log(`[Config] Configuration successfully verified for environment: '${config.env}'`);
    if (config.env === "production") {
      console.log("[Config] Production configuration (sanitized):", JSON.stringify(getSanitizedConfig(config), null, 2));
    }
  } catch (configErr) {
    console.error("[Config] FATAL CONFIGURATION ERROR:");
    console.error(configErr instanceof Error ? configErr.message : String(configErr));
    process.exit(1);
  }

  const PORT = config.port;

  // Initialize and verify database connection
  console.log(`[Database] Initializing ${config.database.provider} connection...`);

  try {
    getDb();
    const probe = await checkDatabaseConnection();
    if (probe.connected) {
      console.log(`[Database] Successfully connected to ${probe.provider} (${probe.latencyMs}ms)`);
      // In development mode, auto-apply migrations and seed database for developer convenience.
      // In production mode, automatic startup migrations/seeds are strictly disabled.
      // Production migrations are executed explicitly via `npm run db:migrate` / deployment pipelines.
      if (config.env !== "production") {
        await runMigrations();
        await seedDatabase();
      } else {
        console.log("[Database] Production environment detected: Automatic startup migrations/seeds are disabled.");
      }
    } else {
      console.warn(`[Database] Warning: Initial connection probe returned false: ${probe.error}`);
    }
  } catch (dbErr) {
    console.error("[Database] Initialization error:", dbErr);
  }

  // Vite middleware setup (Development vs Production SPA fallback)
  if (config.env !== "production") {
    console.log("[Vite] Mounting Vite middleware in development mode...");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`[Server] Serving production static assets from ${distPath}`);
    // Serve static files
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Saras Dynamics server running on http://0.0.0.0:${PORT} [${config.env}]`);
    console.log(`[Server] Health Check available at http://0.0.0.0:${PORT}/api/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`[Server] ${signal} signal received: closing HTTP server...`);
    server.close(async () => {
      console.log("[Server] HTTP server closed.");
      await closeDatabase();
      console.log("[Database] Database connection closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((err) => {
  console.error("[Server] Fatal startup error:", err);
  process.exit(1);
});

