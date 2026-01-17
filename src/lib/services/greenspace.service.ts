import db from "@/lib/db";
import { cache } from "@/lib/redis";
import { QueryGreenSpacesInput } from "@/lib/validators/greenspace.validator";
import { NotFoundError, ExternalServiceError } from "@/lib/utils/errors";
import { overpassClient } from "@/lib/overpass/client";
import type { GreenSpaceCollection } from "@/lib/overpass";

/**
 * Green Space Service
 * Handles all business logic for green spaces
 */
export class GreenSpaceService {
  /**
   * Cache TTL: 1 hour (3600s)
   */
  private static CACHE_TTL = 3600;

  /**
   * Get green spaces by bounding box
   */
  static async getGreenSpaces(input: QueryGreenSpacesInput) {
    const { bbox, type, limit, useCache } = input;

    // Generate cache key
    const cacheKey = `greenspaces:${bbox}:${type}:${limit}`;

    // Try cache first if enabled
    if (useCache) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return {
          data: cached,
          meta: {
            cached: true,
            count: (cached as GreenSpaceCollection).features?.length || 0,
          },
        };
      }
    }

    // Parse bbox
    const [south, west, north, east] = bbox.split(",").map(Number);

    // Fetch from Overpass API
    const collection = await overpassClient.queryGreenSpaces({
      bbox: { south, west, north, east },
      type: (type === "all" ? undefined : type) as
        | "park"
        | "forest"
        | "garden"
        | "recreation_ground"
        | "nature_reserve"
        | undefined,
    });

    // Limit results
    const limitedFeatures = collection.features.slice(0, limit);
    const limitedCollection = {
      ...collection,
      features: limitedFeatures,
    };

    // Calculate total area
    const totalArea = limitedFeatures.reduce(
      (sum: number, f) => sum + (f.properties.areaSqkm || 0),
      0
    );

    // Cache the result
    if (useCache) {
      await cache.set(cacheKey, limitedCollection, this.CACHE_TTL);
    }

    return {
      data: limitedCollection,
      meta: {
        cached: false,
        count: limitedFeatures.length,
        totalArea: Math.round(totalArea * 10000) / 10000,
      },
    };
  }

  /**
   * Get single green space by OSM ID
   */
  static async getGreenSpaceById(osmId: number) {
    // Try to find in database first
    const greenSpace = await db.greenSpace.findUnique({
      where: { osmId },
      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    let element = greenSpace;

    // If not in DB, fetch from Overpass API
    if (!greenSpace) {
      try {
        const collection = await overpassClient.queryElement(osmId, "way");

        if (collection.features.length === 0) {
          throw new NotFoundError(`Green space with OSM ID ${osmId} not found`);
        }

        const feature = collection.features[0];

        // Store in database for future queries
        element = await db.greenSpace.create({
          data: {
            osmId: feature.properties.osmId,
            osmType: feature.properties.osmType,
            name: feature.properties.name,
            type: feature.properties.type,
            geometry: feature.geometry,
            areaSqkm: feature.properties.areaSqkm,
          },
          include: {
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        throw new ExternalServiceError(
          "Overpass API",
          "Failed to fetch green space details"
        );
      }
    }

    // Ensure element exists
    if (!element) {
      throw new NotFoundError(`Green space with OSM ID ${osmId} not found`);
    }

    // Calculate average rating
    const ratings = element.ratings || [];
    const averageRating =
      ratings.length > 0
        ? ratings.reduce(
            (sum: number, r: { rating: number }) => sum + r.rating,
            0
          ) / ratings.length
        : 0;

    // Find nearby spaces (within ~1km)
    const nearbySpaces = await this.findNearbySpaces();

    return {
      ...element,
      geometry: element.geometry as object,
      ratings: {
        average: Math.round(averageRating * 10) / 10,
        count: ratings.length,
      },
      nearbySpaces,
    };
  }

  /**
   * Find nearby green spaces
   */
  private static async findNearbySpaces() {
    // TODO: Implement geospatial query
    // For now, return empty array
    return [];
  }

  /**
   * Clear cache by pattern
   */
  static async clearCache(pattern?: string) {
    const deletedCount = await cache.delPattern(pattern || "greenspaces:*");
    return { deletedCount };
  }
}
