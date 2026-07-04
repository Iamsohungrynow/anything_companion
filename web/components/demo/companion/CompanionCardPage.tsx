"use client";

// ============================================================
// Companion Card Component
// ============================================================
import { CompanionCard as Companion } from "../shared/types";
import Pseudo3DPreview from "./Pseudo3DPreview";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { demoCopy } from "@/lib/i18n/demo";

interface Props {
  companion: Companion;
  onStartChat: () => void;
  onBack: () => void;
}

export default function CompanionCardPage({
  companion,
  onStartChat,
  onBack,
}: Props) {
  const { locale } = useLocale();
  const t = demoCopy[locale];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-6 animate-slide-up">
        {/* Header */}
        <div className="mb-2 text-center">
          <h1 className="font-display text-3xl font-bold text-plum">
            {t.companion.title}
          </h1>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-blob border border-peach-200 bg-white shadow-xl">
          {/* Avatar */}
          <div
            className="flex justify-center p-8"
            style={{ background: "linear-gradient(160deg,#ffffff,#f1e7d6)" }}
          >
            <Pseudo3DPreview companion={companion} size="lg" />
          </div>

          {/* Content */}
          <div className="space-y-6 p-8">
            {/* Name & Type */}
            <div className="space-y-2 text-center">
              <h2 className="font-display text-4xl font-bold text-plum">
                {companion.name}
              </h2>
              <p className="text-lg text-plum-soft">{companion.type}</p>
            </div>

            {/* Personality */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-plum-faint">
                {t.companion.personality}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {companion.personality.map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full border border-peach-200 bg-peach-100 px-3 py-1 text-sm font-bold text-coral-deep"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Backstory */}
            <div className="space-y-2 rounded-card bg-peach-100 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-coral-deep">
                {t.companion.backstory}
              </p>
              <p className="leading-relaxed text-plum">{companion.backstory}</p>
            </div>

            {/* Tone & Use Case */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-card bg-peach-100 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-coral-deep">
                  {t.companion.tone}
                </p>
                <p className="mt-2 text-sm font-bold text-plum">
                  {t.tones[companion.tone]}
                </p>
              </div>
              <div
                className="rounded-card p-4 text-center"
                style={{ background: "linear-gradient(160deg,#ffffff,#f6d8cf)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-rose">
                  {t.companion.useCase}
                </p>
                <p className="mt-2 text-sm font-bold text-plum">
                  {t.useCases[companion.use_case]}
                </p>
              </div>
            </div>

            {/* Interaction Style */}
            <div
              className="space-y-2 rounded-card p-4"
              style={{ background: "linear-gradient(160deg,#ffffff,#f6d8cf)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-rose">
                {t.companion.interaction}
              </p>
              <p className="text-plum">{companion.interaction_style}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onStartChat}
            className="flex-1 rounded-card py-4 text-lg font-bold text-[#3a1f16] shadow-lg transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg,#e0714a,#eb9a70)",
              boxShadow: "0 18px 40px -18px rgba(224,113,74,.45)",
            }}
          >
            💬 {t.companion.startChat}
          </button>
          <button
            onClick={onBack}
            className="flex-1 rounded-card border-2 border-peach-200 bg-white py-4 font-bold text-plum transition-all hover:border-coral hover:bg-peach-50"
          >
            ← {t.companion.back}
          </button>
        </div>
      </div>
    </div>
  );
}
