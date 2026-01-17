import { OverpassQueryOptions } from "./types";

/**
 * Overpass QL Query Builder
 */
export class OverpassQueryBuilder {
  /**
   * Build query for green spaces
   */
  static buildGreenSpaceQuery(options: OverpassQueryOptions): string {
    const { bbox, type, timeout = 25 } = options;
    const { south, west, north, east } = bbox;

    // Bounding box format: (south,west,north,east)
    const bboxStr = `${south},${west},${north},${east}`;

    // Build leisure type filter
    const leisureFilter = this.buildLeisureFilter(type);

    // Overpass QL query
    const query = `
[out:json][timeout:${timeout}];
(
  // Ways (polygons)
  way["leisure"${leisureFilter}](${bboxStr});
  
  // Relations (complex polygons)
  relation["leisure"${leisureFilter}](${bboxStr});
);
// Output with geometry
out geom;
    `.trim();

    return query;
  }

  /**
   * Build leisure type filter
   */
  private static buildLeisureFilter(type?: string): string {
    if (!type || type === "all") {
      // Return all leisure types that are green spaces
      return '~"^(park|forest|garden|recreation_ground|nature_reserve|playground)$"';
    }

    // Return specific type
    return `="${type}"`;
  }

  /**
   * Build query for single element by ID
   */
  static buildElementQuery(
    osmId: number,
    osmType: "node" | "way" | "relation"
  ): string {
    return `
[out:json][timeout:25];
${osmType}(${osmId});
out geom;
    `.trim();
  }

  /**
   * Build query to check if point is inside green space
   */
  static buildPointInPolygonQuery(lat: number, lon: number): string {
    // Search within 100m radius
    const radius = 100;

    return `
[out:json][timeout:25];
(
  way["leisure"~"^(park|forest|garden|recreation_ground|nature_reserve)$"](around:${radius},${lat},${lon});
  relation["leisure"~"^(park|forest|garden|recreation_ground|nature_reserve)$"](around:${radius},${lat},${lon});
);
out geom;
    `.trim();
  }
}

/**
 * Pre-built queries for common use cases
 */
export const OverpassQueries = {
  /**
   * Get all parks in Jakarta
   */
  jakartaParks: () =>
    OverpassQueryBuilder.buildGreenSpaceQuery({
      bbox: {
        south: -6.3745,
        west: 106.6894,
        north: -6.0844,
        east: 106.9799,
      },
      type: "park",
    }),

  /**
   * Get all green spaces in a city
   */
  cityGreenSpaces: (south: number, west: number, north: number, east: number) =>
    OverpassQueryBuilder.buildGreenSpaceQuery({
      bbox: { south, west, north, east },
      type: "all",
    }),
};
