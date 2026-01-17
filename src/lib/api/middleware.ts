import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { ZodSchema } from "zod";
import { ResponseBuilder } from "./response";
import {
  ApiError,
  ValidationError,
  UnauthorizedError,
} from "@/lib/utils/errors";

/**
 * Require authentication middleware
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new UnauthorizedError("Authentication required");
  }

  return session.user;
}

/**
 * Validate request body with Zod schema
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new ValidationError("Invalid request body", result.error.format());
    }

    return result.data;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Invalid JSON body");
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  const result = schema.safeParse(query);

  if (!result.success) {
    throw new ValidationError(
      "Invalid query parameters",
      result.error.format()
    );
  }

  return result.data;
}

/**
 * Validate route params with Zod schema
 */
export function validateParams<T>(params: unknown, schema: ZodSchema<T>): T {
  const result = schema.safeParse(params);

  if (!result.success) {
    throw new ValidationError(
      "Invalid route parameters",
      result.error.format()
    );
  }

  return result.data;
}

/**
 * Global error handler for route handlers
 */
export function handleError(error: unknown) {
  console.error("API Error:", error);

  // Handle known API errors
  if (error instanceof ApiError) {
    return ResponseBuilder.error(
      error.code,
      error.message,
      error.details,
      error.statusCode
    );
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as Record<string, unknown> & {
      code: string;
      meta?: { target?: string[] };
    };

    // Unique constraint violation
    if (prismaError.code === "P2002") {
      return ResponseBuilder.error(
        "CONFLICT",
        "Resource already exists",
        { field: prismaError.meta?.target },
        409
      );
    }

    // Record not found
    if (prismaError.code === "P2025") {
      return ResponseBuilder.notFound("Resource not found");
    }
  }

  // Unknown error
  return ResponseBuilder.serverError(
    process.env.NODE_ENV === "development"
      ? (error as Error).message
      : "Internal server error"
  );
}

/**
 * Route context for handlers with params
 */
export interface RouteContext {
  params: Record<string, string | string[]>;
}

/**
 * Async handler wrapper with error handling
 * Supports both simple handlers and handlers with route params
 */
export function asyncHandler<T = unknown>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (request: NextRequest, context: any) => Promise<T>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: NextRequest, context: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error);
    }
  };
}
