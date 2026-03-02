"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileSection from '@/components/dashboard/ProfileSection';
import GamificationWidgets from '@/components/dashboard/GamificationWidgets';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import {
    fetchLeaderboard,
    fetchUserProfile,
    LeaderboardEntryDto,
    UserProfileDto,
} from '@/lib/api';

const BADGE_CATALOG = [
    { id: 'first_drop', name: 'First Drop', icon: 'water_drop' },
    { id: 'planter', name: 'Planter', icon: 'forest' },
    { id: 'dedicated_guardian', name: 'Dedicated Guardian', icon: 'wb_sunny' },
    { id: 'community_pillar', name: 'Community Pillar', icon: 'group' },
    { id: 'forester', name: 'Forester', icon: 'park' },
    { id: 'drought_buster', name: 'Drought Buster', icon: 'thunderstorm' },
    { id: 'centurion', name: 'Centurion', icon: 'military_tech' },
];

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
    return (
        <Card className="flex flex-col gap-2 rounded-xl p-6 bg-surface-light dark:bg-surface-dark border-border hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start">
                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium uppercase tracking-wider">{title}</p>
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-300">{icon}</span>
            </div>
            <p className="text-slate-900 dark:text-white text-3xl font-bold">{value}</p>
        </Card>
    );
}

export default function UsernameProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams<{ username: string }>();
    const username = typeof params?.username === 'string'
        ? decodeURIComponent(params.username)
        : '';

    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntryDto[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (!user || !username) return;

        const loadProfile = async () => {
            setIsDataLoading(true);
            const [profileData, leaderboardData] = await Promise.all([
                fetchUserProfile(username),
                fetchLeaderboard(0, 5),
            ]);
            setProfile(profileData);
            setLeaderboard(leaderboardData);
            setIsDataLoading(false);
        };

        loadProfile();
    }, [user, username]);

    const badges = useMemo(() => {
        if (!profile) return [];

        const unlocked = new Set(Object.keys(profile.stats.unlockedBadges || {}));
        return BADGE_CATALOG.map((badge) => ({
            ...badge,
            unlocked: unlocked.has(badge.id),
        }));
    }, [profile]);

    const leaderboardEntries = useMemo(() => {
        if (!profile) return [];

        const entries = leaderboard.map((entry) => ({
            rank: entry.position,
            name: entry.username,
            xp: entry.xp,
            isCurrentUser: entry.username === profile.username,
        }));

        const hasCurrentUser = entries.some((entry) => entry.name === profile.username);
        if (!hasCurrentUser) {
            entries.push({
                rank: profile.leaderboardPosition,
                name: profile.username,
                xp: profile.stats.xp,
                isCurrentUser: true,
            });
            entries.sort((a, b) => a.rank - b.rank);
        }

        return entries;
    }, [leaderboard, profile]);

    if (loading || !user) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Loading…</p>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display selection:bg-primary selection:text-black overflow-x-hidden">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {isDataLoading ? (
                    <div className="min-h-[50vh] flex items-center justify-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading profile…</p>
                    </div>
                ) : !profile ? (
                    <Card className="p-8 bg-surface-light dark:bg-surface-dark border-border">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Profile not found</h1>
                        <p className="text-slate-600 dark:text-slate-300">No user profile found for this username.</p>
                    </Card>
                ) : (
                    <>
                        <ProfileSection
                            user={profile}
                            rank={profile.stats.rank}
                            nextRank={profile.stats.nextRank}
                            progress={profile.stats.progressPercent}
                            location="Community"
                            co2Offset={profile.stats.co2OffsetKg}
                            treeYears={profile.stats.treesRegistered}
                        />

                        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard title="Total XP" value={profile.stats.xp} icon="military_tech" />
                            <StatCard title="Trees Registered" value={profile.stats.treesRegistered} icon="forest" />
                            <StatCard title="Waterings Logged" value={profile.stats.wateringsLogged} icon="water_drop" />
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <Card className="p-6 bg-surface-light dark:bg-surface-dark border-border">
                                    <h2 className="text-slate-900 dark:text-white text-lg font-bold mb-2">About</h2>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                        {profile.bio || `${profile.username} is helping keep urban trees healthy.`}
                                    </p>
                                </Card>
                            </div>

                            <GamificationWidgets
                                badges={badges}
                                leaderboard={leaderboardEntries}
                                locationLabel="Community"
                            />
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
