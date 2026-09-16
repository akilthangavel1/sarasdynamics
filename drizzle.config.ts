import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

const provider = process.env.DATABASE_PROVIDER || "sqlite";
const isPostgres = provider === "postgresql";

export default defineConfig(
  isPostgres
    ? {
        schema: "./server/src/db/schema.pg.ts",
        out: "./server/src/db/migrations/postgresql",
        dialect: "postgresql",
        dbCredentials: {
          url: process.env.DATABASE_URL || "",
        },
      }
    : {
        schema: "./server/src/db/schema.sqlite.ts",
        out: "./server/src/db/migrations/sqlite",
        dialect: "sqlite",
        dbCredentials: {
          url: (process.env.DATABASE_URL || "./server/data/dev.db").replace(/^file:/, ""),
        },
      }
);
