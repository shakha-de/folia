"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchNearbyTrees, fetchTreeStats, TreeDto, TreeStats } from '@/lib/api';
import { getGamificationForUser, MOCK_LEADERBOARD } from '@/lib/mock';
import ProfileSection from '@/components/dashboard/ProfileSection';
import StatsOverview from '@/components/dashboard/StatsOverview';
import TreeList from '@/components/dashboard/TreeList';
import GamificationWidgets from '@/components/dashboard/GamificationWidgets';

export default function Dashboard() {
    const { user, isAuthenticated } = useAuth();
    const [nearbyTrees, setNearbyTrees] = useState<TreeDto[]>([]);
    const [stats, setStats] = useState<TreeStats | null>(null);
    // Tashkent coordinates, or request geolocation
    const defaultLocation = { lat: 41.2995, lng: 69.2401 };

    useEffect(() => {
        const loadData = async () => {
            // Parallel fetch
            const [trees, treeStats] = await Promise.all([
                fetchNearbyTrees(defaultLocation.lat, defaultLocation.lng),
                fetchTreeStats(defaultLocation.lat, defaultLocation.lng)
            ]);
            setNearbyTrees(trees);
            setStats(treeStats);
        };

        loadData();
    }, []);

    if (!user) {
        return <div className="p-8 text-center text-white">Please log in to view the dashboard.</div>;
    }

    const gamification = getGamificationForUser();

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display selection:bg-primary selection:text-black overflow-x-hidden">
            {/* TopNavBar */}
            <header className="sticky top-0 z-50 w-full border-b border-[#28392b] bg-background-dark/90 backdrop-blur-md px-4 sm:px-10 py-3">
                <div className="flex items-center justify-between mx-auto max-w-7xl">
                    <div className="flex items-center gap-4 text-white">
                        <div className="flex items-center justify-center size-8 rounded bg-primary/20 text-primary">
                            <span className="material-symbols-outlined text-2xl">forest</span>
                        </div>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">TreeGuardian</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a className="text-white text-sm font-medium hover:text-primary transition-colors" href="#">Dashboard</a>
                        <a className="text-gray-300 text-sm font-medium hover:text-primary transition-colors" href="#">My Trees</a>
                        <a className="text-gray-300 text-sm font-medium hover:text-primary transition-colors" href="#">Community</a>
                        <a className="text-gray-300 text-sm font-medium hover:text-primary transition-colors" href="#">Learn</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center justify-center rounded-lg size-10 bg-[#28392b] text-white hover:bg-[#3b543f] transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full"></span>
                        </button>
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-[#28392b] bg-stone-700"
                            data-alt="User avatar"
                        >
                            <div className="flex items-center justify-center w-full h-full text-white font-bold">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                <ProfileSection user={{ ...user, uuid: user.uuid }} gamification={gamification} />

                <StatsOverview stats={stats} />

                {/* Main Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: My Urban Forest (Tree List) */}
                    <TreeList trees={nearbyTrees} />

                    {/* Right Column: Gamification & Community */}
                    <GamificationWidgets gamification={gamification} leaderboard={MOCK_LEADERBOARD} />
                </div>

                {/* Floating Action Button for Mobile & Desktop */}
                <div className="fixed bottom-6 right-6 z-40">
                    <button className="bg-primary hover:bg-[#0da626] text-background-dark rounded-full size-14 shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group">
                        <span className="material-symbols-outlined text-3xl">add</span>
                        <div className="absolute right-16 bg-white dark:bg-[#1c2a20] text-black dark:text-white px-3 py-1 rounded-md text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                            Log Activity
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
}
