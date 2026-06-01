import React from 'react';

const badges = [
  'Answer-first rendering',
  'Mode-aware support',
  'Memory update visible',
  'Voice fallback preserved',
];

export default function AlignmentBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {badges.map((badge) => (
        <span
          key={badge}
          className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}
