"use client";

import { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useMapStore } from "@/stores/mapStore";
import { useGreenSpaceStore } from "@/stores/greenSpaceStore";
import { useDebounce } from "@/hooks/useDebounce";
import GreenSpaceLayer from "./GreenSpaceLayer";
import UserMarker from "./UserMarker";
import MapControls from "./MapControls";
import RouteLayer from "./RouteLayer";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

// Component untuk sync map state dengan store
function MapStateSync() {
  const map = useMap();
  const { setCenter, setZoom, setBounds, setMapReady, center, zoom } =
    useMapStore();
  const { lat, lng } = center;

  useMapEvents({
    moveend: () => {
      const mapCenter = map.getCenter();
      const mapZoom = map.getZoom();
      const bounds = map.getBounds();

      setCenter({ lat: mapCenter.lat, lng: mapCenter.lng });
      setZoom(mapZoom);
      setBounds({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    },
  });

  // React to center/zoom changes from store
  useEffect(() => {
    console.log("🔄 Store center/zoom changed, updating map:", {
      lat,
      lng,
      zoom,
    });
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);

  useEffect(() => {
    setMapReady(true);
    return () => setMapReady(false);
  }, [setMapReady]);

  return null;
}

// Component untuk auto-fetch data berdasarkan bounds (SMART FETCHING)
function AutoFetchData() {
  const { bounds, locationPermission } = useMapStore();
  const { setGreenSpaces, addGreenSpaces, setLoading, setError, filters } =
    useGreenSpaceStore();

  // Track previous bounds and fetch history
  const prevBoundsRef = useRef<{
    south: number;
    west: number;
    north: number;
    east: number;
  } | null>(null);
  const fetchHistoryRef = useRef<number[]>([]); // timestamps
  const isInitialFetchRef = useRef(true);
  const toastIdRef = useRef<string | number | null>(null);

  // Debounce bounds changes (2 seconds)
  const debouncedBounds = useDebounce(bounds, 2000);

  // Check if user moved >50% of viewport (out of area)
  const hasMovedSignificantly = useCallback(
    (prev: typeof bounds, current: typeof bounds): boolean => {
      if (!prev || !current) return false;

      const prevWidth = prev.east - prev.west;
      const prevHeight = prev.north - prev.south;

      const latDiff =
        Math.abs(prev.north + prev.south - (current.north + current.south)) / 2;
      const lngDiff =
        Math.abs(prev.east + prev.west - (current.east + current.west)) / 2;

      // Check if center moved >50% of viewport
      return latDiff > prevHeight * 0.5 || lngDiff > prevWidth * 0.5;
    },
    [],
  );

  // Check rate limit (max 3 fetches per minute)
  const canFetch = (): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old timestamps
    fetchHistoryRef.current = fetchHistoryRef.current.filter(
      (ts) => ts > oneMinuteAgo,
    );

    return fetchHistoryRef.current.length < 3;
  };

  useEffect(() => {
    const fetchGreenSpaces = async () => {
      if (!debouncedBounds || locationPermission !== "granted") return;

      // Initial fetch - always fetch
      if (isInitialFetchRef.current) {
        isInitialFetchRef.current = false;
      } else {
        // Subsequent fetches - check conditions
        const movedSignificantly = hasMovedSignificantly(
          prevBoundsRef.current,
          debouncedBounds,
        );

        // Skip if didn't move significantly
        if (!movedSignificantly) {
          return;
        }

        // Check rate limit
        if (!canFetch()) {
          toast.error("Too many requests", {
            description: "Please wait a moment before moving to a new area",
          });
          return;
        }
      }

      try {
        setLoading(true);

        // Show loading toast
        toastIdRef.current = toast.loading(
          "Fetching green spaces in this area...",
        );

        const bboxStr = `${debouncedBounds.south},${debouncedBounds.west},${debouncedBounds.north},${debouncedBounds.east}`;

        const params = new URLSearchParams({
          bbox: bboxStr,
          type: filters.type,
          limit: "100",
          useCache: "true",
        });

        // Add 15 second timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
          const response = await fetch(`/api/greenspaces?${params}`, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to fetch green spaces");
          }

          const result = await response.json();

          // Use setGreenSpaces for initial, addGreenSpaces for subsequent
          if (prevBoundsRef.current === null) {
            setGreenSpaces(result.data);
          } else {
            addGreenSpaces(result.data);
          }

          // Update previous bounds
          prevBoundsRef.current = debouncedBounds;

          // Add to fetch history
          fetchHistoryRef.current.push(Date.now());

          // Dismiss loading toast and show success
          if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
          }
          toast.success(`Loaded ${result.meta.count} green spaces`);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            throw new Error(
              "Request timed out. The map area might be too large or the server is busy.",
            );
          }
          throw fetchError;
        }
      } catch (error) {
        console.error("Error fetching green spaces:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);

        // Dismiss loading toast and show error with retry description
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
        }
        toast.error("Fetch Failed", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGreenSpaces();
  }, [
    debouncedBounds,
    filters.type,
    locationPermission,
    setGreenSpaces,
    addGreenSpaces,
    setLoading,
    setError,
    hasMovedSignificantly,
  ]);

  return null;
}

export default function LeafletMap() {
  const { center, zoom, requestUserLocation, locationPermission } =
    useMapStore();

  // Request user location on mount (Option A: Always GPS)
  useEffect(() => {
    console.log("🚀 LeafletMap mounted, requesting GPS...");
    requestUserLocation();
  }, [requestUserLocation]);

  // Log when GPS is granted
  useEffect(() => {
    if (locationPermission === "granted") {
      console.log("✅ GPS permission granted");
    }
  }, [locationPermission]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={false}
    >
      {/* CartoDB Positron - Clean & Modern */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />

      {/* Map State Sync */}
      <MapStateSync />

      {/* Auto Fetch Data */}
      <AutoFetchData />

      {/* Green Space Polygons */}
      <GreenSpaceLayer />

      {/* User Location Marker */}
      <UserMarker />

      {/* Route Layer */}
      <RouteLayer />

      {/* Map Controls */}
      <MapControls />
    </MapContainer>
  );
}
