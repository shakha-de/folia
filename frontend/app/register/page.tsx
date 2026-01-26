"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await register({ username, email, password });
            router.push("/");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please check your details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4 font-display">
            <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-[#152818] rounded-2xl border border-slate-200 dark:border-[#28392b] shadow-xl">
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary text-4xl">Forest</span>
                        <h2 className="text-slate-900 dark:text-white text-2xl font-black">Folia</h2>
                    </Link>
                    <h2 className="mt-6 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Create account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-[#9db9a1]">
                        Join the community of tree guardians
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#28392b] bg-slate-50 dark:bg-[#0c1a0e] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden"
                                placeholder="naturelover123"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#28392b] bg-slate-50 dark:bg-[#0c1a0e] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden"
                                placeholder="guardian@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#28392b] bg-slate-50 dark:bg-[#0c1a0e] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black rounded-xl text-[#111812] bg-primary hover:bg-[#0fd630] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            {isLoading ? "Creating account..." : "Sign up"}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-600 dark:text-[#9db9a1]">
                        Already have an account?{" "}
                        <Link href="/login" className="font-bold text-primary hover:text-[#0fd630] transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
