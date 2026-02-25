"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    createTree,
    HealthStatus,
    SoilMoistureLevel,
} from "@/lib/api";
import { getUserLocation } from "@/lib/geolocation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const PickLocationMap = dynamic(() => import("@/components/maps/PickLocationMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[#0d1a0f]">
            <p className="text-slate-400 text-sm">Loading map…</p>
        </div>
    ),
});

const SPECIES_OPTIONS = [
    { value: "Ulmus pumila", label: "Siberian Elm (Ulmus pumila)" },
    { value: "Platanus orientalis", label: "Chinar (Platanus orientalis)" },
    { value: "Populus alba", label: "White Poplar (Populus alba)" },
    { value: "Platanus × acerifolia", label: "London Plane (Platanus × acerifolia)" },
    { value: "Fraxinus sogdiana", label: "Desert Ash (Fraxinus sogdiana)" },
    { value: "other", label: "Other / Unknown" },
];

const MOISTURE_OPTIONS: { value: SoilMoistureLevel; label: string; icon: string }[] = [
    { value: "DRY", label: "Dry", icon: "💧" },
    { value: "MODERATE", label: "Moderate", icon: "💧💧" },
    { value: "WET", label: "Wet", icon: "💧💧💧" },
];

const HEALTH_OPTIONS: { value: HealthStatus; label: string; activeClass: string }[] = [
    { value: "HEALTHY", label: "Healthy", activeClass: "border-primary bg-primary text-black" },
    { value: "STRESSED", label: "Stressed", activeClass: "border-yellow-400 bg-yellow-400 text-black" },
    { value: "DYING", label: "Critical", activeClass: "border-red-500 bg-red-500 text-white" },
];

export default function RegisterTreePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Location
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [geoLocating, setGeoLocating] = useState(true);

    // Resolve user's location on mount
    useEffect(() => {
        getUserLocation().then((loc) => {
            if (loc) { setLat(loc.lat); setLng(loc.lng); }
            setGeoLocating(false);
        });
    }, []);

    // Form fields
    const [species, setSpecies] = useState("Ulmus pumila");
    const [commonName, setCommonName] = useState("");
    const [soilMoisture, setSoilMoisture] = useState<SoilMoistureLevel>("MODERATE");
    const [healthStatus, setHealthStatus] = useState<HealthStatus>("HEALTHY");

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    const handleLocationChange = useCallback((newLat: number, newLng: number) => {
        setLat(newLat);
        setLng(newLng);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lat === null || lng === null) {
            setErrorMsg("Please allow location access or enter coordinates manually.");
            return;
        }
        setSubmitting(true);
        setErrorMsg("");
        setSuccessMsg("");

        const finalSpecies = species === "other" ? commonName || "Unknown" : species;

        const result = await createTree({
            species: finalSpecies,
            commonName: commonName || finalSpecies,
            lat,
            lng,
            soilMoistureLevel: soilMoisture,
            healthStatus,
        });

        setSubmitting(false);
        if (result) {
            setSuccessMsg("Tree registered successfully!");
            setTimeout(() => router.push("/trees"), 1500);
        } else {
            setErrorMsg("Failed to register tree. Please try again.");
        }
    };

    if (loading || !user) {
        return (
            <div className="bg-background-dark min-h-screen flex items-center justify-center">
                <p className="text-slate-400 text-sm">Loading…</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-background-dark font-display text-white overflow-hidden">
            {/* Left Pane: Map (desktop only) */}
            <div className="relative hidden lg:flex flex-1 h-full">
                {lat !== null && lng !== null ? (
                    <PickLocationMap lat={lat} lng={lng} onLocationChange={handleLocationChange} />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1a0f] gap-3">
                        <span className="material-symbols-outlined text-slate-500 text-4xl">location_off</span>
                        <p className="text-slate-400 text-sm">
                            {geoLocating ? 'Detecting location…' : 'Location unavailable — enter coordinates below.'}
                        </p>
                    </div>
                )}

                {/* Zone overlay */}
                {lat !== null && lng !== null && (
                <div className="absolute top-6 left-6 z-1000">
                    <div className="bg-surface-dark/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-[#28392b] shadow-xl">
                        <span className="text-xs font-bold text-primary tracking-wider uppercase block mb-1">
                            Click map to set location
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-white text-[18px]">location_on</span>
                            <span className="text-sm font-medium text-white">
                                {lat.toFixed(5)}, {lng.toFixed(5)}
                            </span>
                        </div>
                    </div>
                </div>
                )}

            </div>
            {/* Right Pane: Form */}
            <div className="w-full lg:w-120 h-full flex flex-col bg-background-dark border-l border-[#28392b] shadow-2xl z-20">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#28392b] bg-background-dark/95 backdrop-blur z-30 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="text-slate-400 hover:text-white transition"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h2 className="text-lg font-bold text-white tracking-tight">Register New Tree</h2>
                    </div>
                </div>

                {/* Scrollable form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Location */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-[#28392b] pb-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</h3>
                        </div>

                        {/* Mobile map hint */}
                        <div className="lg:hidden bg-surface-dark rounded-lg p-3 border border-[#28392b]">
                            <p className="text-xs text-slate-400">
                                GPS coordinates auto-set. Open on desktop to pick from map.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="block mb-1.5">Latitude</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={lat ?? ''}
                                    onChange={(e) => { const n = parseFloat(e.target.value); setLat(isNaN(n) ? null : n); }}
                                    placeholder="e.g. 41.2995"
                                    className="bg-surface-dark/50 border-[#28392b] text-slate-300 focus:border-primary"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="block mb-1.5">Longitude</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={lng ?? ''}
                                    onChange={(e) => { const n = parseFloat(e.target.value); setLng(isNaN(n) ? null : n); }}
                                    placeholder="e.g. 69.2401"
                                    className="bg-surface-dark/50 border-[#28392b] text-slate-300 focus:border-primary"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Tree Details */}
                    <section className="flex flex-col gap-4">
                        <div className="border-b border-[#28392b] pb-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tree Details</h3>
                        </div>

                        <div>
                            <Label className="block mb-1.5">Species</Label>
                            <Select
                                value={species}
                                onChange={(e) => setSpecies(e.target.value)}
                            >
                                {SPECIES_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <Label className="block mb-1.5">Common Name <span className="text-slate-600">(optional)</span></Label>
                            <Input
                                type="text"
                                value={commonName}
                                onChange={(e) => setCommonName(e.target.value)}
                                placeholder="e.g. Tashkent Elm"
                                className="bg-surface-dark border-[#28392b] text-white placeholder-slate-600 focus:border-primary"
                            />
                        </div>
                    </section>

                    {/* Environment */}
                    <section className="flex flex-col gap-4 pb-4">
                        <div className="border-b border-[#28392b] pb-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Environment</h3>
                        </div>

                        {/* Soil Moisture */}
                        <div>
                            <Label className="block mb-2">Soil Moisture</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {MOISTURE_OPTIONS.map((opt) => (
                                    <button
                                        type="button"
                                        key={opt.value}
                                        onClick={() => setSoilMoisture(opt.value)}
                                        className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border transition h-full text-sm ${
                                            soilMoisture === opt.value
                                                ? "bg-primary/20 border-primary text-primary font-bold"
                                                : "bg-surface-dark border-[#28392b] text-slate-400 hover:bg-surface-dark/80"
                                        }`}
                                    >
                                        <span className="text-base">{opt.icon}</span>
                                        <span className="text-xs font-medium">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Health Status */}
                        <div>
                            <Label className="block mb-2">Overall Condition</Label>
                            <div className="flex gap-2">
                                {HEALTH_OPTIONS.map((opt) => (
                                    <button
                                        type="button"
                                        key={opt.value}
                                        onClick={() => setHealthStatus(opt.value)}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition ${
                                            healthStatus === opt.value
                                                ? opt.activeClass
                                                : "border-[#28392b] bg-surface-dark text-slate-400 hover:bg-[#28392b]"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Feedback messages */}
                    {successMsg && (
                        <p className="text-primary text-sm font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            {successMsg}
                        </p>
                    )}
                    {errorMsg && (
                        <p className="text-red-400 text-sm font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">error</span>
                            {errorMsg}
                        </p>
                    )}
                </form>

                {/* Sticky Footer */}
                <div className="p-6 bg-background-dark border-t border-[#28392b] shrink-0">
                    <div className="flex flex-col gap-3">
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={submitting || lat === null || lng === null}
                            className="w-full h-12 rounded-lg bg-primary hover:bg-[#0fd630] text-black font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Submitting…" : lat === null || lng === null ? "Waiting for location…" : "SUBMIT REGISTRATION"}
                        </Button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-full h-10 rounded-lg bg-transparent border border-[#28392b] text-slate-400 font-medium text-sm hover:text-white hover:border-slate-500 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                    <p className="text-center mt-3 text-[10px] text-slate-600">
                        {lat !== null && lng !== null
                            ? `Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
                            : geoLocating ? 'Detecting location…' : 'Location not set — enter coordinates above'}
                    </p>
                </div>
            </div>
        </div>
    );
}
