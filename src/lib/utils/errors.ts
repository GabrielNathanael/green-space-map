/**
 * Base API Error
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends ApiError {
  constructor(message: string = "Validation failed", details?: unknown) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
    this.name = "UnauthorizedError";
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenError";
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super("NOT_FOUND", message, 404);
    this.name = "NotFoundError";
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = "Resource already exists") {
    super("CONFLICT", message, 409);
    this.name = "ConflictError";
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends ApiError {
  constructor(message: string = "Too many requests") {
    super("RATE_LIMIT", message, 429);
    this.name = "RateLimitError";
  }
}

/**
 * External Service Error (503)
 */
export class ExternalServiceError extends ApiError {
  constructor(service: string, message?: string) {
    super(
      "EXTERNAL_SERVICE_ERROR",
      message || `${service} is currently unavailable`,
      503,
      { service }
    );
    this.name = "ExternalServiceError";
  }
}

/**
 * Database Error (500)
 */
export class DatabaseError extends ApiError {
  constructor(
    message: string = "Database operation failed",
    details?: unknown
  ) {
    super("DATABASE_ERROR", message, 500, details);
    this.name = "DatabaseError";
  }
}
