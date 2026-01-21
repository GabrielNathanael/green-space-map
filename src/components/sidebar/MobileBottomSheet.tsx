"use client";

import { useState, useEffect } from "react";
import { useGreenSpaceStore } from "@/stores/greenSpaceStore";
import GreenSpaceCard from "./GreenSpaceCard";
import { ChevronUp, ChevronDown, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileBottomSheet() {
  const { filteredSpaces, isLoading } = useGreenSpaceStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render on desktop or before mounting
  if (!isMounted || window.innerWidth >= 768) {
    return null;
  }

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl z-50 md:hidden transition-transform duration-300",
          isExpanded ? "translate-y-0" : "translate-y-[calc(100%-120px)]",
        )}
        style={{ maxHeight: "85vh" }}
      >
        {/* Handle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 flex flex-col items-center gap-2 border-b"
        >
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="font-semibold">
              {filteredSpaces.length} Green Spaces
            </span>
          </div>
        </button>

        {/* Content */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(85vh - 60px)" }}
        >
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading...
            </div>
          ) : filteredSpaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <TreePine className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No green spaces found
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredSpaces.map((space) => (
                <GreenSpaceCard
                  key={space.id}
                  space={space}
                  onClick={() => setIsExpanded(false)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
