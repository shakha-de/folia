"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
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

export default function RegisterTreePage(): React.ReactElement {
    const { user, loading, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    // UI
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [navOpen, setNavOpen] = useState(false);

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
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display overflow-hidden">

            {/* ── Collapsible Form Sidebar (LEFT) ─────────────────────────────── */}
            <div className={`relative z-20 shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-full lg:w-120" : "w-0"}`}>
                <aside className={`absolute inset-0 flex flex-col bg-white dark:bg-[#111812] border-r border-gray-200 dark:border-[#28392b] z-20 shadow-2xl overflow-hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-[#28392b] bg-white dark:bg-[#111812] shrink-0">
                        <button
                            onClick={() => router.back()}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Register New Tree</h2>
                    </div>

                    {/* Mobile map hint */}
                    <div className="lg:hidden mx-6 mt-4 bg-gray-100 dark:bg-[#1c271d] rounded-lg p-3 border border-gray-200 dark:border-[#28392b] shrink-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            GPS coordinates auto-set. Open on a larger screen to pick from map.
                        </p>
                    </div>

                    {/* Scrollable form */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Location */}
                        <section className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#28392b] pb-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="block mb-1.5 text-slate-700 dark:text-slate-300">Latitude</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={lat ?? ''}
                                        onChange={(e) => { const n = parseFloat(e.target.value); setLat(isNaN(n) ? null : n); }}
                                        placeholder="e.g. 41.2995"
                                        className="bg-gray-50 dark:bg-[#1c271d]/50 border-gray-200 dark:border-[#28392b] text-slate-900 dark:text-slate-300 focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="block mb-1.5 text-slate-700 dark:text-slate-300">Longitude</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={lng ?? ''}
                                        onChange={(e) => { const n = parseFloat(e.target.value); setLng(isNaN(n) ? null : n); }}
                                        placeholder="e.g. 69.2401"
                                        className="bg-gray-50 dark:bg-[#1c271d]/50 border-gray-200 dark:border-[#28392b] text-slate-900 dark:text-slate-300 focus:border-primary"
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Tree Details */}
                        <section className="flex flex-col gap-4">
                            <div className="border-b border-gray-100 dark:border-[#28392b] pb-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tree Details</h3>
                            </div>
                            <div>
                                <Label className="block mb-1.5 text-slate-700 dark:text-slate-300">Species</Label>
                                <Select value={species} onChange={(e) => setSpecies(e.target.value)}>
                                    {SPECIES_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label className="block mb-1.5 text-slate-700 dark:text-slate-300">
                                    Common Name <span className="text-slate-400">(optional)</span>
                                </Label>
                                <Input
                                    type="text"
                                    value={commonName}
                                    onChange={(e) => setCommonName(e.target.value)}
                                    placeholder="e.g. Tashkent Elm"
                                    className="bg-gray-50 dark:bg-[#1c271d] border-gray-200 dark:border-[#28392b] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-primary"
                                />
                            </div>
                        </section>

                        {/* Environment */}
                        <section className="flex flex-col gap-4 pb-4">
                            <div className="border-b border-gray-100 dark:border-[#28392b] pb-2">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Environment</h3>
                            </div>
                            <div>
                                <Label className="block mb-2 text-slate-700 dark:text-slate-300">Soil Moisture</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {MOISTURE_OPTIONS.map((opt) => (
                                        <button
                                            type="button"
                                            key={opt.value}
                                            onClick={() => setSoilMoisture(opt.value)}
                                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border transition h-full text-sm ${
                                                soilMoisture === opt.value
                                                    ? "bg-primary/20 border-primary text-primary font-bold"
                                                    : "bg-gray-50 dark:bg-[#1c271d] border-gray-200 dark:border-[#28392b] text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#1c271d]/80"
                                            }`}
                                        >
                                            <span className="text-base">{opt.icon}</span>
                                            <span className="text-xs font-medium">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label className="block mb-2 text-slate-700 dark:text-slate-300">Overall Condition</Label>
                                <div className="flex gap-2">
                                    {HEALTH_OPTIONS.map((opt) => (
                                        <button
                                            type="button"
                                            key={opt.value}
                                            onClick={() => setHealthStatus(opt.value)}
                                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition ${
                                                healthStatus === opt.value
                                                    ? opt.activeClass
                                                    : "border-gray-200 dark:border-[#28392b] bg-gray-50 dark:bg-[#1c271d] text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#28392b]"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Feedback */}
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
                    <div className="p-6 bg-white dark:bg-[#111812] border-t border-gray-100 dark:border-[#28392b] shrink-0">
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
                                className="w-full h-10 rounded-lg bg-transparent border border-gray-200 dark:border-[#28392b] text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                        <p className="text-center mt-3 text-[10px] text-slate-400 dark:text-slate-600">
                            {lat !== null && lng !== null
                                ? `Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
                                : geoLocating ? 'Detecting location…' : 'Location not set — enter coordinates above'}
                        </p>
                    </div>
                </aside>

                {/* Sidebar toggle tab */}
                <button
                    onClick={() => setSidebarOpen((o) => !o)}
                    aria-label={sidebarOpen ? "Collapse form" : "Expand form"}
                    className="absolute top-1/2 -translate-y-1/2 -right-5 z-30 flex items-center justify-center w-5 h-12 rounded-r-lg bg-white dark:bg-[#1c271d] border border-l-0 border-gray-200 dark:border-[#28392b] shadow-md text-slate-400 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px]">
                        {sidebarOpen ? "chevron_left" : "chevron_right"}
                    </span>
                </button>
            </div>

            {/* ── Map (RIGHT) ──────────────────────────────────────────────────── */}
            <main className="flex-1 min-h-0 relative z-0 overflow-hidden">
                {lat !== null && lng !== null ? (
                    <PickLocationMap lat={lat} lng={lng} onLocationChange={handleLocationChange} />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1a0f] gap-3">
                        <span className="material-symbols-outlined text-slate-500 text-4xl">location_off</span>
                        <p className="text-slate-400 text-sm">
                            {geoLocating ? 'Detecting location…' : 'Location unavailable — enter coordinates in the form.'}
                        </p>
                    </div>
                )}

                {/* Coordinate overlay — bottom-left to avoid Leaflet zoom controls */}
                {lat !== null && lng !== null && (
                    <div className="absolute bottom-6 left-4 z-1000 pointer-events-none">
                        <div className="bg-white/90 dark:bg-[#111812]/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-gray-200 dark:border-[#28392b] shadow-xl">
                            <span className="text-xs font-bold text-primary tracking-wider uppercase block mb-1">
                                Click map to set location
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-700 dark:text-white text-[18px]">location_on</span>
                                <span className="text-sm font-medium text-slate-800 dark:text-white">
                                    {lat.toFixed(5)}, {lng.toFixed(5)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Floating Nav ─────────────────────────────────────────────── */}
                <div className="absolute top-4 right-4 z-1001">
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-[#111812]/90 backdrop-blur-sm border border-gray-200 dark:border-[#2a3f2d] rounded-full px-3 py-1.5 shadow-lg">
                        <Link href="/" className="flex items-center gap-1.5 mr-1 hover:opacity-80 transition-opacity">
                            <span className="material-symbols-outlined text-primary text-[20px]">Forest</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white hidden sm:block">Folia</span>
                        </Link>

                        <div className="w-px h-4 bg-gray-200 dark:bg-[#2a3f2d]" />

                        <div className="hidden md:flex items-center gap-1">
                            <Link href="/trees" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary px-2 py-1 rounded-full transition-colors">Trees</Link>
                            <Link href="/almanac" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary px-2 py-1 rounded-full transition-colors">Almanac</Link>
                            <Link href="/learn-more" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary px-2 py-1 rounded-full transition-colors">Learn More</Link>
                        </div>

                        <div className="hidden md:block w-px h-4 bg-gray-200 dark:bg-[#2a3f2d]" />

                        <ThemeToggle />

                        <div className="w-px h-4 bg-gray-200 dark:bg-[#2a3f2d]" />

                        <button
                            onClick={() => setNavOpen((o) => !o)}
                            aria-label="User menu"
                            className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">account_circle</span>
                            <span className="hidden sm:block max-w-20 truncate">{user?.username}</span>
                            <span className="material-symbols-outlined text-[14px]">{navOpen ? "expand_less" : "expand_more"}</span>
                        </button>
                    </div>

                    {navOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 dark:bg-[#111812]/95 backdrop-blur-sm border border-gray-200 dark:border-[#2a3f2d] rounded-xl shadow-xl overflow-hidden">
                            <div className="md:hidden px-4 py-3 border-b border-gray-100 dark:border-[#1e2f21] flex flex-col gap-1">
                                <Link href="/trees" onClick={() => setNavOpen(false)} className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary py-1 transition-colors">Trees</Link>
                                <Link href="/almanac" onClick={() => setNavOpen(false)} className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary py-1 transition-colors">Almanac</Link>
                                <Link href="/learn-more" onClick={() => setNavOpen(false)} className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary py-1 transition-colors">Learn More</Link>
                            </div>
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#1e2f21]">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Signed in as</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.username}</p>
                            </div>
                            {isAuthenticated && (
                                <button
                                    onClick={() => { logout(); setNavOpen(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">logout</span>
                                    Log out
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
