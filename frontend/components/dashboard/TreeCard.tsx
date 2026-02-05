import React from 'react';
import { TreeDto } from '@/lib/api';

interface TreeCardProps {
    tree: TreeDto;
}

export default function TreeCard({ tree }: TreeCardProps) {
    const isThirsty = tree.healthStatus === 'NEEDS_CARE' || tree.soilMoistureLevel === 'DRY';
    // const statusColor = isThirsty ? 'red' : 'primary';
    const statusText = isThirsty ? 'Thirsty' : 'Healthy';
    const statusIcon = isThirsty ? 'warning' : 'check_circle';
    const borderColor = isThirsty ? 'border-red-500' : 'border-primary';
    const badgeBg = isThirsty ? 'bg-red-500/20' : 'bg-primary/20';
    const badgeText = isThirsty ? 'text-red-400' : 'text-primary';

    return (
        <div className={`bg-[#1c2a20] rounded-xl p-4 border-l-4 ${borderColor} shadow-md hover:bg-[#233328] transition-all group`}>
            <div className="flex flex-col sm:flex-row gap-5">
                <div
                    className="w-full sm:w-40 h-32 bg-center bg-cover rounded-lg shrink-0 relative overflow-hidden bg-stone-700"

                >
                    {/* Placeholder image logic */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-white opacity-50">forest</span>
                    </div>
                </div>
                <div className="flex flex-col flex-1 justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-white text-lg font-bold">{tree.commonName || tree.species}</h3>
                            <p className="text-[#9db9a1] text-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                Lat: {typeof tree.location === 'object' && 'lat' in tree.location ? tree.location.lat.toFixed(4) : 'N/A'},
                                Lng: {typeof tree.location === 'object' && 'lng' in tree.location ? tree.location.lng.toFixed(4) : 'N/A'}
                            </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold ${badgeBg} ${badgeText}`}>
                            <span className="material-symbols-outlined text-[14px] fill-current">{statusIcon}</span> {statusText}
                        </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-[#9db9a1]">Soil: <span className="text-white">{tree.soilMoistureLevel}</span></p>
                        <button className="bg-[#28392b] hover:bg-[#3b543f] text-white font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span> Manage
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
