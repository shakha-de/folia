import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardTopBarProps {
    displayName: string;
}

const navItems = [
    { label: "Dashboard", href: "/dashboard", active: true },
    { label: "My Trees", href: "/almanac", active: false },
    { label: "Community", href: "/learn-more", active: false },
    { label: "Learn", href: "/learn-more", active: false },
];

export default function DashboardTopBar({ displayName }: DashboardTopBarProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-4 sm:px-10 py-3">
            <div className="flex items-center justify-between mx-auto max-w-7xl">
                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                    <div className="flex items-center justify-center size-8 rounded bg-primary/20 text-primary">
                        <span className="material-symbols-outlined text-2xl">forest</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">Folia</h2>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={item.active
                                ? "text-slate-900 dark:text-white text-sm font-medium hover:text-primary transition-colors"
                                : "text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors"
                            }
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="relative bg-surface-light dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 size-2 bg-primary rounded-full"></span>
                    </Button>

                    <div className="bg-primary/15 rounded-full size-10 border-2 border-border flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
}
