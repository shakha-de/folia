"use client";

import { useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default icon path issue with webpack.
// Safe to call at module level: this module is only ever loaded on the client
// (dynamic import with ssr:false), so `window` and Leaflet internals are available.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userLocationIcon = L.divIcon({
    className: "",
    html: `<div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center">
  <div class="leaflet-user-location-pulse" style="position:absolute;width:20px;height:20px;border-radius:50%;background:rgba(59,130,246,0.5)"></div>
  <div style="width:12px;height:12px;border-radius:50%;background:#3b82f6;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>
</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function InvalidateSize() {
    const map = useMap();
    useEffect(() => {
        // Force Leaflet to recalculate container dimensions after the first paint
        const id = setTimeout(() => map.invalidateSize(), 50);
        return () => clearTimeout(id);
    }, [map]);
    return null;
}

interface PickLocationMapProps {
    lat: number;
    lng: number;
    onLocationChange: (lat: number, lng: number) => void;
    userLocation?: { lat: number; lng: number };
}

export default function PickLocationMap({ lat, lng, onLocationChange, userLocation }: PickLocationMapProps) {
    const pinIcon = useMemo(() => L.divIcon({
        className: "",
        html: `<div style="display:flex;flex-direction:column;align-items:center">
    <div style="width:32px;height:32px;border-radius:50%;background:#13ec37;border:3px solid #fff;box-shadow:0 0 14px rgba(19,236,55,0.5),0 2px 8px rgba(0,0,0,0.3);"></div>
    <div style="width:2px;height:12px;background:#13ec37;margin-top:2px;"></div>
  </div>`,
        iconSize: [32, 46],
        iconAnchor: [16, 46],
    }), []);

    const handlePick = useCallback(
        (newLat: number, newLng: number) => {
            onLocationChange(newLat, newLng);
        },
        [onLocationChange]
    );

    return (
        <MapContainer
            center={[lat, lng]}
            zoom={15}
            style={{ position: "absolute", inset: 0, minHeight: "400px" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <InvalidateSize />
            <ClickHandler onPick={handlePick} />
            <Marker position={[lat, lng]} icon={pinIcon} />
            {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} zIndexOffset={1000} />
            )}
        </MapContainer>
    );
}
