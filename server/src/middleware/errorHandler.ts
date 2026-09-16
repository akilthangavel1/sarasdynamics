import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import config from "../config/index.js";
import type { ApiResponse } from "../types/index.js";

/**
 * 404 Handler for unmatched API routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  };
  res.status(404).json(response);
}

/**
 * Centralized error handling middleware.
 * In production, stack traces and internal error details are withheld.
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const isProd = config.env === "production";
  const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
  const statusCode = typeof err === "object" && err !== null && "status" in err && typeof err.status === "number"
    ? err.status
    : 500;

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  const response: ApiResponse = {
    success: false,
    message: isProd && statusCode === 500 ? "Internal Server Error" : errorMessage,
    ...(isProd ? {} : { error: err instanceof Error ? err.stack : String(err) }),
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
