"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-shadow-slate-900 dark:text-white antialiased selection:bg-primary selection:text-background-dark flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 max-w-4xl mx-auto py-16 px-6 md:px-10">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">Privacy Policy</h1>

                <div className="prose dark:prose-invert prose-slate max-w-none space-y-6 text-slate-600 dark:text-slate-300 font-body leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">1. Introduction</h2>
                        <p>Welcome to Folia. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">2. Information We Collect</h2>
                        <p>We collect personal information that you voluntarily provide to us when you register on the Website, express an interest in obtaining information about us or our products and services, when you participate in activities on the Website or otherwise when you contact us.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">3. How We Use Your Information</h2>
                        <p>We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">4. Will Your Information Be Shared With Anyone?</h2>
                        <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">5. How Long Do We Keep Your Information?</h2>
                        <p>We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy unless otherwise required by law.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">6. How Do We Keep Your Information Safe?</h2>
                        <p>We aim to protect your personal information through a system of organizational and technical security measures.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">7. Updates To This Policy</h2>
                        <p>We may update this privacy policy from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
