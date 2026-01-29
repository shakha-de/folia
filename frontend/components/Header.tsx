"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

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
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {user?.username}
                                </span>
                                <button
                                    onClick={logout}
                                    className="h-10 items-center justify-center rounded-lg px-6 border border-transparent hover:border-slate-200 dark:hover:border-[#3b543f] text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors"
                                >
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="h-10 flex items-center justify-center rounded-lg px-6 border border-transparent hover:border-slate-200 dark:hover:border-[#3b543f] text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="sm:hidden text-slate-900 dark:text-white focus:outline-none"
                >
                    <span className="material-symbols-outlined">{isMenuOpen ? "close" : "menu"}</span>
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div className="sm:hidden bg-background-light dark:bg-background-dark border-b border-[#e5e7eb] dark:border-[#28392b] animate-in slide-in-from-top duration-300">
                    <div className="px-4 py-6 flex flex-col gap-4">
                        <Link
                            href="/almanac"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-base font-bold text-slate-700 dark:text-slate-200 hover:text-primary px-4 py-2 rounded-lg transition-colors"
                        >
                            Almanac
                        </Link>
                        <Link
                            href="/learn-more"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-base font-bold text-slate-700 dark:text-slate-200 hover:text-primary px-4 py-2 rounded-lg transition-colors"
                        >
                            Learn More
                        </Link>
                        <div className="h-px bg-slate-100 dark:bg-[#28392b] my-2"></div>
                        {isAuthenticated ? (
                            <>
                                <div className="px-4 py-2">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Signed in as</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user?.username}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-2 h-12 w-full px-4 rounded-lg bg-red-500/10 text-red-500 text-sm font-bold transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">logout</span>
                                    Log out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center h-12 rounded-lg bg-primary text-[#111812] text-sm font-bold shadow-lg shadow-primary/20 transition-colors"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
