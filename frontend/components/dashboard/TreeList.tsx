import React from 'react';
import Link from 'next/link';
import { TreeDto } from '@/lib/api';
import TreeCard from './TreeCard';

interface TreeListProps {
    trees: TreeDto[];
}

export default function TreeList({ trees }: TreeListProps) {
    return (
        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h2 className="text-slate-900 dark:text-white text-2xl font-bold">My Urban Forest</h2>
                <Link
                    href="/trees"
                    className="text-sm font-medium text-primary hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
                >
                    View Map <span className="material-symbols-outlined text-sm">map</span>
                </Link>
            </div>
            {trees.length === 0 ? (
                <div className="text-center p-8 text-slate-600 dark:text-slate-300">
                    You haven&apos;t registered any trees yet. Plant one!
                </div>
            ) : (
                trees.map((tree) => (
                    <TreeCard key={tree.publicId} tree={tree} />
                ))
            )}

            <div className="flex justify-center mt-2">
                <Link
                    href="/trees"
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors py-2 px-4 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                    View all {trees.length} trees <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
            </div>
        </div>
    );
}
