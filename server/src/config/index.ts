import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env if present
dotenv.config();

export interface ServerConfig {
  env: "development" | "production" | "test";
  port: number;
  database: {
    provider: "sqlite" | "postgresql";
    url: string;
  };
  cors: {
    origin: string | string[];
  };
  firebase: {
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
  };
  allowDevAuth: boolean;
  s3: {
    bucketName: string;
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    maxResumeSizeMb: number;
    maxBlogImageSizeMb: number;
    presignedExpiresInSeconds: number;
  };
}

const env = (process.env.NODE_ENV || "development") as "development" | "production" | "test";
const isProd = env === "production";

// Default database provider: SQLite in dev, PostgreSQL in prod
const databaseProvider = (process.env.DATABASE_PROVIDER || (isProd ? "postgresql" : "sqlite")) as
  | "sqlite"
  | "postgresql";

// Default database URL: local SQLite file in dev, empty / required in prod
const defaultSqliteUrl = "file:./server/data/dev.db";
const databaseUrl = process.env.DATABASE_URL || (databaseProvider === "sqlite" ? defaultSqliteUrl : "");

export const config: ServerConfig = {
  env,
  port: parseInt(process.env.PORT || "3000", 10),
  database: {
    provider: databaseProvider,
    url: databaseUrl,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined,
  },
  // Allow dev auth tokens only in non-production environments unless explicitly disabled (ALLOW_DEV_AUTH=false)
  allowDevAuth: !isProd && process.env.ALLOW_DEV_AUTH !== "false",
  s3: {
    bucketName: process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || "saras-dynamics-private-resumes",
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    maxResumeSizeMb: parseInt(process.env.MAX_RESUME_SIZE_MB || "5", 10),
    maxBlogImageSizeMb: parseInt(process.env.MAX_BLOG_IMAGE_SIZE_MB || "5", 10),
    presignedExpiresInSeconds: parseInt(process.env.S3_PRESIGNED_EXPIRES_IN || "900", 10),
  },
};

export default config;
