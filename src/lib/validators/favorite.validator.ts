import { z } from "zod";

/**
 * Coordinates Schema
 */
export const coordinatesSchema = z.tuple([
  z.number().min(-90).max(90), // latitude
  z.number().min(-180).max(180), // longitude
]);

/**
 * Create Favorite Schema
 */
export const createFavoriteSchema = z.object({
  osmId: z.number().int().positive(),
  greenSpaceId: z.number().int().positive(),
  name: z.string().min(1).max(255).optional(),
  coordinates: coordinatesSchema,
});

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;

/**
 * Delete Favorite Schema
 */
export const deleteFavoriteSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type DeleteFavoriteInput = z.infer<typeof deleteFavoriteSchema>;
