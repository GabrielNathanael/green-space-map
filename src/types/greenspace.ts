/**
 * Green Space Types (from Overpass API)
 */

export interface Geometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

export interface GreenSpaceFeature {
  type: "Feature";
  id: number;
  properties: {
    osmId: number;
    osmType: string;
    name: string | null;
    type: string;
    areaSqkm: number;
    district?: string;
    tags?: Record<string, string>;
  };
  geometry: Geometry;
}

export interface GreenSpaceCollection {
  type: "FeatureCollection";
  features: GreenSpaceFeature[];
}

/**
 * API Response Types
 */

export interface GreenSpaceAPIResponse {
  data: GreenSpaceCollection;
  meta: {
    cached: boolean;
    count: number;
    totalArea?: number;
  };
}

export interface GreenSpaceDetailResponse {
  id: number;
  osmId: number;
  osmType: string;
  name: string | null;
  type: string;
  geometry: Geometry;
  areaSqkm: number;
  district?: string | null;
  city?: string | null;
  ratings: {
    average: number;
    count: number;
  };
  nearbySpaces: Array<{
    id: number;
    name: string | null;
    distance: number;
  }>;
}

/**
 * Query Parameters
 */

export interface GreenSpaceQueryParams {
  bbox: string; // "south,west,north,east"
  type?: string;
  limit?: number;
  useCache?: boolean;
}
