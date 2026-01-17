import { NextRequest } from "next/server";
import { UserService } from "@/lib/services/user.service";
import { registerSchema } from "@/lib/validators/auth.validator";
import { ResponseBuilder } from "@/lib/api/response";
import { asyncHandler, validateBody } from "@/lib/api/middleware";

/**
 * POST /api/auth/register
 * Register new user
 */
export const POST = asyncHandler(async (request: NextRequest) => {
  // Validate request body
  const body = await validateBody(request, registerSchema);

  // Call service layer
  const user = await UserService.register(body);

  // Return created response
  return ResponseBuilder.created(user, {
    message: "User registered successfully",
  });
});
