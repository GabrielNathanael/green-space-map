import db from "@/lib/db";
import { CreateRatingInput } from "@/lib/validators/rating.validator";

/**
 * Rating Service
 * Handles all business logic for ratings
 */
export class RatingService {
  /**
   * Create or update rating
   */
  static async createRating(userId: string, input: CreateRatingInput) {
    const { osmId, greenSpaceId, rating, comment } = input;

    // Check if user already rated this space
    const existing = await db.rating.findUnique({
      where: {
        userId_greenSpaceId: {
          userId,
          greenSpaceId,
        },
      },
    });

    if (existing) {
      // Update existing rating
      const updated = await db.rating.update({
        where: { id: existing.id },
        data: {
          rating,
          comment: comment || null,
          updatedAt: new Date(),
        },
      });

      return { ...updated, isUpdate: true };
    }

    // Create new rating
    const newRating = await db.rating.create({
      data: {
        userId,
        greenSpaceId,
        osmId,
        rating,
        comment: comment || null,
      },
    });

    return { ...newRating, isUpdate: false };
  }

  /**
   * Get ratings for a green space
   */
  static async getRatingsByOsmId(osmId: number) {
    const ratings = await db.rating.findMany({
      where: { osmId },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics
    const total = ratings.length;
    const sum = ratings.reduce(
      (acc: number, r: { rating: number }) => acc + r.rating,
      0
    );
    const average = total > 0 ? sum / total : 0;

    // Distribution
    const distribution = {
      1: ratings.filter((r: { rating: number }) => r.rating === 1).length,
      2: ratings.filter((r: { rating: number }) => r.rating === 2).length,
      3: ratings.filter((r: { rating: number }) => r.rating === 3).length,
      4: ratings.filter((r: { rating: number }) => r.rating === 4).length,
      5: ratings.filter((r: { rating: number }) => r.rating === 5).length,
    };

    // Recent reviews (top 10)
    const recent = ratings
      .slice(0, 10)
      .map(
        (r: {
          rating: number;
          comment: string | null;
          user: { name: string | null; avatarUrl: string | null };
          createdAt: Date;
        }) => ({
          rating: r.rating,
          comment: r.comment,
          userName: r.user.name,
          userAvatar: r.user.avatarUrl,
          createdAt: r.createdAt.toISOString(),
        })
      );

    return {
      average: Math.round(average * 10) / 10,
      count: total,
      distribution,
      recent,
    };
  }

  /**
   * Get user's rating for a specific green space
   */
  static async getUserRating(userId: string, greenSpaceId: number) {
    const rating = await db.rating.findUnique({
      where: {
        userId_greenSpaceId: {
          userId,
          greenSpaceId,
        },
      },
    });

    return rating;
  }
}
