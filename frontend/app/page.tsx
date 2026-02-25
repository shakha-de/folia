"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-shadow-slate-900 dark:text-white antialiased selection:bg-primary selection:text-background-dark flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-col overflow-x-hidden">
        <section className="relative w-full flex-1 flex flex-col justify-center py-10 lg:py-20 px-4 md:px-10 lg:px-40">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="flex flex-col gap-6 order-2 lg:order-1">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5D4037]/10 dark:bg-[#5D4037]/30 border border-[#8D6E63]/30 w-fit">
                    <span className="material-symbols-outlined text-sm text-[#8D6E63] dark:text-[#D7CCC8]">public</span>
                    <span className="text-xs font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase tracking-wider">Central Asia Initiative</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">Revive our <span className="text-primary">Roots</span></h1>
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-body leading-relaxed max-w-xl">Join the community saving urban trees in the arid heart of Central Asia. Together, we can cool our cities, combat heatwaves, and protect our future canopy.</p>
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <button
                    onClick={() => window.location.assign("/register")}
                    className="flex h-12 md:h-14 min-w-40 cursor-pointer items-center justify-center rounded-lg bg-primary hover:bg-[#0fd630] transition-colors px-6 text-[#111812] text-base font-bold shadow-lg shadow-primary/20"
                  >
                    Become guardian
                  </button>
                  <Link
                    href="/learn-more"
                    className="flex h-12 items-center justify-center md:h-14 min-w-40 cursor-pointer rounded-lg bg-white dark:bg-[#28392b] border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-[#324736] transition-colors px-6 text-slate-900 dark:text-white text-base font-bold"
                  >
                    Learn more
                  </Link>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Already a guardian?{" "}
                  <Link href="/dashboard" className="text-primary hover:underline font-medium">
                    Go to your dashboard
                  </Link>
                </p>
              </div>
              <div className="relative order-1 lg:order-2">
                <div className="aspect-4/3 w-full rounded-2xl overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent mix-blend-multiply pointer-events-none"></div>
                  <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAG8m0AuBjVZyLUFRoGZjv23ZKkFY4Tw0F0QDR12owXHGvIKycmRJpc8U4Ho_dIhVy5XORImar2dEdSyrBnPuLwiAH91fAJR-mqPxaH1OHYzn2pegHoPZt024JRbXIzr5ybSOwz1H_iPXS8BvbdMpA-jW-8n9PQG5PdF3scBcH39ANh6xJwWt8ulNEmwYvGM7iKr7lvnbQs0iOiET5tPvpOTUABSO8bRPQP9c1D20LWPbW3BsrqTVJUJC3CRX-5hsAHwCT8fQt3RK_2')" }} data-alt="A resilient green tree growing in a sun-drenched arid city street"></div>

                  <div className="absolute bottom-6 left-6 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 shadow-lg max-w-xs">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary mt-1">water_drop</span>
                      <div>
                        <p className="text-xs to-slate-500 dark:text-slate-400 uppercase font-bold">Priority Zone</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Tashkent City Centre</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full rounded-2xl border-2 border-[#8D6E63]/20 dark:border-[#8D6E63]/10"></div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-slate-100/50 dark:bg-[#0c1a0e] py-16 px-4 md:px-10 lg:px-40 border-y border-slate-200 dark:border-[#1f2f21]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-white dark:bg-[#152818] rounded-xl p-8 border border-slate-200 dark:border-[#28392b] shadow-sm hover:border-primary/50 transition-colors group">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary text-2xl">local_florist</span>
                </div>
                <p className="text-slate-500 dark:text-[#9db9a1] text-sm font-medium uppercase tracking-wide">Trees Saved</p>
                <p className="text-slate-900 dark:text-white text-4xl font-black mt-2">10,000+</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">From drought &amp; neglect</p>
              </div>
              <div className="flex-1 bg-white dark:bg-[#152818] rounded-xl p-8 border border-slate-200 dark:border-[#28392b] shadow-sm hover:border-primary/50 transition-colors group">
                <div className="size-12 rounded-full bg-[#8D6E63]/10 dark:bg-[#8D6E63]/20 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[#8D6E63] dark:text-[#D7CCC8] text-2xl">groups</span>
                </div>
                <p className="text-slate-500 dark:text-[#9db9a1] text-sm font-medium uppercase tracking-wide">Active Guardians</p>
                <p className="text-slate-900 dark:text-white text-4xl font-black mt-2">2,500+</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Monitoring daily</p>
              </div>
              <div className="flex-1 bg-white dark:bg-[#152818] rounded-xl p-8 border border-slate-200 dark:border-[#28392b] shadow-sm hover:border-primary/50 transition-colors group">
                <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-2xl">location_city</span>
                </div>
                <p className="text-slate-500 dark:text-[#9db9a1] text-sm font-medium uppercase tracking-wide">Cities Impacted</p>
                <p className="text-slate-900 dark:text-white text-4xl font-black mt-2">12</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Across the region</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
