import { NextRequest } from "next/server";
import { GreenSpaceService } from "@/lib/services/greenspace.service";
import { queryGreenSpacesSchema } from "@/lib/validators/greenspace.validator";
import { ResponseBuilder } from "@/lib/api/response";
import { asyncHandler, validateQuery } from "@/lib/api/middleware";

/**
 * GET /api/greenspaces
 * Query green spaces by bounding box
 */
export const GET = asyncHandler(async (request: NextRequest) => {
  // Validate query parameters
  const query = validateQuery(request, queryGreenSpacesSchema);

  // Call service layer
  const result = await GreenSpaceService.getGreenSpaces(query);

  // Return success response
  return ResponseBuilder.success(result.data, result.meta);
});
