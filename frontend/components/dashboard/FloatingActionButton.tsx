import { Button } from "@/components/ui/button";

export default function FloatingActionButton() {
    return (
        <div className="fixed bottom-6 right-6 z-40">
            <Button
                size="icon"
                className="rounded-full size-14 shadow-lg shadow-primary/30 group"
            >
                <span className="material-symbols-outlined text-3xl">add</span>
                <div className="absolute right-16 bg-surface-light dark:bg-surface-dark text-slate-900 dark:text-white px-3 py-1 rounded-md text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none border border-border">
                    Log Activity
                </div>
            </Button>
        </div>
    );
}
