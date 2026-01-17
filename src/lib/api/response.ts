import { NextResponse } from "next/server";

/**
 * Standard API Response Format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    [key: string]: unknown;
  };
}

/**
 * Response Builder Class
 */
export class ResponseBuilder {
  /**
   * Success Response
   */
  static success<T>(
    data: T,
    meta?: Record<string, unknown>,
    status: number = 200
  ) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };

    return NextResponse.json(response, { status });
  }

  /**
   * Error Response
   */
  static error(
    code: string,
    message: string,
    details?: unknown,
    status: number = 400
  ) {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && typeof details === "object" ? { details } : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status });
  }

  /**
   * Created Response (201)
   */
  static created<T>(data: T, meta?: Record<string, unknown>) {
    return this.success(data, meta, 201);
  }

  /**
   * No Content Response (204)
   */
  static noContent() {
    return new NextResponse(null, { status: 204 });
  }

  /**
   * Unauthorized Response (401)
   */
  static unauthorized(message: string = "Unauthorized") {
    return this.error("UNAUTHORIZED", message, null, 401);
  }

  /**
   * Forbidden Response (403)
   */
  static forbidden(message: string = "Forbidden") {
    return this.error("FORBIDDEN", message, null, 403);
  }

  /**
   * Not Found Response (404)
   */
  static notFound(message: string = "Resource not found") {
    return this.error("NOT_FOUND", message, null, 404);
  }

  /**
   * Validation Error Response (400)
   */
  static validationError(
    details: unknown,
    message: string = "Validation failed"
  ) {
    return this.error("VALIDATION_ERROR", message, details, 400);
  }

  /**
   * Internal Server Error Response (500)
   */
  static serverError(
    message: string = "Internal server error",
    details?: unknown
  ) {
    return this.error("INTERNAL_ERROR", message, details, 500);
  }

  /**
   * Rate Limit Response (429)
   */
  static rateLimited(message: string = "Too many requests") {
    return this.error("RATE_LIMIT", message, null, 429);
  }

  /**
   * Service Unavailable Response (503)
   */
  static serviceUnavailable(
    message: string = "Service temporarily unavailable"
  ) {
    return this.error("SERVICE_UNAVAILABLE", message, null, 503);
  }
}

// Shorthand exports
export const {
  success,
  error,
  created,
  noContent,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  serverError,
  rateLimited,
  serviceUnavailable,
} = ResponseBuilder;
