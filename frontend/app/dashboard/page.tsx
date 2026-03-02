"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    fetchLeaderboard,
    fetchMyTrees,
    fetchTreeStats,
    fetchUserProfile,
    LeaderboardEntryDto,
    TreeDto,
    TreeStats,
    UserProfileDto,
} from '@/lib/api';
import { getUserLocation } from '@/lib/geolocation';
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
    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntryDto[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (!user) return;
        const loadData = async () => {
            const [trees, profileData, leaderboardData] = await Promise.all([
                fetchMyTrees(),
                fetchUserProfile(user.username),
                fetchLeaderboard(0, 5),
            ]);

            setMyTrees(trees);
            setProfile(profileData);
            setLeaderboard(leaderboardData);

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

    const badgeCatalog = [
        { id: 'first_drop', name: 'First Drop', icon: 'water_drop' },
        { id: 'planter', name: 'Planter', icon: 'forest' },
        { id: 'dedicated_guardian', name: 'Dedicated Guardian', icon: 'wb_sunny' },
        { id: 'community_pillar', name: 'Community Pillar', icon: 'group' },
        { id: 'forester', name: 'Forester', icon: 'park' },
        { id: 'drought_buster', name: 'Drought Buster', icon: 'thunderstorm' },
        { id: 'centurion', name: 'Centurion', icon: 'military_tech' },
    ];

    const unlocked = new Set(Object.keys(profile?.stats.unlockedBadges || {}));
    const badges = badgeCatalog.map((badge) => ({
        ...badge,
        unlocked: unlocked.has(badge.id),
    }));

    const leaderboardEntries = leaderboard.map((entry) => ({
        rank: entry.position,
        name: entry.username,
        xp: entry.xp,
        isCurrentUser: entry.username === user.username,
    }));

    if (profile && !leaderboardEntries.some((entry) => entry.name === profile.username)) {
        leaderboardEntries.push({
            rank: profile.leaderboardPosition,
            name: profile.username,
            xp: profile.stats.xp,
            isCurrentUser: true,
        });
        leaderboardEntries.sort((a, b) => a.rank - b.rank);
    }

    const profileRank = profile?.stats.rank || 'Seed Keeper';
    const profileNextRank = profile?.stats.nextRank || 'Seedling Saver';
    const profileProgress = profile?.stats.progressPercent || 0;
    const profileCo2Offset = profile?.stats.co2OffsetKg || 0;
    const profileTreeYears = profile?.stats.treesRegistered || 0;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display selection:bg-primary selection:text-black overflow-x-hidden">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                <ProfileSection
                    user={{
                        ...user,
                        uuid: user.uuid,
                        displayName: profile?.displayName,
                        profileImageUrl: profile?.profileImageUrl,
                    }}
                    rank={profileRank}
                    nextRank={profileNextRank}
                    progress={profileProgress}
                    location="Community"
                    co2Offset={profileCo2Offset}
                    treeYears={profileTreeYears}
                />

                <StatsOverview stats={stats} />

                {/* Main Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: My Urban Forest (Tree List) */}
                    <TreeList trees={myTrees} />

                    {/* Right Column: Gamification & Community */}
                    <GamificationWidgets
                        badges={badges}
                        leaderboard={leaderboardEntries}
                        locationLabel="Community"
                    />
                </div>

                <FloatingActionButton />
            </main>

            <Footer />
        </div>
    );
}
