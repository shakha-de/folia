import React from 'react';
import { TreeDto } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TreeCardProps {
    tree: TreeDto;
}

export default function TreeCard({ tree }: TreeCardProps) {
    const isThirsty = tree.healthStatus === 'NEEDS_CARE' || tree.soilMoistureLevel === 'DRY';
    const statusText = isThirsty ? 'Thirsty' : 'Healthy';
    const statusIcon = isThirsty ? 'warning' : 'check_circle';
    const borderColor = isThirsty ? 'border-l-destructive' : 'border-l-primary';
    const badgeVariant = isThirsty ? 'destructive' : 'success';

    return (
        <Card className={`border-l-4 ${borderColor} shadow-md hover:bg-[#233328] transition-all group`}>
            <div className="flex flex-col sm:flex-row gap-5 p-4">
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
                        <Badge variant={badgeVariant} className="gap-1">
                            <span className="material-symbols-outlined text-[14px] fill-current">{statusIcon}</span>
                            {statusText}
                        </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-[#9db9a1]">Soil: <span className="text-white">{tree.soilMoistureLevel}</span></p>
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
