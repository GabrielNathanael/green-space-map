import { OverpassQueryBuilder } from "./queries";
import { OverpassParser } from "./parser";
import { retryWithBackoff } from "./retry";
import type {
  OverpassResponse,
  OverpassQueryOptions,
  GreenSpaceCollection,
} from "./types";

/**
 * Overpass Client Configuration
 */
export interface OverpassClientConfig {
  endpoint?: string;
  timeout?: number;
  userAgent?: string;
}

/**
 * Overpass API Client
 */
export class OverpassClient {
  private endpoint: string;
  private timeout: number;
  private userAgent: string;

  constructor(config: OverpassClientConfig = {}) {
    this.endpoint =
      config.endpoint || "https://overpass-api.de/api/interpreter";
    this.timeout = config.timeout || 30000; // 30 seconds
    this.userAgent = config.userAgent || "GreenSpaceMap/1.0";
  }

  /**
   * Execute Overpass query
   */
  private async executeQuery(query: string): Promise<OverpassResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await retryWithBackoff(async () => {
        const res = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": this.userAgent,
          },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(
            `Overpass API error: ${res.status} ${res.statusText}`
          );
        }

        return res.json();
      });

      return response as OverpassResponse;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Query green spaces by bounding box
   */
  async queryGreenSpaces(
    options: OverpassQueryOptions
  ): Promise<GreenSpaceCollection> {
    const query = OverpassQueryBuilder.buildGreenSpaceQuery(options);
    const response = await this.executeQuery(query);
    return OverpassParser.parseToGeoJSON(response);
  }

  /**
   * Query single element by ID
   */
  async queryElement(
    osmId: number,
    osmType: "node" | "way" | "relation"
  ): Promise<GreenSpaceCollection> {
    const query = OverpassQueryBuilder.buildElementQuery(osmId, osmType);
    const response = await this.executeQuery(query);
    return OverpassParser.parseToGeoJSON(response);
  }

  /**
   * Check if a point is inside a green space
   */
  async queryPointInPolygon(
    lat: number,
    lon: number
  ): Promise<GreenSpaceCollection> {
    const query = OverpassQueryBuilder.buildPointInPolygonQuery(lat, lon);
    const response = await this.executeQuery(query);
    return OverpassParser.parseToGeoJSON(response);
  }
}

/**
 * Default Overpass client instance
 */
export const overpassClient = new OverpassClient();
