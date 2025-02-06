"use client";

import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";

interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
}

export default function Map({ center, zoom = 15 }: MapProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading map...
      </div>
    );
  }

  return (
    <GoogleMap
      zoom={zoom}
      center={center}
      mapContainerClassName="w-full h-full"
    >
      <MarkerF position={center} />
    </GoogleMap>
  );
} 