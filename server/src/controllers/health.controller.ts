import type { Request, Response } from "express";
import { checkDatabaseConnection } from "../db/index.js";
import config from "../config/index.js";
import type { ApiResponse, HealthData } from "../types/index.js";

const startTime = Date.now();

/**
 * Health check controller
 * Endpoint: GET /api/health
 */
export async function getHealth(req: Request, res: Response): Promise<void> {
  const dbCheck = await checkDatabaseConnection();

  const healthData: HealthData = {
    status: dbCheck.connected ? "healthy" : "degraded",
    environment: config.env,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    database: {
      status: dbCheck.connected ? "connected" : "disconnected",
      provider: dbCheck.provider,
      latencyMs: dbCheck.latencyMs,
      ...(dbCheck.error ? { error: dbCheck.error } : {}),
    },
  };

  const response: ApiResponse<HealthData> = {
    success: true,
    message: "API is running",
    data: healthData,
  };

  res.status(200).json(response);
}

export default getHealth;
