"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api, { ApiResponse, UserDto } from "@/lib/api";

interface User {
    uuid: string;
    username: string;
    email: string;
    role: string;
    enabled: boolean;
}

interface AuthResponse {
    token: string;
    refreshToken: string;
    user: UserDto;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if mock authentication is enabled
const MOCK_AUTH_ENABLED = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

// Mock user data
const MOCK_USER: User = {
    uuid: "mock-uuid-123",
    username: "demo_user",
    email: "demo@folia.com",
    role: "USER",
    enabled: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: any) => {
        if (MOCK_AUTH_ENABLED) {
            // Mock authentication - no backend call
            console.log("🎭 Mock authentication enabled - bypassing backend");
            console.log("Credentials:", credentials);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Set mock tokens and user data
            localStorage.setItem("accessToken", "mock-access-token");
            localStorage.setItem("refreshToken", "mock-refresh-token");
            localStorage.setItem("user", JSON.stringify(MOCK_USER));

            setUser(MOCK_USER);
            return;
        }

        // Real authentication
        try {
            const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", credentials);
            const { token, refreshToken, user: userData } = response.data.data;

            localStorage.setItem("accessToken", token);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("user", JSON.stringify(userData));

            setUser(userData);
        } catch (error) {
            throw error;
        }
    };

    const register = async (data: any) => {
        if (MOCK_AUTH_ENABLED) {
            // Mock registration - no backend call
            console.log("🎭 Mock authentication enabled - bypassing backend");
            console.log("Registration data:", data);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Create mock user with provided username/email
            const mockUser = {
                ...MOCK_USER,
                username: data.username,
                email: data.email,
            };

            localStorage.setItem("accessToken", "mock-access-token");
            localStorage.setItem("refreshToken", "mock-refresh-token");
            localStorage.setItem("user", JSON.stringify(mockUser));

            setUser(mockUser);
            return;
        }

        // Real registration
        try {
            const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", data);

            if (response.data.data?.token) {
                const { token, refreshToken, user: userData } = response.data.data;
                localStorage.setItem("accessToken", token);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        if (MOCK_AUTH_ENABLED) {
            console.log("🎭 Mock logout");
        }

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
