"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="w-full border-b border-[#e5e7eb] dark:border-[#28392b] bg-background-light dark:bg-background-dark sticky top-0 z-50">
            <div className="px-4 md:px-10 lg:px-10 flex items-center justify-between py-4 max-w-7xl mx-auto">
                <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                    <span className="material-symbols-outlined text-primary text-3xl">Forest</span>
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Folia</h2>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center gap-8">
                    <div className="flex items-center gap-6 mr-4">
                        <Link
                            href="/almanac"
                            className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors"
                        >
                            Almanac
                        </Link>
                        <Link
                            href="/learn-more"
                            className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors"
                        >
                            Learn More
                        </Link>
                    </div>

                    <div className="h-6 w-px bg-slate-200 dark:bg-[#28392b]"></div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {user?.username}
                                </span>
                                <Button
                                    variant="ghost"
                                    onClick={logout}
                                >
                                    Log out
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                asChild
                            >
                                <Link href="/login">Log in</Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <SheetTrigger asChild className="sm:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="bg-background-light dark:bg-background-dark border-l border-[#e5e7eb] dark:border-[#28392b]">
                        <div className="flex flex-col gap-6 mt-8">
                            <SheetClose asChild>
                                <Link
                                    href="/almanac"
                                    className="text-base font-bold text-slate-700 dark:text-slate-200 hover:text-primary px-4 py-2 rounded-lg transition-colors"
                                >
                                    Almanac
                                </Link>
                            </SheetClose>
                            <SheetClose asChild>
                                <Link
                                    href="/learn-more"
                                    className="text-base font-bold text-slate-700 dark:text-slate-200 hover:text-primary px-4 py-2 rounded-lg transition-colors"
                                >
                                    Learn More
                                </Link>
                            </SheetClose>
                            <div className="h-px bg-slate-100 dark:bg-[#28392b] my-2"></div>
                            <div className="px-4">
                                <ThemeToggle />
                            </div>
                            {isAuthenticated ? (
                                <>
                                    <div className="px-4 py-2">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Signed in as</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user?.username}</p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="mx-4"
                                    >
                                        <span className="material-symbols-outlined text-sm mr-2">logout</span>
                                        Log out
                                    </Button>
                                </>
                            ) : (
                                <SheetClose asChild>
                                    <Button asChild className="mx-4">
                                        <Link href="/login">Log in</Link>
                                    </Button>
                                </SheetClose>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}
