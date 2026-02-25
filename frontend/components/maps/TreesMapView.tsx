"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { TreeDto } from "@/lib/api";

// Fix default icon path issue with webpack
const fixLeafletIcons = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
};

const healthColor: Record<string, string> = {
    HEALTHY: "#13ec37",
    STRESSED: "#FFC107",
    DYING: "#FF5252",
    DEAD: "#64748b",
    REMOVED: "#334155",
    NEEDS_CARE: "#FFC107",
    CRITICAL: "#FF5252",
};

const healthLabel: Record<string, string> = {
    HEALTHY: "Healthy",
    STRESSED: "Stressed",
    DYING: "Critical",
    DEAD: "Dead",
    REMOVED: "Removed",
    NEEDS_CARE: "Needs Care",
    CRITICAL: "Critical",
};

const createColoredIcon = (color: string) =>
    L.divIcon({
        className: "",
        html: `<div style="
      width:28px; height:28px; border-radius:50%;
      background:${color};
      border:3px solid #fff;
      box-shadow:0 0 10px ${color}80,0 2px 6px rgba(0,0,0,0.4);
      display:flex; align-items:center; justify-content:center;
    "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    });

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
}

function InvalidateSize() {
    const map = useMap();
    useEffect(() => {
        // Force Leaflet to recalculate container dimensions after layout settles
        const id = setTimeout(() => map.invalidateSize(), 200);
        return () => clearTimeout(id);
    }, [map]);
    return null;
}

function MapChangeHandler({ onViewChange }: { onViewChange?: (center: { lat: number; lng: number }, radiusMeters: number) => void }) {
    useMapEvents({
        moveend(e) {
            const map = e.target;
            const center = map.getCenter();
            const bounds = map.getBounds();
            const edge = bounds.getNorthWest();
            // Cap radius at 50km to prevent excessive server load and rounding to integer
            const radius = Math.min(Math.floor(center.distanceTo(edge)), 50000);
            if (onViewChange) {
                onViewChange({ lat: center.lat, lng: center.lng }, radius);
            }
        },
    });
    return null;
}

interface TreesMapViewProps {
    trees: TreeDto[];
    center: { lat: number; lng: number };
    onViewChange?: (center: { lat: number; lng: number }, radiusMeters: number) => void;
}

export default function TreesMapView({ trees, center, onViewChange }: TreesMapViewProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        fixLeafletIcons();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={15}
            style={{ width: "100%", height: "100%", minHeight: "400px" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <InvalidateSize />
            <RecenterMap lat={center.lat} lng={center.lng} />
            <MapChangeHandler onViewChange={onViewChange} />
            {trees.map((tree) => {
                const color = healthColor[tree.healthStatus] ?? "#94a3b8";
                return (
                    <Marker
                        key={tree.publicId}
                        position={[tree.lat, tree.lng]}
                        icon={createColoredIcon(color)}
                    >
                        <Popup>
                            <div className="text-sm min-w-40">
                                <p className="font-bold text-slate-900 mb-1">
                                    {tree.commonName || tree.species}
                                </p>
                                <span
                                    className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-2"
                                    style={{
                                        background: `${color}20`,
                                        color,
                                    }}
                                >
                                    {healthLabel[tree.healthStatus] ?? tree.healthStatus}
                                </span>
                                <p className="text-slate-500 text-xs">
                                    Moisture: {tree.soilMoistureLevel}
                                </p>
                                {tree.lastWateredAt && (
                                    <p className="text-slate-500 text-xs mt-1">
                                        Last watered:{" "}
                                        {new Date(tree.lastWateredAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
