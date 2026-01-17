import { NextRequest } from "next/server";
import { FavoriteService } from "@/lib/services/favorite.service";
import { createFavoriteSchema } from "@/lib/validators/favorite.validator";
import { ResponseBuilder } from "@/lib/api/response";
import { asyncHandler, requireAuth, validateBody } from "@/lib/api/middleware";

/**
 * GET /api/favorites
 * Get user's favorites
 */
export const GET = asyncHandler(async () => {
  // Require authentication
  const user = await requireAuth();

  // Call service layer
  const favorites = await FavoriteService.getUserFavorites(user.id);

  // Return success response
  return ResponseBuilder.success(favorites);
});

/**
 * POST /api/favorites
 * Add favorite
 */
export const POST = asyncHandler(async (request: NextRequest) => {
  // Require authentication
  const user = await requireAuth();

  // Validate request body
  const body = await validateBody(request, createFavoriteSchema);

  // Call service layer
  const favorite = await FavoriteService.addFavorite(user.id, body);

  // Return created response
  return ResponseBuilder.created(favorite, {
    message: "Favorite added successfully",
  });
});
