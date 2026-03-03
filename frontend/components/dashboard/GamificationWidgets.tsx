import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GamificationBadge {
    id: string;
    name: string;
    icon: string;
    unlocked: boolean;
}

interface GamificationLeaderboardEntry {
    rank: number;
    name: string;
    xp: number;
    isCurrentUser?: boolean;
}

interface GamificationWidgetsProps {
    badges: GamificationBadge[];
    leaderboard: GamificationLeaderboardEntry[];
    locationLabel?: string;
}

export default function GamificationWidgets({
    badges,
    leaderboard,
    locationLabel = 'Yunusabad District',
}: Readonly<GamificationWidgetsProps>) {
    return (
        <div className="flex flex-col gap-8">
            {/* Achievements Widget */}
            <Card className="p-6 bg-surface-light dark:bg-surface-dark border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold">Badges</h3>
                    <Link className="text-primary text-xs font-bold uppercase tracking-wider hover:underline" href="/learn-more">View All</Link>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {badges.map((badge) => (
                        <div key={badge.id} className={`flex flex-col items-center gap-2 group cursor-pointer ${badge.unlocked ? '' : 'opacity-50'}`}>
                            <div className={`size-14 rounded-full ${badge.unlocked ? 'bg-slate-200 dark:bg-slate-700 border-2 border-primary group-hover:shadow-[0_0_15px_rgba(19,236,55,0.3)]' : 'bg-slate-100 dark:bg-slate-800 border border-border border-dashed'} flex items-center justify-center transition-all`}>
                                <span className={`material-symbols-outlined text-2xl ${badge.unlocked ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>{badge.icon}</span>
                            </div>
                            <span className={`text-[10px] text-center font-medium ${badge.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{badge.name}</span>
                        </div>
                    ))}
                </div>
            </Card>
            {/* Leaderboard Widget */}
            <Card className="overflow-hidden p-0 bg-surface-light dark:bg-surface-dark border-border">
                <div className="p-5 border-b border-border bg-slate-100 dark:bg-slate-800">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold">Local Guardians</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs mt-1">Top savers in <span className="text-slate-900 dark:text-white font-medium">{locationLabel}</span></p>
                </div>
                <div className="flex flex-col">
                    {leaderboard.map((entry) => {
                        const getRankClassName = (rank: number) => {
                            switch (rank) {
                                case 1:
                                    return 'bg-yellow-500/20 text-yellow-500';
                                case 2:
                                    return 'bg-gray-400/20 text-gray-400';
                                case 3:
                                    return 'bg-orange-400/20 text-orange-400';
                                default:
                                    return 'text-[#9db9a1]';
                            }
                        };

                        const rankClassName = getRankClassName(entry.rank);

                        return (
                        <div key={entry.rank} className={`flex items-center gap-3 p-4 ${entry.isCurrentUser ? 'bg-primary/10 border-l-4 border-l-primary hover:bg-primary/15' : 'border-b border-border hover:bg-slate-100 dark:hover:bg-slate-800'} transition-colors`}>
                            <Badge variant={entry.rank === 1 ? 'default' : 'secondary'} className={`size-6 flex items-center justify-center font-bold rounded text-xs ${rankClassName}`}>
                                {entry.rank}
                            </Badge>
                            <div
                                className="bg-cover bg-center rounded-full size-8 bg-primary/15"
                                data-alt={`Avatar of ${entry.name}`}
                            ></div>
                            <div className="flex-1">
                                <p className="text-slate-900 dark:text-white text-sm font-semibold">{entry.name}</p>
                                <p className="text-slate-600 dark:text-slate-300 text-xs">{entry.xp} XP</p>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
