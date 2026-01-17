import db from "@/lib/db";
import { CreateFavoriteInput } from "@/lib/validators/favorite.validator";
import { ConflictError, NotFoundError } from "@/lib/utils/errors";

/**
 * Favorite Service
 * Handles all business logic for user favorites
 */
export class FavoriteService {
  /**
   * Get all favorites for a user
   */
  static async getUserFavorites(userId: string) {
    const favorites = await db.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return favorites;
  }

  /**
   * Add favorite
   */
  static async addFavorite(userId: string, input: CreateFavoriteInput) {
    const { osmId, greenSpaceId, name, coordinates } = input;

    // Check if already favorited
    const existing = await db.favorite.findUnique({
      where: {
        userId_greenSpaceId: {
          userId,
          greenSpaceId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Green space already in favorites");
    }

    // Create favorite
    const favorite = await db.favorite.create({
      data: {
        userId,
        greenSpaceId,
        osmId,
        name: name || null,
        coordinates,
      },
    });

    return favorite;
  }

  /**
   * Remove favorite
   */
  static async removeFavorite(userId: string, favoriteId: number) {
    // Check if favorite exists and belongs to user
    const favorite = await db.favorite.findFirst({
      where: {
        id: favoriteId,
        userId,
      },
    });

    if (!favorite) {
      throw new NotFoundError("Favorite not found");
    }

    // Delete favorite
    await db.favorite.delete({
      where: { id: favoriteId },
    });

    return { success: true };
  }

  /**
   * Check if green space is favorited by user
   */
  static async isFavorited(userId: string, greenSpaceId: number) {
    const favorite = await db.favorite.findUnique({
      where: {
        userId_greenSpaceId: {
          userId,
          greenSpaceId,
        },
      },
    });

    return !!favorite;
  }
}
