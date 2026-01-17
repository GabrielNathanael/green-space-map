/**
 * Overpass API Response Types
 */

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  nodes?: number[];
  members?: OverpassMember[];
  geometry?: OverpassGeometry[];
}

export interface OverpassMember {
  type: "node" | "way" | "relation";
  ref: number;
  role: string;
  lat?: number;
  lon?: number;
}

export interface OverpassGeometry {
  lat: number;
  lon: number;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    copyright: string;
  };
  elements: OverpassElement[];
}

/**
 * Query Options
 */
export interface OverpassQueryOptions {
  bbox: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
  type?:
    | "park"
    | "forest"
    | "garden"
    | "recreation_ground"
    | "nature_reserve"
    | "all";
  timeout?: number;
}

/**
 * Green Space Feature (GeoJSON)
 */
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
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface GreenSpaceCollection {
  type: "FeatureCollection";
  features: GreenSpaceFeature[];
}
