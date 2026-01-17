import { NextRequest } from "next/server";
import { RatingService } from "@/lib/services/rating.service";
import { getRatingsSchema } from "@/lib/validators/rating.validator";
import { ResponseBuilder } from "@/lib/api/response";
import { asyncHandler, validateParams } from "@/lib/api/middleware";

/**
 * GET /api/ratings/[osmId]
 * Get ratings for specific green space
 */
export const GET = asyncHandler(
  async (request: NextRequest, { params }: { params: { osmId: string } }) => {
    // Validate params
    const { osmId } = validateParams(params, getRatingsSchema);

    // Call service layer
    const ratings = await RatingService.getRatingsByOsmId(osmId);

    // Return success response
    return ResponseBuilder.success(ratings);
  }
);
