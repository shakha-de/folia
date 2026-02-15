import React from 'react';
import { TreeStats } from '@/lib/api';
import { Card } from '@/components/ui/card';

interface StatsOverviewProps {
    stats: TreeStats | null;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
    if (!stats) return null;

    return (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="flex flex-col gap-2 p-6 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                    <p className="text-[#9db9a1] text-sm font-medium uppercase tracking-wider">Trees Registered</p>
                    <span className="material-symbols-outlined text-[#9db9a1]">forest</span>
                </div>
                <p className="text-white text-3xl font-bold">{stats.totalTrees}</p>
                <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span>+1 this month</span>
                </div>
            </Card>
            <Card className="flex flex-col gap-2 p-6 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                    <p className="text-[#9db9a1] text-sm font-medium uppercase tracking-wider">Trees Needing Water</p>
                    <span className="material-symbols-outlined text-[#9db9a1]">water_drop</span>
                </div>
                <p className="text-white text-3xl font-bold">{stats.treesNeedingWater}</p>
                <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span>+5 this week</span>
                </div>
            </Card>
            <Card className="flex flex-col gap-2 p-6 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                    <p className="text-[#9db9a1] text-sm font-medium uppercase tracking-wider">Liters Contributed</p>
                    <span className="material-symbols-outlined text-[#9db9a1]">opacity</span>
                </div>
                <p className="text-white text-3xl font-bold">850 L</p>
                <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span>+120L this week</span>
                </div>
            </Card>
        </section>
    );
}
