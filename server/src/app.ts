import express, { type Express } from "express";
import cors from "cors";
import config from "./config/index.js";
import apiRouter from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/logger.js";

export function createApp(): Express {
  const app = express();

  // Security & Request Parsing Middlewares
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Request Logging
  app.use("/api", requestLogger);

  // API Gateway Routes
  app.use("/api", apiRouter);

  // 404 handler for API routes
  app.use("/api/*", notFoundHandler);

  // Centralized error handling
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
