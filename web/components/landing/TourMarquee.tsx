"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { landingCopy } from "@/lib/i18n/landing";

function Track({ words }: { words: string[] }) {
  return (
    <div className="flex shrink-0 items-center gap-6 pr-6" aria-hidden="true">
      {words.map((w, i) => (
        <span key={i} className="flex items-center gap-6">
          <span className="font-display text-2xl font-bold text-plum sm:text-3xl">
            {w}
          </span>
          <span className="h-2 w-2 rotate-45 rounded-[2px] bg-coral" />
        </span>
      ))}
    </div>
  );
}

export function TourMarquee() {
  const { locale } = useLocale();
  const t = landingCopy[locale];

  return (
    <section className="overflow-hidden border-y border-peach-200 bg-peach-100 py-8">
      <div className="yo-marquee flex w-max min-w-max">
        <Track words={t.tour.words} />
        <Track words={t.tour.words} />
      </div>
    </section>
  );
}

export default TourMarquee;
