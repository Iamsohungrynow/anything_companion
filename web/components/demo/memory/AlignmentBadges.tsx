"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { demoCopy } from "@/lib/i18n/demo";

export default function AlignmentBadges() {
  const { locale } = useLocale();
  const badges = demoCopy[locale].memory.alignmentBadges;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {badges.map((badge) => (
        <span
          key={badge}
          className="rounded-full border border-peach-200 bg-peach-100 px-3 py-1 text-xs font-bold text-coral-deep"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}
