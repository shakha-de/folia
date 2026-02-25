import React from 'react';
import { TreeStats } from '@/lib/api';
import { Card } from '@/components/ui/card';

interface StatsOverviewProps {
    stats: TreeStats | null;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    trendText: string;
}

function StatCard({ title, value, icon, trendText }: StatCardProps) {
    return (
        <Card className="flex flex-col gap-2 rounded-xl p-6 bg-surface-light dark:bg-surface-dark border-border hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start">
                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium uppercase tracking-wider">{title}</p>
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-300">{icon}</span>
            </div>
            <p className="text-slate-900 dark:text-white text-3xl font-bold">{value}</p>
            <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>{trendText}</span>
            </div>
        </Card>
    );
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
    if (!stats) return null;

    return (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Trees Registered" value={stats.totalTrees} icon="forest" trendText="+1 this month" />
            <StatCard title="Waterings Logged" value={stats.treesNeedingWater} icon="water_drop" trendText="+5 this week" />
            <StatCard title="Liters Contributed" value="850 L" icon="opacity" trendText="+120L this week" />
        </section>
    );
}
