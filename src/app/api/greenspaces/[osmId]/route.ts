import { NextRequest } from "next/server";
import { GreenSpaceService } from "@/lib/services/greenspace.service";
import { getGreenSpaceSchema } from "@/lib/validators/greenspace.validator";
import { ResponseBuilder } from "@/lib/api/response";
import { asyncHandler, validateParams } from "@/lib/api/middleware";

/**
 * GET /api/greenspaces/[osmId]
 * Get single green space by OSM ID
 */
export const GET = asyncHandler(
  async (_request: NextRequest, context?: { params: { osmId: string } }) => {
    // Validate params
    const { osmId } = validateParams(context?.params, getGreenSpaceSchema);

    // Call service layer
    const greenSpace = await GreenSpaceService.getGreenSpaceById(osmId);

    // Return success response
    return ResponseBuilder.success(greenSpace);
  }
);
