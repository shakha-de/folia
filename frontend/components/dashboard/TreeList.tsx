import React from 'react';
import { TreeDto } from '@/lib/api';
import TreeCard from './TreeCard';

interface TreeListProps {
    trees: TreeDto[];
}

export default function TreeList({ trees }: TreeListProps) {
    return (
        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-white text-2xl font-bold">My Urban Forest</h2>
                <button className="text-sm font-medium text-primary hover:text-white transition-colors flex items-center gap-1">
                    View Map <span className="material-symbols-outlined text-sm">map</span>
                </button>
            </div>
            {trees.length === 0 ? (
                <div className="text-center p-8 text-[#9db9a1]">
                    No trees found nearby. Plant one!
                </div>
            ) : (
                trees.map((tree) => (
                    <TreeCard key={tree.publicId} tree={tree} />
                ))
            )}

            <div className="flex justify-center mt-2">
                <button className="flex items-center gap-2 text-[#9db9a1] hover:text-white font-medium text-sm transition-colors py-2 px-4 rounded hover:bg-[#28392b]">
                    View all trees <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
