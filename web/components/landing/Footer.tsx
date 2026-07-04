"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { landingCopy } from "@/lib/i18n/landing";

export function Footer() {
  const { locale } = useLocale();
  const t = landingCopy[locale];

  return (
    <footer className="border-t border-peach-200 py-10">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-start gap-6 px-6 sm:px-8 md:flex-row md:items-center md:justify-between">
        <a href="#top" className="shrink-0" aria-label="yorimi">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/yorimi-logo.png"
            alt="yorimi. Be there. Every day."
            width={112}
            height={112}
            className="h-28 w-28 object-contain"
          />
        </a>

        <p className="max-w-[56ch] text-sm text-plum-soft">
          {t.footer.disclosure}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
