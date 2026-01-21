"use client";

import { useEffect, useState, useCallback } from "react";
import { useMapStore } from "@/stores/mapStore";
import { MapPin, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GPSPermissionModal() {
  const { locationPermission, requestUserLocation } = useMapStore();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestLocation = useCallback(async () => {
    setIsRequesting(true);
    setError(null);

    try {
      await requestUserLocation();
    } catch {
      setError(
        "Unable to access your location. Please check your browser settings.",
      );
    } finally {
      setIsRequesting(false);
    }
  }, [requestUserLocation]);

  // Auto-request on mount
  useEffect(() => {
    if (locationPermission === null) {
      handleRequestLocation();
    }
  }, [locationPermission, handleRequestLocation]);

  // Don't show modal if permission is granted
  if (locationPermission === "granted") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <div className="relative bg-primary/10 p-4 rounded-full">
              <MapPin className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Location Access Required</h2>
            <p className="text-muted-foreground">
              We need your location to show green spaces near you and provide
              accurate directions.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleRequestLocation}
            disabled={isRequesting}
            size="lg"
            className="w-full"
          >
            {isRequesting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-5 w-5" />
                Enable Location
              </>
            )}
          </Button>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground">
            Your location data is only used to display nearby green spaces and
            is never stored or shared.
          </p>
        </div>
      </Card>
    </div>
  );
}
