import { z } from "zod";

/**
 * Greenspace Type Enum
 */
export const GreenSpaceType = z.enum([
  "park",
  "forest",
  "garden",
  "recreation_ground",
  "nature_reserve",
  "playground",
  "all",
]);

/**
 * Bounding Box Schema
 */
export const bboxSchema = z.string().refine(
  (val) => {
    const parts = val.split(",");
    if (parts.length !== 4) return false;

    const [south, west, north, east] = parts.map(Number);

    // Check if all are valid numbers
    if ([south, west, north, east].some(isNaN)) return false;

    // Validate ranges
    if (south < -90 || south > 90) return false;
    if (north < -90 || north > 90) return false;
    if (west < -180 || west > 180) return false;
    if (east < -180 || east > 180) return false;

    // Check if south < north and west < east
    if (south >= north || west >= east) return false;

    return true;
  },
  { message: "Invalid bbox format. Use: south,west,north,east" }
);

/**
 * Query Green Spaces Schema
 */
export const queryGreenSpacesSchema = z.object({
  bbox: bboxSchema,
  type: GreenSpaceType.optional().default("all"),
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
  useCache: z.coerce.boolean().optional().default(true),
});

export type QueryGreenSpacesInput = z.infer<typeof queryGreenSpacesSchema>;

/**
 * Get Single Green Space Schema
 */
export const getGreenSpaceSchema = z.object({
  osmId: z.coerce.number().int().positive(),
});

export type GetGreenSpaceInput = z.infer<typeof getGreenSpaceSchema>;
