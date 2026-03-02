import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FloatingActionButton() {
    return (
        <div className="fixed bottom-6 right-6 z-40">
            <Button
                asChild
                size="icon"
                className="rounded-full size-14 shadow-lg shadow-primary/30 group"
            >
                <Link href="/trees?register=true" aria-label="Register tree">
                    <span className="material-symbols-outlined text-3xl">add</span>
                    <div className="absolute right-16 bg-surface-light dark:bg-surface-dark text-slate-900 dark:text-white px-3 py-1 rounded-md text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none border border-border">
                        Register Tree
                    </div>
                </Link>
            </Button>
        </div>
    );
}
