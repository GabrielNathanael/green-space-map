"use client";

import { useMapStore } from "@/stores/mapStore";
import type { GreenSpaceFeature } from "@/types/greenspace";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { calculateCentroid } from "@/lib/utils/geometry";
import { calculateDistance, formatDistance } from "@/lib/utils/haversine";

import { formatArea, formatType } from "@/lib/utils/format";

interface GreenSpaceCardProps {
  space: GreenSpaceFeature;
  onClick?: () => void;
}

export default function GreenSpaceCard({
  space,
  onClick,
}: GreenSpaceCardProps) {
  const {
    setSelectedSpaceId,
    setCenter,
    setZoom,
    selectedSpaceId,
    userLocation,
    center,
  } = useMapStore();

  const handleClick = () => {
    console.log("🔵 Card clicked:", space.properties.name || "Unnamed");

    // Set selected space
    setSelectedSpaceId(space.id);
    console.log("✅ Selected space ID:", space.id);

    // Get centroid of polygon
    const centroid = calculateCentroid(space.geometry);
    console.log("📍 Centroid calculated:", {
      lat: centroid[1],
      lng: centroid[0],
    });

    // Pan to centroid
    const newCenter = { lat: centroid[1], lng: centroid[0] };
    setCenter(newCenter);
    console.log("🗺️ Map center set to:", newCenter);

    // Zoom in
    setZoom(16);
    console.log("🔍 Zoom set to: 16");

    // Trigger popup open via custom event
    window.dispatchEvent(
      new CustomEvent("openGreenSpacePopup", { detail: space.id }),
    );

    // Close mobile sheet if callback provided
    onClick?.();
  };

  const isSelected = selectedSpaceId === space.id;

  // Calculate distance from user or map center
  const getDistance = (): string | null => {
    const centroid = calculateCentroid(space.geometry);
    const refPoint = userLocation || center;

    const distance = calculateDistance(
      refPoint.lat,
      refPoint.lng,
      centroid[1],
      centroid[0],
    );

    return formatDistance(distance);
  };

  const distance = getDistance();

  return (
    <Card
      className={`p-3 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">
            {space.properties.name || "Unnamed"}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {formatType(space.properties.type)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatArea(space.properties.areaSqkm)}
            </span>
            {distance && (
              <span className="text-xs text-primary font-medium">
                {distance} away
              </span>
            )}
          </div>
        </div>
        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </Card>
  );
}
