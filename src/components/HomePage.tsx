"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import FilterPanel from "@/components/filters/FilterPanel";
import GreenSpaceList from "@/components/sidebar/GreenSpaceList";
import MobileBottomSheet from "@/components/sidebar/MobileBottomSheet";
import MobileFilterButton from "@/components/filters/MobileFilterButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GPSPermissionModal from "@/components/GPSPermissionModal";

// Dynamic import untuk Map (karena Leaflet butuh window object)
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <GPSPermissionModal />
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Green Space List */}
        <aside
          className={cn(
            "border-r bg-card transition-all duration-300 ease-in-out relative z-30 h-full overflow-y-auto hidden lg:block",
            isSidebarCollapsed
              ? "w-0 invisible -translate-x-full"
              : "w-80 visible translate-x-0",
          )}
        >
          <GreenSpaceList />
        </aside>

        {/* Sidebar Toggle - Desktop */}
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "absolute top-1/2 -translate-y-1/2 z-40 h-10 w-6 rounded-l-none rounded-r-xl shadow-md border-y border-r transition-all duration-300 hidden lg:flex items-center justify-center bg-card hover:bg-accent",
            isSidebarCollapsed ? "left-0" : "left-80",
          )}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Mobile Components - hidden on desktop */}
        <MobileFilterButton />
        <MobileBottomSheet />

        {/* Map Container */}
        <main className="flex-1 relative">
          {/* Filter Panel Overlay - Hidden on mobile, controlled by MobileFilterButton there */}
          <div className="absolute top-4 left-4 z-20 hidden md:block max-w-100">
            <FilterPanel />
          </div>

          {/* Map */}
          <LeafletMap />
        </main>
      </div>
    </div>
  );
}
