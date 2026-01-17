import { NextRequest } from "next/server";
import { RatingService } from "@/lib/services/rating.service";
import { createRatingSchema } from "@/lib/validators/rating.validator";
import { ResponseBuilder } from "@/lib/api/response";
import { asyncHandler, requireAuth, validateBody } from "@/lib/api/middleware";

/**
 * POST /api/ratings
 * Submit rating for green space
 */
export const POST = asyncHandler(async (request: NextRequest) => {
  // Require authentication
  const user = await requireAuth();

  // Validate request body
  const body = await validateBody(request, createRatingSchema);

  // Call service layer
  const rating = await RatingService.createRating(user.id, body);

  // Return response
  const statusCode = rating.isUpdate ? 200 : 201;
  const message = rating.isUpdate
    ? "Rating updated successfully"
    : "Rating submitted successfully";

  return ResponseBuilder.success(
    {
      id: rating.id,
      rating: rating.rating,
      comment: rating.comment,
      isUpdate: rating.isUpdate,
    },
    { message },
    statusCode
  );
});
