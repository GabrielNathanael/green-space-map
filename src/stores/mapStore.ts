import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface MapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface MapCenter {
  lat: number;
  lng: number;
}

export interface ActiveRoute {
  spaceId: number;
  spaceName: string;
  mode: "foot" | "car" | "bike";
}

interface MapState {
  // Map viewport
  center: MapCenter;
  zoom: number;
  bounds: MapBounds | null;

  // User location
  userLocation: MapCenter | null;
  locationPermission: "granted" | "denied" | "prompt" | null;

  // Selected green space
  selectedSpaceId: number | null;

  // Active route
  activeRoute: ActiveRoute | null;

  // UI state
  isMapReady: boolean;

  // Actions
  setCenter: (center: MapCenter) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: MapBounds) => void;
  setUserLocation: (location: MapCenter | null) => void;
  setLocationPermission: (
    permission: "granted" | "denied" | "prompt" | null,
  ) => void;
  setSelectedSpaceId: (id: number | null) => void;
  setActiveRoute: (route: ActiveRoute | null) => void;
  setMapReady: (ready: boolean) => void;

  // Helper methods
  requestUserLocation: () => Promise<void>;
  zoomToUserLocation: () => void;
  reset: () => void;
}

// Default center: Jakarta (more zoomed in)
const DEFAULT_CENTER: MapCenter = {
  lat: -6.2088,
  lng: 106.8456,
};

const DEFAULT_ZOOM = 15;

export const useMapStore = create<MapState>()(
  devtools(
    (set, get) => ({
      // Initial state
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      bounds: null,
      userLocation: null,
      locationPermission: null,
      selectedSpaceId: null,
      activeRoute: null,
      isMapReady: false,

      // Actions
      setCenter: (center) => {
        console.log("🗺️ MapStore: setCenter called with", center);
        set({ center });
      },
      setZoom: (zoom) => {
        console.log("🔍 MapStore: setZoom called with", zoom);
        set({ zoom });
      },
      setBounds: (bounds) => set({ bounds }),
      setUserLocation: (location) => set({ userLocation: location }),
      setLocationPermission: (permission) =>
        set({ locationPermission: permission }),
      setSelectedSpaceId: (id) => set({ selectedSpaceId: id }),
      setActiveRoute: (route) => set({ activeRoute: route }),
      setMapReady: (ready) => set({ isMapReady: ready }),

      // Request user location (GPS)
      requestUserLocation: async () => {
        console.log("📡 Requesting user location...");

        if (!navigator.geolocation) {
          console.warn("⚠️ Geolocation not supported");
          set({ locationPermission: "denied" });
          return;
        }

        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
              });
            },
          );

          const userLocation: MapCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          console.log("✅ GPS location obtained:", userLocation);

          // OPTION A: Always use GPS as center
          set({
            userLocation,
            locationPermission: "granted",
            center: userLocation, // Override center with GPS
            zoom: 15,
          });

          console.log("🗺️ Map centered to GPS location");
        } catch (error) {
          console.error("❌ Failed to get user location:", error);

          // More detailed error logging
          if (error instanceof GeolocationPositionError) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                console.warn("🚫 User denied location permission");
                break;
              case error.POSITION_UNAVAILABLE:
                console.warn("📍 Location unavailable");
                break;
              case error.TIMEOUT:
                console.warn("⏱️ Location request timeout");
                break;
            }
          }

          set({ locationPermission: "denied" });
        }
      },

      // Zoom to user location
      zoomToUserLocation: () => {
        const { userLocation } = get();
        if (userLocation) {
          set({
            center: userLocation,
            zoom: 15,
          });
        }
      },

      // Reset to default
      reset: () => {
        const { userLocation } = get();
        set({
          center: userLocation || DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          bounds: null,
          selectedSpaceId: null,
          activeRoute: null,
        });
      },
    }),
    { name: "MapStore" },
  ),
);
