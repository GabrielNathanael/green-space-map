import {
  OverpassResponse,
  OverpassElement,
  GreenSpaceFeature,
  GreenSpaceCollection,
} from "./types";

/**
 * Overpass Response Parser
 */
export class OverpassParser {
  /**
   * Parse Overpass response to GeoJSON FeatureCollection
   */
  static parseToGeoJSON(response: OverpassResponse): GreenSpaceCollection {
    const features: GreenSpaceFeature[] = [];

    for (const element of response.elements) {
      try {
        const feature = this.parseElement(element);
        if (feature) {
          features.push(feature);
        }
      } catch (error) {
        console.warn(`Failed to parse element ${element.id}:`, error);
        // Continue with next element
      }
    }

    return {
      type: "FeatureCollection",
      features,
    };
  }

  /**
   * Parse single Overpass element to GeoJSON Feature
   */
  private static parseElement(
    element: OverpassElement
  ): GreenSpaceFeature | null {
    // Skip nodes (we only want ways and relations for green spaces)
    if (element.type === "node") {
      return null;
    }

    // Extract coordinates
    const coordinates = this.extractCoordinates(element);
    if (!coordinates) {
      return null;
    }

    // Determine geometry type
    const geometryType = Array.isArray(coordinates[0][0][0])
      ? "MultiPolygon"
      : "Polygon";

    // Calculate area
    const areaSqkm = this.calculateArea(coordinates);

    // Get green space type
    const type = element.tags?.leisure || "unknown";

    // Build feature
    const feature: GreenSpaceFeature = {
      type: "Feature",
      id: element.id,
      properties: {
        osmId: element.id,
        osmType: element.type,
        name: element.tags?.name || null,
        type,
        areaSqkm,
        tags: element.tags,
      },
      geometry: {
        type: geometryType,
        coordinates: coordinates as number[][][] | number[][][][],
      },
    };

    return feature;
  }

  /**
   * Extract coordinates from Overpass element
   */
  private static extractCoordinates(
    element: OverpassElement
  ): number[][][] | number[][][][] | null {
    if (!element.geometry || element.geometry.length === 0) {
      return null;
    }

    // Convert geometry array to coordinate array
    const coords = element.geometry.map((point) => [point.lon, point.lat]);

    // Close polygon if not closed
    if (
      coords.length > 0 &&
      (coords[0][0] !== coords[coords.length - 1][0] ||
        coords[0][1] !== coords[coords.length - 1][1])
    ) {
      coords.push(coords[0]);
    }

    // Return as polygon (outer ring only for now)
    return [coords];
  }

  /**
   * Calculate area in square kilometers using Shoelace formula
   */
  private static calculateArea(
    coordinates: number[][][] | number[][][][]
  ): number {
    try {
      // Handle MultiPolygon
      if (Array.isArray(coordinates[0][0][0])) {
        const multiPoly = coordinates as number[][][][];
        return multiPoly.reduce((sum, poly) => {
          return sum + this.calculatePolygonArea(poly[0]);
        }, 0);
      }

      // Handle Polygon
      const poly = coordinates as number[][][];
      return this.calculatePolygonArea(poly[0]);
    } catch (error) {
      console.warn("Failed to calculate area:", error);
      return 0;
    }
  }

  /**
   * Calculate polygon area using Shoelace formula
   * Converts to approximate square kilometers
   */
  private static calculatePolygonArea(coords: number[][]): number {
    if (coords.length < 3) return 0;

    let area = 0;

    // Shoelace formula
    for (let i = 0; i < coords.length - 1; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[i + 1];
      area += x1 * y2 - x2 * y1;
    }

    area = Math.abs(area / 2);

    // Convert from degrees² to km²
    // Approximate: 1 degree latitude ≈ 111 km
    // 1 degree longitude ≈ 111 km * cos(latitude)
    // For Jakarta area (~6°S), cos(6°) ≈ 0.995
    const avgLat =
      coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
    const kmPerDegLon = 111.32 * Math.cos((avgLat * Math.PI) / 180);
    const kmPerDegLat = 110.574;

    const areaKm2 = area * kmPerDegLon * kmPerDegLat;

    return Math.round(areaKm2 * 10000) / 10000; // Round to 4 decimals
  }

  /**
   * Extract unique green space types from response
   */
  static extractTypes(response: OverpassResponse): string[] {
    const types = new Set<string>();

    for (const element of response.elements) {
      if (element.tags?.leisure) {
        types.add(element.tags.leisure);
      }
    }

    return Array.from(types).sort();
  }

  /**
   * Filter features by type
   */
  static filterByType(
    collection: GreenSpaceCollection,
    type: string
  ): GreenSpaceCollection {
    if (type === "all") {
      return collection;
    }

    return {
      ...collection,
      features: collection.features.filter((f) => f.properties.type === type),
    };
  }

  /**
   * Sort features by area (largest first)
   */
  static sortByArea(collection: GreenSpaceCollection): GreenSpaceCollection {
    return {
      ...collection,
      features: [...collection.features].sort(
        (a, b) => b.properties.areaSqkm - a.properties.areaSqkm
      ),
    };
  }
}
