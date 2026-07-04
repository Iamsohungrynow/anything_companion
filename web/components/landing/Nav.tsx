"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { landingCopy } from "@/lib/i18n/landing";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function Nav() {
  const { locale } = useLocale();
  const t = landingCopy[locale];

  return (
    <header className="sticky top-0 z-50 border-b border-peach-200 bg-cream/80 backdrop-blur-md">
      <nav className="mx-auto flex h-[68px] w-full max-w-[1120px] items-center justify-between px-6 sm:px-8">
        <a href="#top" className="relative inline-flex items-end" aria-label="yorimi">
          <span className="font-display text-2xl font-bold lowercase leading-none text-plum">
            yorimi
          </span>
          <svg
            viewBox="0 0 92 10"
            fill="none"
            aria-hidden="true"
            className="absolute -bottom-1.5 left-0 h-2 w-[4.6rem]"
          >
            <path
              d="M2 6C24 2 66 1 90 5"
              stroke="#e0714a"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {t.nav.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-plum-soft transition-colors hover:text-plum"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <a
            href="#reserve"
            className="rounded-full px-5 py-2.5 text-sm font-bold text-[#3a1f16] transition-transform hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg,#e0714a,#eb9a70)",
              boxShadow: "0 12px 26px -12px rgba(224,113,74,.5)",
            }}
          >
            {t.nav.cta}
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Nav;
