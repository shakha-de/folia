import React from 'react';
import { UserGamification, MOCK_LEADERBOARD, LeaderboardEntry } from '@/lib/mock';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GamificationWidgetsProps {
    gamification: UserGamification;
    leaderboard: typeof MOCK_LEADERBOARD;
}

export default function GamificationWidgets({ gamification, leaderboard }: GamificationWidgetsProps) {
    return (
        <div className="flex flex-col gap-8">
            {/* Achievements Widget */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-lg font-bold">Badges</h3>
                    <a className="text-primary text-xs font-bold uppercase tracking-wider hover:underline" href="#">View All</a>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {gamification.badges.map((badge) => (
                        <div key={badge.id} className={`flex flex-col items-center gap-2 group cursor-pointer ${!badge.unlocked ? 'opacity-50' : ''}`}>
                            <div className={`size-14 rounded-full ${badge.unlocked ? 'bg-[#28392b] border-2 border-primary group-hover:shadow-[0_0_15px_rgba(19,236,55,0.3)]' : 'bg-[#111812] border border-[#28392b] border-dashed'} flex items-center justify-center transition-all`}>
                                <span className={`material-symbols-outlined text-2xl ${badge.unlocked ? 'text-primary' : 'text-gray-500'}`}>{badge.icon}</span>
                            </div>
                            <span className={`text-[10px] text-center font-medium ${badge.unlocked ? 'text-white' : 'text-gray-400'}`}>{badge.name}</span>
                        </div>
                    ))}
                </div>
            </Card>
            {/* Leaderboard Widget */}
            <Card className="overflow-hidden p-0">
                <div className="p-5 border-b border-[#28392b] bg-[#223326]">
                    <h3 className="text-white text-lg font-bold">Local Guardians</h3>
                    <p className="text-[#9db9a1] text-xs mt-1">Top savers in <span className="text-white font-medium">Yunusabad District</span></p>
                </div>
                <div className="flex flex-col">
                    {leaderboard.map((entry: LeaderboardEntry) => (
                        <div key={entry.rank} className={`flex items-center gap-3 p-4 ${entry.isCurrentUser ? 'bg-primary/10 border-l-4 border-l-primary hover:bg-primary/15' : 'border-b border-[#28392b] hover:bg-[#28392b]'} transition-colors`}>
                            <Badge variant={entry.rank === 1 ? 'default' : 'secondary'} className={`size-6 flex items-center justify-center font-bold rounded text-xs ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : entry.rank === 2 ? 'bg-gray-400/20 text-gray-400' : entry.rank === 3 ? 'bg-orange-400/20 text-orange-400' : 'text-[#9db9a1]'}`}>
                                {entry.rank}
                            </Badge>
                            <div
                                className="bg-cover bg-center rounded-full size-8 bg-stone-700"
                                data-alt={`Avatar of ${entry.name}`}
                            ></div>
                            <div className="flex-1">
                                <p className="text-white text-sm font-semibold">{entry.name}</p>
                                <p className="text-[#9db9a1] text-xs">{entry.xp} XP</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
