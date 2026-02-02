"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfService() {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-shadow-slate-900 dark:text-white antialiased selection:bg-primary selection:text-background-dark flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 max-w-4xl mx-auto py-16 px-6 md:px-10">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">Terms of Service</h1>

                <div className="prose dark:prose-invert prose-slate max-w-none space-y-6 text-slate-600 dark:text-slate-300 font-body leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">1. Agreement to Terms</h2>
                        <p>These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Folia ("we," "us" or "our"), concerning your access to and use of our website.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">2. Intellectual Property Rights</h2>
                        <p>Unless otherwise indicated, the Website is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Website (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">3. User Representations</h2>
                        <p>By using the Website, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">4. Prohibited Activities</h2>
                        <p>You may not access or use the Website for any purpose other than that for which we make the Website available. The Website may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">5. Term and Termination</h2>
                        <p>These Terms of Service shall remain in full force and effect while you use the Website. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE WEBSITE.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">6. Governing Law</h2>
                        <p>These terms shall be governed by and defined following the laws of our jurisdiction. Folia and yourself irrevocably consent that the courts of our jurisdiction shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
