import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { trees } from "../../data/trees";

export function generateStaticParams() {
  return trees.map((tree) => ({ slug: tree.slug }));
}

export default async function TreePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tree = trees.find((t) => t.slug === slug);

  if (!tree) {
    return notFound();
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen px-4 md:px-10 lg:px-40 py-12 lg:py-16 selection:bg-primary selection:text-background-dark">
      <div className="max-w-260 mx-auto flex flex-col gap-10">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#8D6E63] uppercase tracking-wide">Tree Almanac</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">{tree.commonName}</h1>
            <p className="text-md text-slate-500 dark:text-slate-300 italic">{tree.scientificName}</p>
          </div>
          <Link
            href="/almanac"
            className="text-sm font-semibold text-primary hover:text-[#0fd630] transition-colors"
          >
            ← Back to list
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="bg-white dark:bg-[#0f1b12] border border-slate-200 dark:border-[#28392b] rounded-2xl overflow-hidden shadow-md">
            <div className="relative aspect-4/3">
              <Image
                src={tree.image}
                alt={tree.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute bottom-3 left-3 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-3 py-2 rounded-lg border border-white/15 shadow-lg max-w-60">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5">copyright</span>
                  <p className="text-xs leading-snug text-slate-700 dark:text-slate-200">
                    {tree.imageAuthor}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300 font-body leading-relaxed">{tree.description}</p>
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
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-[#0f1b12] border border-slate-200 dark:border-[#28392b] rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold mb-3">Quick facts</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-200">
                <div>
                  <dt className="font-semibold">Family</dt>
                  <dd>{tree.family}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Regions</dt>
                  <dd>{tree.regions.join(", ")}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Climate fit</dt>
                  <dd>{tree.climate}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Water need</dt>
                  <dd className="capitalize">{tree.waterNeed}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Height</dt>
                  <dd>{tree.height}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Spread</dt>
                  <dd>{tree.spread}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white dark:bg-[#0f1b12] border border-slate-200 dark:border-[#28392b] rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold mb-3">Care playbook</h2>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200 list-disc list-inside">
                {tree.care.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-[#0f1b12] border border-slate-200 dark:border-[#28392b] rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold mb-3">Threats to watch</h2>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200 list-disc list-inside">
                {tree.threats.map((threat) => (
                  <li key={threat}>{threat}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-[#0f1b12] border border-slate-200 dark:border-[#28392b] rounded-2xl p-5 shadow-sm ">
                <h2 className="text-lg font-bold mb-3">Want to know more ?</h2>
                <Link 
                    href={tree.wikipediaArticle}
                    className="text-lg  flex gap-1 items-center">
                        <span className="material-symbols-outlined text-primary ">Link</span>
                        <h2 className="text-sm text-slate-700 dark:text-slate-200">Wikipedia Article about {tree.commonName}</h2>
                </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
