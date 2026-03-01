"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchMyTrees, fetchTreeStats, TreeDto, TreeStats } from '@/lib/api';
import { getUserLocation } from '@/lib/geolocation';
import { getGamificationForUser, MOCK_LEADERBOARD } from '@/lib/mock';
import ProfileSection from '@/components/dashboard/ProfileSection';
import StatsOverview from '@/components/dashboard/StatsOverview';
import TreeList from '@/components/dashboard/TreeList';
import GamificationWidgets from '@/components/dashboard/GamificationWidgets';
import FloatingActionButton from '@/components/dashboard/FloatingActionButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [myTrees, setMyTrees] = useState<TreeDto[]>([]);
    const [stats, setStats] = useState<TreeStats | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (!user) return;
        const loadData = async () => {
            const trees = await fetchMyTrees();
            setMyTrees(trees);

            const loc = await getUserLocation();
            if (!loc) {
                setStats(null);
                return;
            }

            const treeStats = await fetchTreeStats(loc.lat, loc.lng, 20000);
            setStats(treeStats);
        };
        loadData();
    }, [user]);

    if (loading || !user) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Loading…</p>
            </div>
        );
    }

    const gamification = getGamificationForUser();
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display selection:bg-primary selection:text-black overflow-x-hidden">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                <ProfileSection user={{ ...user, uuid: user.uuid }} gamification={gamification} />

                <StatsOverview stats={stats} />

                {/* Main Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: My Urban Forest (Tree List) */}
                    <TreeList trees={myTrees} />

                    {/* Right Column: Gamification & Community */}
                    <GamificationWidgets gamification={gamification} leaderboard={MOCK_LEADERBOARD} />
                </div>

                <FloatingActionButton />
            </main>

            <Footer />
        </div>
    );
}
