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

interface LoginCredentials {
    identifier?: string;
    username?: string;
    email?: string;
    password: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    [key: string]: unknown;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
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
        // Scrub any stale mock tokens that would cause MalformedJwtException on the server.
        // A valid JWT always has exactly 2 period characters (header.payload.signature).
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken && (storedToken.match(/\./g) || []).length !== 2) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
            return;
        }
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        if (MOCK_AUTH_ENABLED) {
            // Mock authentication - no backend call
            console.log("🎭 Mock authentication enabled - bypassing backend");
            console.log("Credentials:", credentials);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const identifier = String(
                credentials?.identifier ?? credentials?.username ?? credentials?.email ?? ""
            ).trim();
            const identifierLooksLikeEmail = identifier.includes("@");

            const mockUser = {
                ...MOCK_USER,
                username: identifier || MOCK_USER.username,
                email: identifierLooksLikeEmail
                    ? identifier
                    : (credentials?.email ?? MOCK_USER.email),
            };

            // Set mock tokens and user data
            localStorage.setItem("accessToken", "mock-access-token");
            localStorage.setItem("refreshToken", "mock-refresh-token");
            localStorage.setItem("user", JSON.stringify(mockUser));

            setUser(mockUser);
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

    const register = async (data: RegisterData) => {
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
