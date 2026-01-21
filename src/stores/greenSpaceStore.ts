import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  GreenSpaceFeature,
  GreenSpaceCollection,
} from "@/types/greenspace";
import { calculateDistance } from "@/lib/utils/haversine";

export type GreenSpaceType =
  | "all"
  | "park"
  | "forest"
  | "garden"
  | "recreation_ground"
  | "nature_reserve"
  | "playground";

export type SizeFilter = "all" | "small" | "medium" | "large";

interface FilterState {
  type: GreenSpaceType;
  sizeFilter: SizeFilter;
  searchQuery: string;
  minRating: number | null;
}

interface GreenSpaceState {
  // Data
  greenSpaces: GreenSpaceFeature[];
  filteredSpaces: GreenSpaceFeature[];
  totalCount: number;
  totalArea: number;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: FilterState;

  // Cache
  isCached: boolean;

  // Fetch timestamps (for removing old data)
  fetchTimestamps: Map<number, number>;

  // Actions - Data
  setGreenSpaces: (collection: GreenSpaceCollection) => void;
  addGreenSpaces: (collection: GreenSpaceCollection) => void;
  clearGreenSpaces: () => void;

  // Actions - Filters
  setTypeFilter: (type: GreenSpaceType) => void;
  setSizeFilter: (size: SizeFilter) => void;
  setSearchQuery: (query: string) => void;
  setMinRating: (rating: number | null) => void;
  resetFilters: () => void;

  // Actions - Loading
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Helper methods
  applyFilters: () => void;
  getSpaceById: (id: number) => GreenSpaceFeature | undefined;
  sortByDistance: (lat?: number, lng?: number) => void;
  sortByName: () => void;
  sortBySize: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  type: "all",
  sizeFilter: "all",
  searchQuery: "",
  minRating: null,
};

const MAX_SPACES = 100;

export const useGreenSpaceStore = create<GreenSpaceState>()(
  devtools(
    (set, get) => ({
      // Initial state
      greenSpaces: [],
      filteredSpaces: [],
      totalCount: 0,
      totalArea: 0,
      isLoading: false,
      error: null,
      filters: DEFAULT_FILTERS,
      isCached: false,
      fetchTimestamps: new Map(),

      // Set green spaces (REPLACE - initial load)
      setGreenSpaces: (collection) => {
        const spaces = collection.features || [];
        const totalArea = spaces.reduce(
          (sum, f) => sum + (f.properties.areaSqkm || 0),
          0,
        );

        const timestamps = new Map<number, number>();
        const now = Date.now();
        spaces.forEach((s) => timestamps.set(s.id, now));

        set({
          greenSpaces: spaces,
          totalCount: spaces.length,
          totalArea: Math.round(totalArea * 10000) / 10000,
          isLoading: false,
          error: null,
          fetchTimestamps: timestamps,
        });

        get().applyFilters();
      },

      // Add green spaces (ACCUMULATE - pan to new area)
      addGreenSpaces: (collection) => {
        const currentSpaces = get().greenSpaces;
        const newSpaces = collection.features || [];
        const timestamps = new Map(get().fetchTimestamps);
        const now = Date.now();

        // Deduplicate by ID
        const existingIds = new Set(currentSpaces.map((s) => s.id));
        const uniqueNewSpaces = newSpaces.filter((s) => !existingIds.has(s.id));

        // Add new spaces
        let merged = [...currentSpaces, ...uniqueNewSpaces];
        uniqueNewSpaces.forEach((s) => timestamps.set(s.id, now));

        // If exceeds max, remove oldest
        if (merged.length > MAX_SPACES) {
          // Sort by timestamp (oldest first)
          const sorted = merged.sort((a, b) => {
            const tsA = timestamps.get(a.id) || 0;
            const tsB = timestamps.get(b.id) || 0;
            return tsA - tsB;
          });

          // Remove oldest
          const toRemove = sorted.slice(0, merged.length - MAX_SPACES);
          toRemove.forEach((s) => timestamps.delete(s.id));

          // Keep newest
          merged = sorted.slice(merged.length - MAX_SPACES);
        }

        const totalArea = merged.reduce(
          (sum, f) => sum + (f.properties.areaSqkm || 0),
          0,
        );

        set({
          greenSpaces: merged,
          totalCount: merged.length,
          totalArea: Math.round(totalArea * 10000) / 10000,
          fetchTimestamps: timestamps,
        });

        get().applyFilters();
      },

      // Clear all data
      clearGreenSpaces: () =>
        set({
          greenSpaces: [],
          filteredSpaces: [],
          totalCount: 0,
          totalArea: 0,
          isCached: false,
          fetchTimestamps: new Map(),
        }),

      // Filter actions
      setTypeFilter: (type) => {
        set((state) => ({
          filters: { ...state.filters, type },
        }));
        get().applyFilters();
      },

      setSizeFilter: (size) => {
        set((state) => ({
          filters: { ...state.filters, sizeFilter: size },
        }));
        get().applyFilters();
      },

      setSearchQuery: (query) => {
        set((state) => ({
          filters: { ...state.filters, searchQuery: query },
        }));
        get().applyFilters();
      },

      setMinRating: (rating) => {
        set((state) => ({
          filters: { ...state.filters, minRating: rating },
        }));
        get().applyFilters();
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS });
        get().applyFilters();
      },

      // Loading states
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error, isLoading: false }),

      // Apply all filters
      applyFilters: () => {
        const { greenSpaces, filters } = get();
        let filtered = [...greenSpaces];

        // Filter by type
        if (filters.type !== "all") {
          filtered = filtered.filter((s) => s.properties.type === filters.type);
        }

        // Filter by size
        if (filters.sizeFilter !== "all") {
          filtered = filtered.filter((s) => {
            const area = s.properties.areaSqkm || 0;
            switch (filters.sizeFilter) {
              case "small":
                return area < 1;
              case "medium":
                return area >= 1 && area <= 5;
              case "large":
                return area > 5;
              default:
                return true;
            }
          });
        }

        // Filter by search query
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase();
          filtered = filtered.filter((s) => {
            const name = s.properties.name?.toLowerCase() || "";
            const type = s.properties.type?.toLowerCase() || "";
            return name.includes(query) || type.includes(query);
          });
        }

        set({ filteredSpaces: filtered });
      },

      // Sort by distance from a point
      sortByDistance: (lat?: number, lng?: number) => {
        const { filteredSpaces } = get();

        // If no coordinates provided, skip sorting (used for manual sort button)
        if (lat === undefined || lng === undefined) {
          return;
        }

        const sorted = [...filteredSpaces].sort((a, b) => {
          // Get first coordinate of each polygon
          const coordsA =
            a.geometry.type === "Polygon"
              ? (a.geometry.coordinates[0] as number[][])[0]
              : (a.geometry.coordinates[0] as number[][][])[0][0];
          const coordsB =
            b.geometry.type === "Polygon"
              ? (b.geometry.coordinates[0] as number[][])[0]
              : (b.geometry.coordinates[0] as number[][][])[0][0];

          const distA = calculateDistance(
            lat,
            lng,
            coordsA[1] as number,
            coordsA[0] as number,
          );
          const distB = calculateDistance(
            lat,
            lng,
            coordsB[1] as number,
            coordsB[0] as number,
          );

          return distA - distB;
        });

        set({ filteredSpaces: sorted });
      },

      // Sort by name (A-Z)
      sortByName: () => {
        const { filteredSpaces } = get();
        const sorted = [...filteredSpaces].sort((a, b) => {
          const nameA = a.properties.name?.toLowerCase() || "";
          const nameB = b.properties.name?.toLowerCase() || "";
          return nameA.localeCompare(nameB);
        });
        set({ filteredSpaces: sorted });
      },

      // Sort by size (largest first)
      sortBySize: () => {
        const { filteredSpaces } = get();
        const sorted = [...filteredSpaces].sort((a, b) => {
          return (b.properties.areaSqkm || 0) - (a.properties.areaSqkm || 0);
        });
        set({ filteredSpaces: sorted });
      },

      // Get space by ID
      getSpaceById: (id) => {
        return get().greenSpaces.find((s) => s.id === id);
      },
    }),
    { name: "GreenSpaceStore" },
  ),
);
