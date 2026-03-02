"use client";

import { Button } from "@/components/ui/button";

interface ConfirmLogoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export default function ConfirmLogoutDialog({
    open,
    onOpenChange,
    onConfirm,
}: ConfirmLogoutDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <button
                aria-label="Close logout confirmation"
                onClick={() => onOpenChange(false)}
                className="absolute inset-0 bg-black/60"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-confirm-title"
                aria-describedby="logout-confirm-description"
                className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-[#28392b] bg-background-light dark:bg-background-dark shadow-2xl p-6"
            >
                <h2 id="logout-confirm-title" className="text-lg font-bold text-slate-900 dark:text-white">
                    Log out?
                </h2>
                <p id="logout-confirm-description" className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    You will need to sign in again to continue.
                </p>
                <div className="mt-6 flex gap-3 justify-end">
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Log out
                    </Button>
                </div>
            </div>
        </div>
    );
}
