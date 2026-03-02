"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { extractApiErrorMessage } from "@/lib/apiErrorMessage";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const successMessage = await register({ username, email, password });
            toast.success(successMessage || "Registration successful");
            router.push("/dashboard");
        } catch (err: unknown) {
            toast.error(extractApiErrorMessage(err, "Registration failed. Please try again."));
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
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Username
                            </label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="naturelover123"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                    <div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? "Creating account..." : "Sign up"}
                        </Button>
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
