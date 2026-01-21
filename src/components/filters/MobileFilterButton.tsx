"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGreenSpaceStore } from "@/stores/greenSpaceStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FilterPanel from "@/components/filters/FilterPanel";

export default function MobileFilterButton() {
  const { filters } = useGreenSpaceStore();
  const [open, setOpen] = useState(false);

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.sizeFilter !== "all" ||
    filters.searchQuery.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-32 left-4 z-40 md:hidden shadow-xl rounded-full h-14 w-14 p-0 bg-primary hover:bg-primary/90"
        >
          <div className="relative">
            <Filter className="h-5 w-5" />
            {hasActiveFilters && (
              <Badge
                variant="destructive"
                className="absolute -top-3 -right-3 h-5 w-5 p-0 flex items-center justify-center text-[10px] border-2 border-background"
              >
                !
              </Badge>
            )}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 p-0 overflow-hidden bg-background max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 border-b bg-card">
          <DialogTitle>Filters & Sort</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <FilterPanel hideCollapse={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
