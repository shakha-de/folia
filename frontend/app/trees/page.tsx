"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { fetchNearbyTrees, fetchTreeStats, TreeDto, TreeStats } from "@/lib/api";
import { getUserLocation, GeoLocation } from "@/lib/geolocation";
import { Button } from "@/components/ui/button";

const TreesMapView = dynamic(() => import("@/components/maps/TreesMapView"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[#0d1a0f]">
            <p className="text-slate-400 text-sm">Loading map…</p>
        </div>
    ),
});

type HealthFilter = "ALL" | "HEALTHY" | "STRESSED" | "DYING" | "NEEDS_CARE";

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

function TreeCard({ tree }: { tree: TreeDto }) {
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
}

function StatsPill({ stats }: { stats: TreeStats }) {
    return (
        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 px-5 pb-3">
            <span><span className="font-bold text-slate-900 dark:text-white">{stats.totalTrees}</span> trees</span>
            <span><span className="font-bold text-red-400">{stats.treesNeedingWater}</span> need water</span>
        </div>
    );
}

export default function TreesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [locating, setLocating] = useState(true);
    const [locError, setLocError] = useState(false);
    const [trees, setTrees] = useState<TreeDto[]>([]);
    const [stats, setStats] = useState<TreeStats | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<HealthFilter>("ALL");
    const [fetching, setFetching] = useState(false);

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
            if (!loc) { setLocError(true); return; }
            setLocation(loc);
            // Initial fetch handled by dynamic map view if needed,
            // but we do one initial fetch here to populate the list immediately
            lastViewRef.current = { lat: loc.lat, lng: loc.lng, radius: 20000 };
            return Promise.all([
                fetchNearbyTrees(loc.lat, loc.lng, 20000),
                fetchTreeStats(loc.lat, loc.lng, 20000),
            ]);
        }).then((result) => {
            if (!result) return;
            const [t, s] = result;
            setTrees(t);
            setStats(s);
        }).catch(() => { setLocating(false); setLocError(true); });
    }, [user]);

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
        <div className="bg-background-light dark:bg-background-dark h-screen flex flex-col overflow-hidden font-display">
            <Header />

            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-full md:w-100 lg:w-110 flex flex-col bg-white dark:bg-[#111812] border-r border-gray-200 dark:border-[#2a3f2d] z-20 h-full shadow-xl">
                    {/* Header */}
                    <div className="p-5 pb-2 border-b border-gray-100 dark:border-[#1e2f21]">
                        {/* Location indicator */}
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                            {locating ? (
                                <span className="text-xs text-slate-400">Detecting location…</span>
                            ) : locError || !location ? (
                                <span className="text-xs text-red-400">Location unavailable</span>
                            ) : (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {location.city ? `${location.city}${location.country ? `, ${location.country}` : ''}` : `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`}
                                    {' '}
                                    <span className="text-slate-400 dark:text-slate-500">
                                        ({location.source === 'gps' ? 'GPS' : 'approx.'})
                                    </span>
                                </span>
                            )}
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
                    </div>

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
                        <Link href="/trees/new">
                            <Button className="w-full bg-primary hover:bg-[#0fd630] text-black font-semibold py-3 rounded-lg gap-2">
                                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                Register New Tree
                            </Button>
                        </Link>
                    </div>
                </aside>

                {/* Map */}
                <main className="flex-1 min-h-0 relative overflow-hidden" style={{ height: "100%" }}>
                    {location ? (
                        <div style={{ width: "100%", height: "100%", position: "relative" }}>
                            <TreesMapView
                                trees={filtered}
                                center={location}
                                onViewChange={handleMapViewChange}
                            />
                            {fetching && (
                                <div className="absolute top-4 right-4 z-1000 bg-white/80 dark:bg-black/80 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Syncing…</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1a0f] gap-3">
                            <span className="material-symbols-outlined text-slate-500 text-4xl">location_off</span>
                            <p className="text-slate-400 text-sm">{locating ? 'Detecting your location…' : 'Could not determine your location.'}</p>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="absolute bottom-6 right-6 z-1000 bg-white/90 dark:bg-[#1c271d]/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-[#2a3f2d]">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                            Health Status
                        </h4>
                        <div className="space-y-2">
                            {[
                                { color: "#13ec37", label: "Healthy" },
                                { color: "#FFC107", label: "Stressed" },
                                { color: "#FF5252", label: "Critical" },
                            ].map(({ color, label }) => (
                                <div key={label} className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
                                    />
                                    <span className="text-sm text-slate-700 dark:text-white font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
