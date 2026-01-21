"use client";

import { useEffect, useRef } from "react";
import { useGreenSpaceStore } from "@/stores/greenSpaceStore";
import { useMapStore } from "@/stores/mapStore";
import GreenSpaceCard from "./GreenSpaceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { TreePine, Loader2 } from "lucide-react";

export default function GreenSpaceList() {
  const { filteredSpaces, isLoading, sortByDistance } = useGreenSpaceStore();
  const { userLocation, center } = useMapStore();
  const hasInitialSortRef = useRef(false);

  // Sort by distance ONLY on initial load
  useEffect(() => {
    if (filteredSpaces.length === 0 || hasInitialSortRef.current) return;

    // Use user location if available, fallback to map center
    if (userLocation) {
      sortByDistance(userLocation.lat, userLocation.lng);
    } else {
      sortByDistance(center.lat, center.lng);
    }

    hasInitialSortRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSpaces.length]);

  // Reset sort flag when data changes significantly
  useEffect(() => {
    if (filteredSpaces.length === 0) {
      hasInitialSortRef.current = false;
    }
  }, [filteredSpaces.length]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading green spaces...
          </p>
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (filteredSpaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <TreePine className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No green spaces found</h3>
        <p className="text-sm text-muted-foreground">
          Try moving the map or adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">
          Green Spaces ({filteredSpaces.length})
        </h2>
      </div>

      <div className="space-y-2">
        {filteredSpaces.map((space) => (
          <GreenSpaceCard key={space.id} space={space} />
        ))}
      </div>
    </div>
  );
}
