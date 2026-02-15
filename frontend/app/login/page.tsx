"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login({ identifier, password });
            router.push("/");
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid credentials. Please try again.");
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
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-[#9db9a1]">
                        Login to your guardian account
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
                            <label htmlFor="identifier" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Username or Email
                            </label>
                            <Input
                                id="identifier"
                                name="identifier"
                                type="text"
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="guardian@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-[#9db9a1] cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-bold text-primary hover:text-[#0fd630] transition-colors">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? "Signing in..." : "Login"}
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-600 dark:text-[#9db9a1]">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-bold text-primary hover:text-[#0fd630] transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
