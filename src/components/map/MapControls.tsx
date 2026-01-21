"use client";

import { useMap } from "react-leaflet";
import { useMapStore } from "@/stores/mapStore";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Locate, RotateCcw } from "lucide-react";

export default function MapControls() {
  const map = useMap();
  const { userLocation, zoomToUserLocation, reset, requestUserLocation } =
    useMapStore();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleLocate = async () => {
    if (userLocation) {
      zoomToUserLocation();
    } else {
      await requestUserLocation();
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="absolute right-4 top-4 z-400 flex flex-col gap-2">
      {/* Zoom Controls */}
      <div className="flex flex-col bg-card border rounded-md shadow-lg overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="rounded-none border-b"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="rounded-none"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Locate Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleLocate}
        className="bg-card shadow-lg"
        title="Go to my location"
      >
        <Locate className="h-4 w-4" />
      </Button>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleReset}
        className="bg-card shadow-lg"
        title="Reset view"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
