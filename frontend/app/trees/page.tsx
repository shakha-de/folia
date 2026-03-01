"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchNearbyTrees, fetchTreeStats, createTree, TreeDto, TreeStats, HealthStatus, SoilMoistureLevel } from "@/lib/api";
import { getUserLocation, GeoLocation } from "@/lib/geolocation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";

function MapLoader() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-[#0d1a0f] animate-pulse">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-xs uppercase tracking-widest">Loading map…</p>
            </div>
        </div>
    );
}

const TreesMapView = dynamic(() => import("@/components/maps/TreesMapView"), {
    ssr: false,
    loading: () => <MapLoader />,
});

const PickLocationMap = dynamic(() => import("@/components/maps/PickLocationMap"), {
    ssr: false,
    loading: () => <MapLoader />,
});

// Fallback map center used before/if user location is detected
const DEFAULT_CENTER = { lat: 52.52, lng: 13.405 }; // Berlin

type HealthFilter = "ALL" | "HEALTHY" | "STRESSED" | "DYING" | "NEEDS_CARE";
type PageMode = "browse" | "register";

const SPECIES_OPTIONS = [
    { value: "Ulmus pumila", label: "Siberian Elm (Ulmus pumila)" },
    { value: "Platanus orientalis", label: "Chinar (Platanus orientalis)" },
    { value: "Populus alba", label: "White Poplar (Populus alba)" },
    { value: "Platanus × acerifolia", label: "London Plane (Platanus × acerifolia)" },
    { value: "Fraxinus sogdiana", label: "Desert Ash (Fraxinus sogdiana)" },
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

const healthBadge: Record<string, { label: string; color: string; bg: string }> = {
    HEALTHY: { label: "Healthy", color: "text-primary", bg: "bg-primary/10" },
    STRESSED: { label: "Stressed", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    DYING: { label: "Critical", color: "text-red-500", bg: "bg-red-500/10" },
    DEAD: { label: "Dead", color: "text-slate-400", bg: "bg-slate-400/10" },
    REMOVED: { label: "Removed", color: "text-slate-500", bg: "bg-slate-500/10" },
    NEEDS_CARE: { label: "Needs Care", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    CRITICAL: { label: "Critical", color: "text-red-500", bg: "bg-red-500/10" },
};

const filterLabels: { key: HealthFilter; label: string }[] = [
    { key: "ALL", label: "All Trees" },
    { key: "DYING", label: "Urgent" },
    { key: "STRESSED", label: "Needs Water" },
    { key: "HEALTHY", label: "Healthy" },
];

const TreeCard = React.memo(function TreeCard({ tree }: Readonly<{ tree: TreeDto }>): React.ReactElement {
    const badge = healthBadge[tree.healthStatus] ?? { label: tree.healthStatus, color: "text-slate-400", bg: "bg-slate-400/10" };
    const lastWatered = tree.lastWateredAt
        ? `Last watered: ${new Date(tree.lastWateredAt).toLocaleDateString()}`
        : "Last watered: Unknown";

    return (
        <div className="group flex flex-col p-4 rounded-xl bg-gray-50 dark:bg-[#1c271d] border border-gray-200 dark:border-[#2a3f2d] hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badge.bg} ${badge.color}`}>
                    {badge.label}
                </span>
            </div>
            <div className="flex gap-3">
                <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
                        {tree.commonName || tree.species}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{lastWatered}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Moisture: <span className="capitalize">{tree.soilMoistureLevel.toLowerCase()}</span>
                    </p>
                </div>
            </div>
        </div>
    );
});

const StatsPill = React.memo(function StatsPill({ stats }: Readonly<{ stats: TreeStats }>): React.ReactElement {
    return (
        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 px-5 pb-3">
            <span><span className="font-bold text-slate-900 dark:text-white">{stats.totalTrees}</span> trees</span>
            <span><span className="font-bold text-red-400">{stats.treesNeedingWater}</span> need water</span>
        </div>
    );
});

const LocationLabel = React.memo(function LocationLabel({ locating, locError, location }: Readonly<{ locating: boolean; locError: boolean; location: GeoLocation | null }>): React.ReactElement {
    if (locating) {
        return <span className="text-xs text-slate-400">Detecting location…</span>;
    }
    if (locError || !location) {
        return <span className="text-xs text-red-400">Location unavailable</span>;
    }
    const place = location.city
        ? [location.city, location.country].filter(Boolean).join(', ')
        : `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`;
    const accuracy = location.source === 'gps' ? 'GPS' : 'approx.';
    return (
        <span className="text-xs text-slate-500 dark:text-slate-400">
            {place}
            <span className="ml-1 text-slate-400 dark:text-slate-500">({accuracy})</span>
        </span>
    );
});

function TreesPageInner(): React.ReactElement {
    const { user, loading, logout, isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // ── Browse state ────────────────────────────────────────────────────────────────────────
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [locating, setLocating] = useState(true);
    const [locError, setLocError] = useState(false);
    const [trees, setTrees] = useState<TreeDto[]>([]);
    const [stats, setStats] = useState<TreeStats | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<HealthFilter>("ALL");
    const [fetching, setFetching] = useState(false);

    // ── UI state ──────────────────────────────────────────────────────────────────────────
    const [mode, setMode] = useState<PageMode>(() =>
        searchParams?.get("register") === "true" ? "register" : "browse"
    );
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window === "undefined") return true;
        return window.innerWidth >= 1024;
    });
    const [navOpen, setNavOpen] = useState(false);

    // ── Register form state ────────────────────────────────────────────────────────────────
    const [regLat, setRegLat] = useState<number | null>(null);
    const [regLng, setRegLng] = useState<number | null>(null);
    const [species, setSpecies] = useState("Ulmus pumila");
    const [commonName, setCommonName] = useState("");
    const [soilMoisture, setSoilMoisture] = useState<SoilMoistureLevel>("MODERATE");
    const [healthStatus, setHealthStatus] = useState<HealthStatus>("HEALTHY");
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [mapPointPicked, setMapPointPicked] = useState(false);
    const [speciesFocused, setSpeciesFocused] = useState(false);
    const [showMapTip, setShowMapTip] = useState(false);
    const [mapTipFading, setMapTipFading] = useState(false);

    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            }
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Track the last view we fetched for to avoid excessive calls
    const lastViewRef = useRef<{ lat: number; lng: number, radius: number } | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (!user) return;
        getUserLocation().then((loc) => {
            setLocating(false);
            const center = loc ?? DEFAULT_CENTER;
            if (!loc) setLocError(true);
            else { setLocation(loc); setRegLat(loc.lat); setRegLng(loc.lng); }
            lastViewRef.current = { lat: center.lat, lng: center.lng, radius: 20000 };
            return Promise.all([
                fetchNearbyTrees(center.lat, center.lng, 20000),
                fetchTreeStats(center.lat, center.lng, 20000),
            ]);
        }).then((result) => {
            if (!result) return;
            const [t, s] = result;
            setTrees(t);
            setStats(s);
        }).catch(() => { setLocating(false); setLocError(true); });
    }, [user]);

    const switchToRegister = useCallback(() => {
        setMode("register");
        setSidebarOpen(true);
        setSuccessMsg("");
        setErrorMsg("");
        setMapPointPicked(false);
        setShowMapTip(true);
        setMapTipFading(false);
        const fadeTimer = window.setTimeout(() => setMapTipFading(true), 2500);
        const hideTimer = window.setTimeout(() => setShowMapTip(false), 3500);
        return () => { window.clearTimeout(fadeTimer); window.clearTimeout(hideTimer); };
    }, []);

    const switchToBrowse = useCallback(() => {
        setMode("browse");
        setSuccessMsg("");
        setErrorMsg("");
    }, []);

    const handleLocationChange = useCallback((newLat: number, newLng: number) => {
        setRegLat(newLat);
        setRegLng(newLng);
        setMapPointPicked(true);
        if (window.innerWidth < 1024) setSidebarOpen(true);
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (regLat === null || regLng === null) {
            setErrorMsg("Please pick a location on the map.");
            return;
        }
        setSubmitting(true);
        setErrorMsg("");
        setSuccessMsg("");
        const finalSpecies = species.trim() || commonName.trim() || "Unknown";
        const result = await createTree({
            species: finalSpecies,
            commonName: commonName.trim() || finalSpecies,
            lat: regLat,
            lng: regLng,
            soilMoistureLevel: soilMoisture,
            healthStatus,
        });
        setSubmitting(false);
        if (result) {
            setSuccessMsg("Tree registered successfully!");
            fetchNearbyTrees(regLat, regLng, 20000).then(setTrees);
            setTimeout(() => { setSuccessMsg(""); switchToBrowse(); }, 1500);
        } else {
            setErrorMsg("Failed to register tree. Please try again.");
        }
    }, [regLat, regLng, species, commonName, soilMoisture, healthStatus, switchToBrowse]);

    const speciesSuggestions = useMemo(() => {
        const query = species.trim().toLowerCase();
        if (!query) return SPECIES_OPTIONS.slice(0, 5);
        return SPECIES_OPTIONS.filter(o =>
            o.value.toLowerCase().includes(query) || o.label.toLowerCase().includes(query)
        ).slice(0, 6);
    }, [species]);

    const handleMapViewChange = useCallback((center: { lat: number; lng: number }, radius: number) => {
        if (!user) return;

        // Threshold: only fetch if the center moved by > 20% of the current radius
        // or if the radius changed significantly (> 30%)
        const last = lastViewRef.current;
        if (last) {
            const latDiff = Math.abs(last.lat - center.lat);
            const lngDiff = Math.abs(last.lng - center.lng);
            const radiusDiff = Math.abs(last.radius - radius);

            // Rough conversion for lat/lng diff to meters (approx. 111km per degree)
            const movedMeters = Math.max(latDiff, lngDiff) * 111000;

            if (movedMeters < radius * 0.2 && radiusDiff < last.radius * 0.3) {
                return; // Movement too small, skip fetch
            }
        }

        setFetching(true);
        lastViewRef.current = { ...center, radius };

        Promise.all([
            fetchNearbyTrees(center.lat, center.lng, radius),
            fetchTreeStats(center.lat, center.lng, radius),
        ]).then((result) => {
            if (!result) return;
            const [t, s] = result;
            setTrees(t);
            setStats(s);
        }).finally(() => {
            setFetching(false);
        });
    }, [user]);

    const filtered = useMemo(() => {
        return trees.filter((t) => {
            const matchesFilter = filter === "ALL" || t.healthStatus === filter;
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                t.species.toLowerCase().includes(q) ||
                (t.commonName ?? "").toLowerCase().includes(q);
            return matchesFilter && matchesSearch;
        });
    }, [trees, search, filter]);

    if (loading || !user) {
        return (
            <div className="bg-background-dark min-h-screen flex items-center justify-center">
                <p className="text-slate-400 text-sm">Loading…</p>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark h-screen flex overflow-hidden font-display">

            {/* Mobile backdrop — tap outside to close sidebar */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-20 bg-black/40"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Collapsible Sidebar ─────────────────────────────────────────── */}
            <div className={`absolute inset-y-0 left-0 z-30 shrink-0 transition-all duration-300 ease-in-out lg:relative lg:z-20 ${sidebarOpen ? "w-[78vw] max-w-[320px] sm:w-[70vw] sm:max-w-sm md:w-96 lg:w-110" : "w-0"}`}>
                <aside className={`absolute inset-0 flex flex-col bg-white dark:bg-[#111812] border-r border-gray-200 dark:border-[#2a3f2d] z-20 shadow-xl overflow-hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                    {/* Header */}
                    <div className="p-5 pb-2 border-b border-gray-100 dark:border-[#1e2f21]">
                        <div className="flex items-center justify-between mb-3">
                            {mode === "register" ? (
                                <>
                                    <button onClick={switchToBrowse} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                        Back
                                    </button>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Register Tree</h2>
                                </>
                            ) : (
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Nearby Trees</h2>
                            )}
                            <button
                                onClick={() => setSidebarOpen(false)}
                                aria-label="Minimize sidebar"
                                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1c271d] border border-gray-200 dark:border-[#2a3f2d] text-slate-500 dark:text-slate-300"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        {mode === "browse" ? (
                            <>
                                {/* Location indicator */}
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                                    <LocationLabel locating={locating} locError={locError} location={location} />
                                </div>
                                <div className="relative mb-3">
                                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                                    </span>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search trees or species…"
                                        className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-gray-100 dark:bg-[#1c271d] border-none text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                {/* Filter pills */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {filterLabels.map(({ key, label }) => (
                                        <button
                                            key={key}
                                            onClick={() => setFilter(key)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === key
                                                    ? "bg-primary text-black"
                                                    : "bg-gray-100 dark:bg-[#1c271d] border border-transparent dark:border-[#2f4532] text-slate-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-[#2f4532]"
                                                }`}
                                        >
                                            {key === "DYING" && (
                                                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                            )}
                                            {key === "STRESSED" && (
                                                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                                            )}
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 px-1 pb-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${mapPointPicked ? "bg-primary" : "bg-slate-400"}`} />
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {mapPointPicked ? `${regLat?.toFixed(5)}, ${regLng?.toFixed(5)}` : "Tap map to set location"}
                                </span>
                            </div>
                        )}
                    </div>

                    {mode === "browse" ? (
                        <>
                            {/* Stats */}
                            {stats && <StatsPill stats={stats} />}

                            {/* Tree list */}
                            <div className="flex-1 overflow-y-auto p-5 pt-2 space-y-3">
                                {filtered.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                                        No trees found.
                                    </p>
                                ) : (
                                    filtered.map((tree) => <TreeCard key={tree.publicId} tree={tree} />)
                                )}
                            </div>

                            {/* CTA */}
                            <div className="p-5 border-t border-gray-100 dark:border-[#1e2f21] bg-white dark:bg-[#111812]">
                                <Button onClick={switchToRegister} className="w-full bg-primary hover:bg-[#0fd630] text-black font-semibold py-3 rounded-lg gap-2">
                                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                    Register New Tree
                                </Button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                {errorMsg && (
                                    <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{errorMsg}</div>
                                )}
                                {successMsg && (
                                    <div className="text-xs text-primary bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">{successMsg}</div>
                                )}

                                {/* Species */}
                                <div className="relative space-y-1.5">
                                    <Label htmlFor="species" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Species</Label>
                                    <div className="relative">
                                        <Input
                                            id="species"
                                            value={species}
                                            onChange={(e) => setSpecies(e.target.value)}
                                            onFocus={() => setSpeciesFocused(true)}
                                            onBlur={() => setTimeout(() => setSpeciesFocused(false), 200)}
                                            placeholder="Start typing…"
                                            autoComplete="off"
                                            className="w-full text-sm bg-white dark:bg-[#1c271d] border-gray-200 dark:border-[#2a3f2d] text-slate-900 dark:text-white placeholder-slate-400"
                                        />
                                        {speciesFocused && speciesSuggestions.length > 0 && (
                                            <ul className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-[#1c271d] border border-gray-200 dark:border-[#2a3f2d] rounded-lg overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                                                {speciesSuggestions.map((s) => (
                                                    <li key={s.value}
                                                        onPointerDown={(e) => { e.preventDefault(); setSpecies(s.value); setSpeciesFocused(false); }}
                                                        className="px-4 py-2.5 text-sm text-slate-800 dark:text-white hover:bg-primary/10 cursor-pointer"
                                                    >
                                                        <span className="font-semibold">{s.value}</span>
                                                        <span className="block text-xs text-slate-400">{s.label.split("(")[1]?.replace(")", "") ?? ""}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {/* Common name */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="commonName" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Common Name <span className="font-normal text-slate-400">(optional)</span></Label>
                                    <Input
                                        id="commonName"
                                        value={commonName}
                                        onChange={(e) => setCommonName(e.target.value)}
                                        placeholder="e.g. Elm, Chinar…"
                                        className="w-full text-sm bg-white dark:bg-[#1c271d] border-gray-200 dark:border-[#2a3f2d] text-slate-900 dark:text-white placeholder-slate-400"
                                    />
                                </div>

                                {/* Soil Moisture */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Soil Moisture</Label>
                                    <div className="flex gap-2">
                                        {MOISTURE_OPTIONS.map((opt) => (
                                            <button key={opt.value} type="button"
                                                onPointerDown={(e) => { e.preventDefault(); setSoilMoisture(opt.value); }}
                                                className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors ${soilMoisture === opt.value ? "border-primary bg-primary text-black" : "border-gray-200 dark:border-[#2a3f2d] text-slate-600 dark:text-slate-300 hover:border-primary/50"}`}
                                            >
                                                {opt.icon} {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Health Status */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Health Status</Label>
                                    <div className="flex gap-2">
                                        {HEALTH_OPTIONS.map((opt) => (
                                            <button key={opt.value} type="button"
                                                onPointerDown={(e) => { e.preventDefault(); setHealthStatus(opt.value); }}
                                                className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors ${healthStatus === opt.value ? opt.activeClass : "border-gray-200 dark:border-[#2a3f2d] text-slate-600 dark:text-slate-300 hover:border-primary/50"}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-100 dark:border-[#1e2f21] bg-white dark:bg-[#111812] flex gap-2">
                                <Button type="button" variant="outline" onClick={switchToBrowse} className="flex-1 border-gray-200 dark:border-[#2a3f2d]">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting} className="flex-1 bg-primary hover:bg-[#0fd630] text-black font-semibold gap-1">
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    )}
                                    {submitting ? "Saving…" : "Save Tree"}
                                </Button>
                            </div>
                        </form>
                    )}
                </aside>

                {/* Sidebar toggle tab — anchored to the right edge, always visible */}
                <button
                    onClick={() => setSidebarOpen((o) => !o)}
                    aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-5 z-30 items-center justify-center w-5 h-12 rounded-r-lg bg-white dark:bg-[#1c271d] border border-l-0 border-gray-200 dark:border-[#2a3f2d] shadow-md text-slate-400 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px]">
                        {sidebarOpen ? "chevron_left" : "chevron_right"}
                    </span>
                </button>
            </div>

            {/* ── Map ─────────────────────────────────────────────────────────── */}
            <main className="flex-1 min-h-0 relative z-0 overflow-hidden">
                <button
                    onClick={() => setSidebarOpen((o) => !o)}
                    aria-label={sidebarOpen ? "Hide tree list" : "Show tree list"}
                    className="md:hidden absolute top-20 left-4 z-1001 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 dark:bg-[#111812]/90 backdrop-blur-sm border border-gray-200 dark:border-[#2a3f2d] shadow-lg text-slate-700 dark:text-slate-200"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {sidebarOpen ? "close" : "menu"}
                    </span>
                </button>

                {mode === "browse" ? (
                    <TreesMapView
                        trees={filtered}
                        center={location ?? DEFAULT_CENTER}
                        onViewChange={handleMapViewChange}
                    />
                ) : (
                    <>
                        <PickLocationMap
                            lat={regLat ?? (location?.lat ?? DEFAULT_CENTER.lat)}
                            lng={regLng ?? (location?.lng ?? DEFAULT_CENTER.lng)}
                            onLocationChange={handleLocationChange}
                        />
                        {/* Map tip toast */}
                        {showMapTip && (
                            <div className={`absolute bottom-32 left-1/2 -translate-x-1/2 z-1000 bg-black/80 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm pointer-events-none transition-opacity duration-1000 ${mapTipFading ? "opacity-0" : "opacity-100"}`}>
                                Tap on map to set coordinates
                            </div>
                        )}
                        {/* Coordinate overlay */}
                        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-1000 bg-white/80 dark:bg-black/80 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-2 pointer-events-none">
                            <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                {mapPointPicked
                                    ? `${regLat?.toFixed(5)}, ${regLng?.toFixed(5)} — Tap to move marker`
                                    : "Tap map to set location"}
                            </span>
                        </div>
                    </>
                )}

                {/* Nav dropdown backdrop — tap outside to close */}
                {navOpen && (
                    <div
                        className="absolute inset-0 z-999"
                        onClick={() => setNavOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* ── Floating nav ──────────────────────────────────────────────── */}
                <div className="absolute top-4 right-4 z-1001">
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-[#111812]/90 backdrop-blur-sm border border-gray-200 dark:border-[#2a3f2d] rounded-full px-3 py-1.5 shadow-lg">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-1.5 mr-1 hover:opacity-80 transition-opacity">
                            <span className="material-symbols-outlined text-primary text-[20px]">Forest</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white hidden sm:block">Folia</span>
                        </Link>

                        <div className="w-px h-4 bg-gray-200 dark:bg-[#2a3f2d]" />

                        {/* Nav links */}
                        <div className="hidden md:flex items-center gap-1">
                            <Link href="/almanac" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary px-2 py-1 rounded-full transition-colors">Almanac</Link>
                            <Link href="/learn-more" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary px-2 py-1 rounded-full transition-colors">Learn More</Link>
                        </div>

                        <div className="w-px h-4 bg-gray-200 dark:bg-[#2a3f2d]" />

                        {/* User menu toggle */}
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

                    {/* Dropdown */}
                    {navOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 dark:bg-[#111812]/95 backdrop-blur-sm border border-gray-200 dark:border-[#2a3f2d] rounded-xl shadow-xl overflow-hidden">
                            <div className="md:hidden px-4 py-3 border-b border-gray-100 dark:border-[#1e2f21] flex flex-col gap-1">
                                <Link href="/almanac" onClick={() => setNavOpen(false)} className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary py-1 transition-colors">Almanac</Link>
                                <Link href="/learn-more" onClick={() => setNavOpen(false)} className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary py-1 transition-colors">Learn More</Link>
                            </div>
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#1e2f21]">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Signed in as</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.username}</p>
                            </div>
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#1e2f21] flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Theme</p>
                                <ThemeToggle />
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

                {/* Locating overlay — top-16 clears the floating nav pill */}
                {locating && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-1000 bg-white/80 dark:bg-black/80 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-2 pointer-events-none">
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Detecting location…</span>
                    </div>
                )}

                {/* Location unavailable badge */}
                {locError && !locating && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-1000 bg-white/80 dark:bg-black/80 px-4 py-2 rounded-full backdrop-blur-sm border border-amber-400/40 shadow-lg flex items-center gap-2 pointer-events-none">
                        <span className="material-symbols-outlined text-amber-400 text-[16px]">location_off</span>
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Location unavailable — showing Berlin</span>
                    </div>
                )}

                {/* Syncing indicator */}
                {fetching && (
                    <div className="absolute bottom-24 right-4 z-1000 bg-white/80 dark:bg-black/80 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Syncing…</span>
                    </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-6 right-4 z-1000 bg-white/90 dark:bg-[#1c271d]/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-[#2a3f2d]">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Health Status</h4>
                    <div className="space-y-2">
                        {[
                            { color: "#13ec37", label: "Healthy" },
                            { color: "#FFC107", label: "Stressed" },
                            { color: "#FF5252", label: "Critical" },
                        ].map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
                                <span className="text-sm text-slate-700 dark:text-white font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function TreesPage() {
    return (
        <Suspense fallback={
            <div className="w-screen h-screen bg-[#0d1a0f] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <TreesPageInner />
        </Suspense>
    );
}
