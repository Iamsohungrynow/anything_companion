"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { demoCopy } from "@/lib/i18n/demo";

export default function SameEngineTable() {
  const { locale } = useLocale();
  const t = demoCopy[locale].memory;

  return (
    <div className="rounded-card border border-peach-200 bg-white/70 p-5 shadow-sm">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-plum-faint">
        {t.sameEngineTitle}
      </p>
      <div className="overflow-hidden rounded-soft border border-peach-200">
        {t.sameEngineRows.map(([scenario, behavior], index) => (
          <div
            key={scenario}
            className={`grid grid-cols-[90px_1fr] gap-3 px-4 py-3 text-sm ${
              index % 2 === 0 ? "bg-peach-50" : "bg-white"
            }`}
          >
            <span className="font-bold text-plum">{scenario}</span>
            <span className="text-plum-soft">{behavior}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
