export type RoutingMode = "foot" | "car" | "bike";

export interface RouteResult {
  coordinates: [number, number][]; // GeoJSON LineString coordinates
  distance: number; // in meters
  duration: number; // in seconds
  mode: RoutingMode;
}

/**
 * Routing Service using OSRM free API
 */
export class RoutingService {
  private static readonly BASE_URL = "https://router.project-osrm.org";

  /**
   * Get route from point A to point B
   */
  static async getRoute(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
    mode: RoutingMode = "foot",
  ): Promise<RouteResult> {
    // OSRM profiles mapping
    const profiles: Record<RoutingMode, string> = {
      foot: "foot",
      car: "car",
      bike: "bike",
    };

    const profile = profiles[mode] || "foot";

    // OSRM uses lng,lat format
    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const url = `${this.BASE_URL}/route/v1/${profile}/${coords}?overview=full&geometries=geojson`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new Error("No route found");
      }

      const route = data.routes[0];

      return {
        coordinates: route.geometry.coordinates,
        distance: route.distance, // meters
        duration: route.duration, // seconds
        mode,
      };
    } catch (error) {
      console.error("Routing error:", error);
      throw new Error("Failed to calculate route");
    }
  }

  /**
   * Format duration for display
   */
  static formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  /**
   * Format distance for display
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }
}
