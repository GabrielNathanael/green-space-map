"use client";

import { useEffect, useState } from "react";
import { Polyline, Popup } from "react-leaflet";
import { useMapStore } from "@/stores/mapStore";
import { useGreenSpaceStore } from "@/stores/greenSpaceStore";
import {
  RoutingService,
  type RouteResult,
} from "@/lib/services/routing.service";
import { calculateCentroid } from "@/lib/utils/geometry";
import { toast } from "sonner";

export default function RouteLayer() {
  const { activeRoute, userLocation, setActiveRoute } = useMapStore();
  const { getSpaceById } = useGreenSpaceStore();
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!activeRoute) {
        setRoute(null);
        return;
      }

      if (!userLocation) {
        toast.error("Location required", {
          description: "Please enable location to get directions",
        });
        setActiveRoute(null);
        return;
      }

      const space = getSpaceById(activeRoute.spaceId);
      if (!space) {
        toast.error("Green space not found");
        setActiveRoute(null);
        return;
      }

      try {
        setIsLoading(true);
        const loadingToast = toast.loading("Calculating route...");

        const centroid = calculateCentroid(space.geometry);
        const result = await RoutingService.getRoute(
          userLocation,
          { lat: centroid[1], lng: centroid[0] },
          activeRoute.mode,
        );

        setRoute(result);

        toast.dismiss(loadingToast);
        toast.success("Route calculated", {
          description: `${RoutingService.formatDistance(result.distance)} • ${RoutingService.formatDuration(result.duration)}`,
        });
      } catch (error) {
        console.error("Routing error:", error);
        toast.error("Failed to calculate route", {
          description: "Please try again or choose a different mode",
        });
        setActiveRoute(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoute();
  }, [activeRoute, userLocation, getSpaceById, setActiveRoute]);

  if (!route || isLoading) return null;

  // Convert coordinates to Leaflet format [lat, lng]
  const positions: [number, number][] = route.coordinates.map((coord) => [
    coord[1],
    coord[0],
  ]);

  // Route color by mode
  const colors = {
    foot: "#3b82f6",
    car: "#22c55e",
    bike: "#f97316",
  };

  const modeLabels = {
    foot: "Walking",
    car: "Driving",
    bike: "Cycling",
  };

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: colors[route.mode],
          weight: 5,
          opacity: 0.7,
        }}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold mb-1">
              Route to {activeRoute?.spaceName}
            </h3>
            <p className="text-sm">
              <strong>Mode:</strong> {modeLabels[route.mode]}
            </p>
            <p className="text-sm">
              <strong>Distance:</strong>{" "}
              {RoutingService.formatDistance(route.distance)}
            </p>
            <p className="text-sm">
              <strong>Duration:</strong>{" "}
              {RoutingService.formatDuration(route.duration)}
            </p>
            <button
              onClick={() => setActiveRoute(null)}
              className="mt-2 w-full px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            >
              Clear Route
            </button>
          </div>
        </Popup>
      </Polyline>
    </>
  );
}
