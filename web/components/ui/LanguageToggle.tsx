"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

/** 中 / EN switch. Warm-pastel pill, matches nav controls. */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, toggle } = useLocale();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}
      className={`inline-flex items-center gap-1 rounded-full border border-peach-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-plum-soft transition-colors hover:border-coral hover:text-coral ${className}`}
    >
      <span className={locale === "zh" ? "text-coral" : ""}>中</span>
      <span className="text-plum-faint">/</span>
      <span className={locale === "en" ? "text-coral" : ""}>EN</span>
    </button>
  );
}

export default LanguageToggle;
