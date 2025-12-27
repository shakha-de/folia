import Link from "next/link";
import { trees } from "../data/trees";

const waterLabel: Record<string, string> = {
  low: "Low water",
  medium: "Moderate water",
  high: "High water",
};

export default function AlmanacPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen px-4 md:px-10 lg:px-40 py-12 lg:py-16 selection:bg-primary selection:text-background-dark">
      <div className="max-w-300 mx-auto flex flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold text-[#8D6E63] uppercase tracking-wide">Tree Almanac</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">Learn the trees before you plant</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-body max-w-180">
            Browse climate-fit species with watering guidance, threats to watch, and quick facts tailored for hot, dry cities.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {trees.map((tree) => (
            <Link
              key={tree.slug}
              href={`/almanac/${tree.slug}`}
              className="group bg-white dark:bg-[#0f1b12] border border-slate-200 dark:border-[#28392b] rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {tree.commonName}
                </h2>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#5D4037]/10 dark:bg-[#5D4037]/30 text-[#5D4037] dark:text-[#D7CCC8]">
                  {waterLabel[tree.waterNeed]}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-2">{tree.scientificName}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{tree.summary}</p>
              <div className="flex flex-wrap gap-2">
                {tree.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#152818] text-slate-700 dark:text-[#c7d8cb] border border-slate-200 dark:border-[#28392b]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
