"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { demoCopy } from "@/lib/i18n/demo";

export default function DemoHeader() {
  const { locale } = useLocale();
  const t = demoCopy[locale];

  return (
    <header className="sticky top-0 z-50 border-b border-peach-200 bg-cream/80 backdrop-blur-md">
      <nav className="mx-auto flex h-[60px] w-full max-w-[1120px] items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-plum-soft transition-colors hover:text-coral"
        >
          <ArrowLeft size={18} weight="bold" />
          {t.header.home}
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-bold text-plum">Yorimi</span>
          <LanguageToggle />
        </div>
      </nav>
    </header>
  );
}
