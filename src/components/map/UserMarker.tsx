"use client";

import { CircleMarker, Popup } from "react-leaflet";
import { useMapStore } from "@/stores/mapStore";

export default function UserMarker() {
  const { userLocation } = useMapStore();

  if (!userLocation) return null;

  return (
    <CircleMarker
      center={[userLocation.lat, userLocation.lng]}
      radius={8}
      pathOptions={{
        fillColor: "#3b82f6",
        fillOpacity: 0.8,
        color: "#ffffff",
        weight: 2,
      }}
    >
      <Popup>
        <div className="text-sm">
          <strong>Your Location</strong>
          <p className="text-xs text-muted-foreground mt-1">
            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        </div>
      </Popup>
    </CircleMarker>
  );
}
