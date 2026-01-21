import type { Geometry } from "@/types/greenspace";

/**
 * Calculate centroid of a polygon or multipolygon
 * Returns [lng, lat]
 */
export function calculateCentroid(geometry: Geometry): [number, number] {
  if (geometry.type === "Polygon") {
    return getPolygonCentroid(geometry.coordinates[0] as [number, number][]);
  } else if (geometry.type === "MultiPolygon") {
    // Get centroid of first polygon
    return getPolygonCentroid(geometry.coordinates[0][0] as [number, number][]);
  }

  // Fallback to first coordinate
  return geometry.coordinates[0][0] as unknown as [number, number];
}

/**
 * Calculate centroid of a single polygon ring
 */
function getPolygonCentroid(
  coordinates: number[][] | [number, number][],
): [number, number] {
  let totalLng = 0;
  let totalLat = 0;
  const count = coordinates.length;

  for (const coord of coordinates) {
    totalLng += coord[0];
    totalLat += coord[1];
  }

  return [totalLng / count, totalLat / count];
}
