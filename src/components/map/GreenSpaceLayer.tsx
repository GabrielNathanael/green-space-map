"use client";

import { useEffect, useRef } from "react";
import { renderToString } from "react-dom/server";
import { GeoJSON } from "react-leaflet";
import { Footprints, Car, Bike, MapPin } from "lucide-react";
import { useGreenSpaceStore } from "@/stores/greenSpaceStore";
import { useMapStore } from "@/stores/mapStore";
import type { GreenSpaceFeature } from "@/types/greenspace";
import type { Layer, Path } from "leaflet";
import L from "leaflet";
import { formatArea, formatType } from "@/lib/utils/format";

// Color mapping by green space type
const TYPE_COLORS: Record<string, string> = {
  park: "#22c55e",
  forest: "#16a34a",
  garden: "#86efac",
  recreation_ground: "#4ade80",
  nature_reserve: "#15803d",
  playground: "#a3e635",
  default: "#10b981",
};

function getColor(type: string): string {
  return TYPE_COLORS[type] || TYPE_COLORS.default;
}

export default function GreenSpaceLayer() {
  const { filteredSpaces } = useGreenSpaceStore();
  const { setSelectedSpaceId, selectedSpaceId, setActiveRoute } = useMapStore();
  const layerRefs = useRef<Map<number, Layer>>(new Map());

  // Open popup when space is selected
  useEffect(() => {
    if (selectedSpaceId !== null) {
      const layer = layerRefs.current.get(selectedSpaceId);
      if (layer) {
        layer.openPopup();
      }
    }
  }, [selectedSpaceId]);

  // Listen for custom event from card click
  useEffect(() => {
    const handleOpenPopup = (event: CustomEvent) => {
      const spaceId = event.detail;
      const layer = layerRefs.current.get(spaceId);
      if (layer) {
        layer.openPopup();
      }
    };

    window.addEventListener(
      "openGreenSpacePopup",
      handleOpenPopup as EventListener,
    );
    return () =>
      window.removeEventListener(
        "openGreenSpacePopup",
        handleOpenPopup as EventListener,
      );
  }, []);

  const handleGetDirections = (
    spaceId: number,
    spaceName: string,
    mode: "foot" | "car" | "bike",
  ) => {
    const space = filteredSpaces.find((s) => s.id === spaceId);
    if (!space) return;

    setActiveRoute({
      spaceId,
      spaceName: spaceName || "Unnamed",
      mode,
    });
  };

  const onEachFeature = (feature: GreenSpaceFeature, layer: Layer) => {
    const { name, type, areaSqkm } = feature.properties;
    const pathLayer = layer as Path;

    // Style polygon
    if (pathLayer.setStyle) {
      pathLayer.setStyle({
        fillColor: getColor(type),
        fillOpacity: 0.5,
        color: getColor(type),
        weight: 2,
        opacity: 0.9,
      });
    }

    // Hover effects
    layer.on({
      mouseover: () => {
        if (pathLayer.setStyle) {
          pathLayer.setStyle({
            fillOpacity: 0.7,
            weight: 3,
          });
        }
      },
      mouseout: () => {
        if (pathLayer.setStyle) {
          pathLayer.setStyle({
            fillOpacity: 0.5,
            weight: 2,
          });
        }
      },
      click: () => {
        setSelectedSpaceId(feature.id);
      },
    });

    // Create popup with routing buttons
    const popup = L.popup({
      minWidth: 300,
      maxWidth: 380,
      closeButton: true,
      className: "custom-leaflet-popup",
    }).setContent(`
      <div class="p-1 px-1.5 overflow-hidden font-inter w-70 sm:w-[320px]">
        <div class="mb-4">
          <h3 class="font-outfit font-bold text-lg text-primary leading-tight m-0 mb-1">${name || "Unnamed"}</h3>
          <div class="flex items-center gap-2 mt-2">
            <span class="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider font-outfit">
              ${formatType(type)}
            </span>
            <span class="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              ${renderToString(<MapPin className="h-2.5 w-2.5" />)}
              ${formatArea(areaSqkm)}
            </span>
          </div>
        </div>
        
        <div class="bg-muted/40 rounded-xl p-4 border border-border/60">
          <p class="text-[10px] font-black mb-3 text-foreground/50 uppercase tracking-[0.15em] font-outfit">Get Directions</p>
          <div class="grid grid-cols-3 gap-3">
            <button 
              onclick="window.getDirections(${feature.id}, '${(name || "").replace(/'/g, "\\'")}', 'foot')"
              class="flex flex-col items-center justify-center gap-2 py-3 px-1 bg-white border border-border shadow-sm rounded-xl hover:bg-primary/5 hover:border-primary/40 hover:shadow-md transition-all active:scale-95 group duration-300"
            >
              <div class="p-2 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                ${renderToString(<Footprints className="h-5 w-5 text-primary" />)}
              </div>
              <span class="text-[10px] font-bold text-foreground font-inter">Walk</span>
            </button>
            <button 
              onclick="window.getDirections(${feature.id}, '${(name || "").replace(/'/g, "\\'")}', 'car')"
              class="flex flex-col items-center justify-center gap-2 py-3 px-1 bg-white border border-border shadow-sm rounded-xl hover:bg-primary/5 hover:border-primary/40 hover:shadow-md transition-all active:scale-95 group duration-300"
            >
              <div class="p-2 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                ${renderToString(<Car className="h-5 w-5 text-primary" />)}
              </div>
              <span class="text-[10px] font-bold text-foreground font-inter">Drive</span>
            </button>
            <button 
              onclick="window.getDirections(${feature.id}, '${(name || "").replace(/'/g, "\\'")}', 'bike')"
              class="flex flex-col items-center justify-center gap-2 py-3 px-1 bg-white border border-border shadow-sm rounded-xl hover:bg-primary/5 hover:border-primary/40 hover:shadow-md transition-all active:scale-95 group duration-300"
            >
              <div class="p-2 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                ${renderToString(<Bike className="h-5 w-5 text-primary" />)}
              </div>
              <span class="text-[10px] font-bold text-foreground font-inter">Bike</span>
            </button>
          </div>
        </div>
      </div>
    `);

    layer.bindPopup(popup);
    layerRefs.current.set(feature.id, layer);

    // Expose function to global scope for popup buttons
    if (typeof window !== "undefined") {
      (window as { getDirections?: typeof handleGetDirections }).getDirections =
        handleGetDirections;
    }
  };

  if (!filteredSpaces.length) return null;

  return (
    <>
      {filteredSpaces.map((space) => (
        <GeoJSON
          key={space.id}
          data={space}
          onEachFeature={(feature, layer) =>
            onEachFeature(feature as GreenSpaceFeature, layer)
          }
        />
      ))}
    </>
  );
}
