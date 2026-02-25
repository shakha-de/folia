import React from 'react';
import { UserDto } from '@/lib/api';
import { UserGamification } from '@/lib/mock';

interface ProfileSectionProps {
    user: UserDto;
    gamification: UserGamification;
}

export default function ProfileSection({ user, gamification }: ProfileSectionProps) {
    const displayName = user.username || user.email;

    return (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-border shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start relative z-10">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-24 sm:size-32 border-4 border-border shrink-0 shadow-md bg-primary/15"
                        data-alt="Detailed user profile picture"
                    >
                        {/* Placeholder for avatar if no image */}
                        <div className="flex items-center justify-center w-full h-full text-slate-900 dark:text-white text-4xl font-bold opacity-60">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="flex flex-col justify-center text-center sm:text-left flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h1 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">Welcome back, {displayName}</h1>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary w-fit mx-auto sm:mx-0">
                                <span className="material-symbols-outlined text-[14px]">verified</span> Verified Guardian
                            </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-base mb-4">Current Rank: <span className="text-slate-900 dark:text-white font-semibold">{gamification.rank}</span> • {gamification.location}</p>
                        {/* Progress Bar Integrated */}
                        <div className="w-full max-w-md bg-slate-200 dark:bg-slate-800 rounded-full h-3 mb-2 mx-auto sm:mx-0">
                            <div className="bg-primary h-3 rounded-full relative" style={{ width: `${gamification.progress}%` }}>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">{gamification.progress}% to <span className="text-primary">{gamification.nextRank}</span></p>
                    </div>
                </div>
            </div>
            {/* Quick Actions / Mini Impact */}
            <div className="lg:col-span-1 bg-primary rounded-xl p-6 flex flex-col justify-between relative overflow-hidden text-background-dark">
                <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
                    <span className="material-symbols-outlined text-[150px]">eco</span>
                </div>
                <div>
                    <h3 className="font-bold text-xl mb-1">Global Impact</h3>
                    <p className="text-sm font-medium opacity-80 mb-6">Your contribution to the network</p>
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-background-dark/10 p-3 rounded-lg backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-wider font-bold opacity-70">CO2 Offset</p>
                        <p className="text-2xl font-extrabold">{gamification.co2Offset}<span className="text-sm ml-1">kg</span></p>
                    </div>
                    <div className="bg-background-dark/10 p-3 rounded-lg backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-wider font-bold opacity-70">Tree Years</p>
                        <p className="text-2xl font-extrabold">{gamification.treeYears}<span className="text-sm ml-1">yrs</span></p>
                    </div>
                </div>
            </div>
        </section>
    );
}
