"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { useTheme } from "next-themes";

function AppToasts() {
    const { resolvedTheme } = useTheme();

    return (
        <ToastContainer
            position="top-right"
            autoClose={3500}
            closeOnClick
            pauseOnHover
            draggable
            theme={resolvedTheme === "dark" ? "dark" : "light"}
        />
    );
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <AppToasts />
        </ThemeProvider>
    );
}
