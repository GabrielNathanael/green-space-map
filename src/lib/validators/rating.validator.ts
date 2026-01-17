import { z } from "zod";

/**
 * Create Rating Schema
 */
export const createRatingSchema = z.object({
  osmId: z.number().int().positive(),
  greenSpaceId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;

/**
 * Get Ratings Schema
 */
export const getRatingsSchema = z.object({
  osmId: z.coerce.number().int().positive(),
});

export type GetRatingsInput = z.infer<typeof getRatingsSchema>;
