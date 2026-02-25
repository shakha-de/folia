import React from 'react';
import { TreeDto } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TreeCardProps {
    tree: TreeDto;
}

export default function TreeCard({ tree }: TreeCardProps) {
    const isThirsty = tree.healthStatus === 'STRESSED' || tree.healthStatus === 'DYING' || tree.soilMoistureLevel === 'DRY';
    const statusText = isThirsty ? 'Thirsty' : 'Healthy';
    const statusIcon = isThirsty ? 'warning' : 'check_circle';
    const borderColor = isThirsty ? 'border-l-destructive' : 'border-l-primary';
    const badgeVariant = isThirsty ? 'destructive' : 'success';

    return (
        <Card className={`border-l-4 ${borderColor} bg-surface-light dark:bg-surface-dark border-border shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group`}>
            <div className="flex flex-col sm:flex-row gap-5 p-4">
                <div
                    className="w-full sm:w-40 h-32 bg-center bg-cover rounded-lg shrink-0 relative overflow-hidden bg-primary/15"

                >
                    {/* Placeholder image logic */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-slate-900 dark:text-white opacity-50">forest</span>
                    </div>
                </div>
                <div className="flex flex-col flex-1 justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-slate-900 dark:text-white text-lg font-bold">{tree.commonName || tree.species}</h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                Lat: {tree.lat?.toFixed(4) ?? 'N/A'},
                                Lng: {tree.lng?.toFixed(4) ?? 'N/A'}
                            </p>
                        </div>
                        <Badge variant={badgeVariant} className="gap-1">
                            <span className="material-symbols-outlined text-[14px] fill-current">{statusIcon}</span>
                            {statusText}
                        </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-slate-600 dark:text-slate-300">Soil: <span className="text-slate-900 dark:text-white">{tree.soilMoistureLevel}</span></p>
                        <Button variant="secondary" size="sm" className="gap-2">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Manage
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
