import Link from "next/link";

export default function LearnMore() {
	return (
		<div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen font-display antialiased selection:bg-primary selection:text-background-dark">
			<main className="px-4 md:px-10 lg:px-40 py-12 lg:py-20 flex flex-col gap-16">
				<section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-[#28392b] bg-white/80 dark:bg-[#0f1b12]/80 shadow-2xl">
					<div className="absolute inset-0 bg-linear-to-br from-primary/15 via-transparent to-[#8D6E63]/10 dark:from-primary/10" aria-hidden></div>
					<div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 p-10 lg:p-14">
						<div className="flex flex-col gap-6 justify-center">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5D4037]/10 dark:bg-[#5D4037]/30 border border-[#8D6E63]/30 w-fit">
								<span className="material-symbols-outlined text-sm text-[#8D6E63] dark:text-[#D7CCC8]">eco</span>
								<span className="text-xs font-bold text-[#5D4037] dark:text-[#D7CCC8] uppercase tracking-wider">Learn more</span>
							</div>
							<h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
								Keep young trees alive with community care
							</h1>
							<p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-body leading-relaxed max-w-140">
								Newly planted trees are drying out because watering often stops after the ribbon-cutting. Together we can close that gap with simple routines, shared responsibility, and quick alerts when a tree is at risk.
							</p>
							<div className="flex flex-wrap gap-4">
								<Link
									className="flex h-12 md:h-14 min-w-44 items-center justify-center rounded-lg bg-primary hover:bg-[#0fd630] transition-colors px-6 text-[#111812] text-base font-bold shadow-lg shadow-primary/20"
									href="/"
								>
									Join watering rota
								</Link>
								<Link
									className="flex h-12 items-center justify-center md:h-14 min-w-40 rounded-lg bg-white dark:bg-[#28392b] border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-[#324736] transition-colors px-6 text-slate-900 dark:text-white text-base font-bold"
									href="/"
								>
									Back to home
								</Link>
							</div>
						</div>
						<div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/20 dark:border-white/5">
							<div
								className="h-full min-h-72 bg-cover bg-center"
								style={{
									backgroundImage:
										"linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.45)), url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80')",
								}}
								aria-hidden
							></div>
							<div className="absolute bottom-4 left-4 right-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 shadow-lg">
								<div className="flex items-start gap-3">
									<span className="material-symbols-outlined text-primary mt-1">water_drop</span>
									<div>
										<p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Why it matters</p>
										<p className="text-sm font-semibold">Water within the first 2 years to lock in survival.</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<div className="bg-white dark:bg-[#0f1b12] rounded-2xl p-8 border border-slate-200 dark:border-[#28392b] shadow-md">
						<div className="flex items-center gap-3 mb-4">
							<span className="material-symbols-outlined text-primary">warning</span>
							<h2 className="text-2xl font-bold">The problem today</h2>
						</div>
						<ul className="space-y-3 text-slate-600 dark:text-slate-300 font-body">
							<li className="flex gap-3">
								<span className="material-symbols-outlined text-[#8D6E63]">timer</span>
								<p>New trees are forgotten after planting; scheduled watering stops within weeks.</p>
							</li>
							<li className="flex gap-3">
								<span className="material-symbols-outlined text-[#8D6E63]">heat</span>
								<p>Heatwaves intensify soil evaporation, leaving roots exposed and stressed.</p>
							</li>
							<li className="flex gap-3">
								<span className="material-symbols-outlined text-[#8D6E63]">visibility_off</span>
								<p>No simple visibility on which trees were watered and when they were last checked.</p>
							</li>
						</ul>
					</div>

					<div className="bg-white dark:bg-[#0f1b12] rounded-2xl p-8 border border-slate-200 dark:border-[#28392b] shadow-md">
						<div className="flex items-center gap-3 mb-4">
							<span className="material-symbols-outlined text-primary">volunteer_activism</span>
							<h2 className="text-2xl font-bold">How you can help</h2>
						</div>
						<ol className="space-y-3 text-slate-600 dark:text-slate-300 font-body">
							<li className="flex gap-3">
								<span className="material-symbols-outlined text-[#8D6E63]">event_available</span>
								<div>
									<p className="font-semibold">Commit to a slot</p>
									<p className="text-sm">Pick a weekly 20-minute window to water 5 nearby saplings.</p>
								</div>
							</li>
							<li className="flex gap-3">
								<span className="material-symbols-outlined text-[#8D6E63]">check_circle</span>
								<div>
									<p className="font-semibold">Log each visit</p>
									<p className="text-sm">Mark trees as watered so others avoid duplication and gaps.</p>
								</div>
							</li>
							<li className="flex gap-3">
								<span className="material-symbols-outlined text-[#8D6E63]">campaign</span>
								<div>
									<p className="font-semibold">Alert the crew</p>
									<p className="text-sm">Report heat stress, broken bags, or vandalism for quick fixes.</p>
								</div>
							</li>
						</ol>
					</div>
				</section>

				<section className="bg-slate-100/60 dark:bg-[#0c1a0e] border border-slate-200 dark:border-[#1f2f21] rounded-2xl p-8 lg:p-10 shadow-inner">
					<div className="max-w-300 mx-auto">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-white dark:bg-[#152818] rounded-xl p-6 border border-slate-200 dark:border-[#28392b] shadow-sm">
								<p className="text-slate-500 dark:text-[#9db9a1] text-sm font-medium uppercase tracking-wide">Young trees at risk</p>
								<p className="text-slate-900 dark:text-white text-4xl font-black mt-2">1,200</p>
								<p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Need watering this week</p>
							</div>
							<div className="bg-white dark:bg-[#152818] rounded-xl p-6 border border-slate-200 dark:border-[#28392b] shadow-sm">
								<p className="text-slate-500 dark:text-[#9db9a1] text-sm font-medium uppercase tracking-wide">Days without water</p>
								<p className="text-slate-900 dark:text-white text-4xl font-black mt-2">9</p>
								<p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Average gap in hot zones</p>
							</div>
							<div className="bg-white dark:bg-[#152818] rounded-xl p-6 border border-slate-200 dark:border-[#28392b] shadow-sm">
								<p className="text-slate-500 dark:text-[#9db9a1] text-sm font-medium uppercase tracking-wide">Active guardians</p>
								<p className="text-slate-900 dark:text-white text-4xl font-black mt-2">2,500+</p>
								<p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Ready to be paired with trees</p>
							</div>
						</div>
					</div>
				</section>

				<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 bg-white dark:bg-[#0f1b12] rounded-2xl p-8 border border-slate-200 dark:border-[#28392b] shadow-md">
						<div className="flex items-center gap-3 mb-4">
							<span className="material-symbols-outlined text-primary">route</span>
							<h2 className="text-2xl font-bold">3-step action plan</h2>
						</div>
						<div className="flex flex-col gap-5">
							<div className="flex gap-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-bold">1</div>
								<div>
									<p className="font-semibold">Map nearby saplings</p>
									<p className="text-sm text-slate-600 dark:text-slate-300">Claim trees within walking distance and set reminders after heat alerts.</p>
								</div>
							</div>
							<div className="flex gap-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-bold">2</div>
								<div>
									<p className="font-semibold">Water with 15 liters</p>
									<p className="text-sm text-slate-600 dark:text-slate-300">Use slow pours or tree bags to soak roots; repeat every 3–4 days in heat.</p>
								</div>
							</div>
							<div className="flex gap-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-bold">3</div>
								<div>
									<p className="font-semibold">Log & flag issues</p>
									<p className="text-sm text-slate-600 dark:text-slate-300">Mark watered, upload a quick photo, and flag dry soil or damaged stakes.</p>
								</div>
							</div>
						</div>
					</div>
					<div className="bg-[#e6f6eb] dark:bg-[#13241a] border border-primary/30 dark:border-primary/40 rounded-2xl p-8 shadow-md flex flex-col gap-4">
						<h3 className="text-xl font-bold text-slate-900 dark:text-white">Interested ?</h3>
						<p className="text-slate-700 dark:text-slate-300 text-sm">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus id lectus velit. Curabitur a magna posuere velit porttitor feugiat nec nec mi. Nunc fringilla mollis enim in luctus. Sed commodo erat et tellus pharetra egestas. Sed a metus nisi.
						</p>
						<button className="flex h-12 items-center justify-center rounded-lg bg-primary hover:bg-[#0fd630] transition-colors px-4 text-[#111812] text-sm font-bold shadow-lg shadow-primary/20">
							Something wise
						</button>
					</div>
				</section>

				<section className="bg-background-light dark:bg-background-dark border border-slate-200 dark:border-[#28392b] rounded-2xl p-8 lg:p-10 shadow-lg">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
						<div className="space-y-2 max-w-180">
							<p className="text-sm font-medium uppercase tracking-wide text-[#8D6E63] dark:text-[#D7CCC8]">Take the next step</p>
							<h2 className="text-3xl font-black">Adopt a weekly watering loop</h2>
							<p className="text-slate-600 dark:text-slate-300 font-body">Pair with 10 nearby trees, get reminders, and keep them thriving through the hottest months.</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<button className="h-12 px-6 rounded-lg bg-primary hover:bg-[#0fd630] text-[#111812] font-bold shadow-lg shadow-primary/20 transition-colors">
								Start now
							</button>
							<Link className="h-12 px-6 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#28392b] text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-[#162718] transition-colors" href="/">
								Talk to the team
							</Link>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
