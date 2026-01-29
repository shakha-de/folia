import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full bg-background-light dark:bg-background-dark pt-10 pb-6 px-4 md:px-10 lg:px-40">
            <div className="max-w-6xl mx-auto border-t border-slate-200 dark:border-[#28392b] pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-600">emoji_nature</span>
                        <p className="text-slate-500 dark:text-[#9db9a1] text-sm font-normal">© 2026 Folia. Growing stronger together.</p>
                    </div>
                    <div className="flex items-center gap-8">
                        <Link className="text-slate-600 dark:text-[#9db9a1] hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Privacy Policy</Link>
                        <Link className="text-slate-600 dark:text-[#9db9a1] hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
