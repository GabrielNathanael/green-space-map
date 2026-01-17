import { NextRequest } from "next/server";
import { FavoriteService } from "@/lib/services/favorite.service";
import { deleteFavoriteSchema } from "@/lib/validators/favorite.validator";
import { ResponseBuilder } from "@/lib/api/response";
import {
  asyncHandler,
  requireAuth,
  validateParams,
} from "@/lib/api/middleware";

/**
 * DELETE /api/favorites/[id]
 * Remove favorite
 */
export const DELETE = asyncHandler(
  async (_request: NextRequest, context?: { params: { id: string } }) => {
    // Require authentication
    const user = await requireAuth();

    // Validate params
    const { id } = validateParams(context?.params, deleteFavoriteSchema);

    // Call service layer
    await FavoriteService.removeFavorite(user.id, id);

    // Return success response
    return ResponseBuilder.success(
      { id },
      { message: "Favorite removed successfully" }
    );
  }
);
