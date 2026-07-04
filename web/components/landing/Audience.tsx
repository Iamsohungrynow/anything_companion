"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { landingCopy } from "@/lib/i18n/landing";

export function Audience() {
  const { locale } = useLocale();
  const t = landingCopy[locale];

  return (
    <section id="who" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1120px] px-6 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.15] text-plum">
            {t.audience.title}
          </h2>
        </Reveal>

        <div className="mt-10 divide-y divide-peach-200 border-y border-peach-200">
          {t.audience.rows.map((r) => (
            <div
              key={r.badge}
              className="group flex items-start gap-5 rounded-soft px-2 py-6 transition-all duration-200 hover:bg-peach-100/60 hover:pl-5"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-coral/15 font-display font-bold text-coral-deep"
              >
                {r.badge}
              </span>
              <div>
                <h3 className="text-lg font-bold text-plum">{r.title}</h3>
                <p className="mt-1 text-plum-soft">{r.line}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Audience;
