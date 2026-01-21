"use client";

import { useState } from "react";
import {
  useGreenSpaceStore,
  type GreenSpaceType,
  type SizeFilter,
} from "@/stores/greenSpaceStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, X, Filter, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMapStore } from "@/stores/mapStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "park", label: "Park" },
  { value: "forest", label: "Forest" },
  { value: "garden", label: "Garden" },
  { value: "recreation_ground", label: "Recreation" },
  { value: "nature_reserve", label: "Reserve" },
  { value: "playground", label: "Playground" },
];

const SIZE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "small", label: "< 1km²" },
  { value: "medium", label: "1-5km²" },
  { value: "large", label: "> 5km²" },
];

export default function FilterPanel({
  hideCollapse = false,
}: {
  hideCollapse?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    filters,
    setTypeFilter,
    setSizeFilter,
    setSearchQuery,
    resetFilters,
    totalCount,
    filteredSpaces,
    sortByDistance,
    sortByName,
    sortBySize,
  } = useGreenSpaceStore();

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.sizeFilter !== "all" ||
    filters.searchQuery.trim() !== "";

  if (!hideCollapse && isCollapsed) {
    return (
      <Button
        variant="outline"
        size="lg"
        className="shadow-lg bg-card/95 backdrop-blur-sm h-12 px-4 gap-2 border-primary/20 hover:border-primary/50"
        onClick={() => setIsCollapsed(false)}
      >
        <Filter className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">Filters</span>
        {hasActiveFilters && (
          <Badge
            variant="default"
            className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full"
          >
            !
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="w-full shadow-lg bg-card/95 backdrop-blur-sm border-primary/10 overflow-hidden">
      <div className="bg-primary/5 px-3 py-1.5 flex items-center justify-between border-b border-primary/10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
          Navigation & Search
        </span>
        {!hideCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-primary/10"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}
      </div>
      {/* Search & Sort Row */}
      <div className="p-3 flex items-center gap-2 border-b">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search green spaces..."
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 shrink-0 bg-background border shadow-sm"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white text-card-foreground border-border shadow-2xl min-w-40 z-1000 opacity-100"
          >
            <DropdownMenuItem
              onClick={() => {
                const center =
                  useMapStore.getState().userLocation ||
                  useMapStore.getState().center;
                sortByDistance(center.lat, center.lng);
              }}
              className="py-2.5"
            >
              Distance (Nearest)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => sortByName()} className="py-2.5">
              Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => sortBySize()} className="py-2.5">
              Size (Largest)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="gap-1 shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {/* Chip Filters */}
      <div className="p-3 space-y-2">
        {/* Type Chips */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Type
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {TYPE_OPTIONS.map((option) => (
              <Badge
                key={option.value}
                variant={filters.type === option.value ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap text-xs px-3 py-1 hover:bg-primary/10 transition-colors"
                onClick={() => setTypeFilter(option.value as GreenSpaceType)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Size Chips */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Size
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {SIZE_OPTIONS.map((option) => (
              <Badge
                key={option.value}
                variant={
                  filters.sizeFilter === option.value ? "default" : "outline"
                }
                className="cursor-pointer whitespace-nowrap text-xs px-3 py-1 hover:bg-primary/10 transition-colors"
                onClick={() => setSizeFilter(option.value as SizeFilter)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-3 pb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filteredSpaces.length} of {totalCount} spaces
        </span>
        {hasActiveFilters && (
          <span className="text-primary font-medium">Filtered</span>
        )}
      </div>
    </Card>
  );
}
