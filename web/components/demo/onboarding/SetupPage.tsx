"use client";

// ============================================================
// PAGE 1.5: TONE + USE CASE + ROLE SETUP
// ============================================================
import { useState } from "react";
import {
  CompanionRole,
  Scenario,
  SetupProfile,
  Tone,
  UseCase,
} from "../shared/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { demoCopy } from "@/lib/i18n/demo";

interface Props {
  scenario: Scenario;
  onComplete: (profile: SetupProfile) => void;
  onBack: () => void;
}

const TONE_OPTIONS: Array<{ id: Tone; emoji: string }> = [
  { id: "soft_supportive", emoji: "🌸" },
  { id: "short_direct", emoji: "⚡" },
  { id: "cute_playful", emoji: "🌟" },
  { id: "coach_like", emoji: "🏆" },
  { id: "friend_like", emoji: "👋" },
];

const USE_CASE_OPTIONS: Array<{ id: UseCase; emoji: string }> = [
  { id: "study", emoji: "📚" },
  { id: "work", emoji: "💼" },
];

const ROLE_OPTIONS: Array<{ id: CompanionRole; emoji: string }> = [
  { id: "study_companion", emoji: "📚" },
  { id: "emotional_support", emoji: "🫶" },
  { id: "memory_keeper", emoji: "🧠" },
  { id: "daily_reminder", emoji: "📅" },
];

export default function SetupPage({ scenario, onComplete, onBack }: Props) {
  const { locale } = useLocale();
  const t = demoCopy[locale];

  const [tone, setTone] = useState<Tone | null>(null);
  const [useCase, setUseCase] = useState<UseCase | null>(
    scenario === "study" ? "study" : scenario === "pet" ? "pet_companionship" : null,
  );
  const [role, setRole] = useState<CompanionRole | null>(
    scenario === "study"
      ? "study_companion"
      : scenario === "pet"
        ? "daily_reminder"
        : null,
  );

  const canNext = tone !== null && useCase !== null && role !== null;

  const handleNext = () => {
    if (!tone || !useCase || !role) return;
    onComplete({ tone, use_case: useCase, role });
  };

  const optionClass = (selected: boolean) =>
    `flex w-full items-center gap-4 rounded-card border-2 bg-white/70 px-5 py-3.5 text-left transition-all duration-150 ${
      selected
        ? "border-coral bg-peach-100 shadow-md"
        : "border-peach-200 hover:border-coral-soft hover:shadow-sm"
    }`;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Back */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-1 text-sm text-plum-faint transition-colors hover:text-plum"
        >
          ← {t.setup.back}
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-plum-faint">
            {t.setup.step}
          </p>
          <h2 className="mb-1 text-2xl font-bold text-plum">{t.setup.title}</h2>
          <p className="text-sm text-plum-soft">{t.setup.subtitle}</p>
        </div>

        {/* Tone */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold text-plum">
            {t.setup.toneQuestion}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {TONE_OPTIONS.map((o) => {
              const selected = tone === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setTone(o.id)}
                  className={optionClass(selected)}
                >
                  <span className="flex-shrink-0 text-xl">{o.emoji}</span>
                  <span className="flex-1 text-sm font-semibold text-plum">
                    {t.tones[o.id]}
                  </span>
                  {selected && (
                    <span className="flex-shrink-0 text-sm font-bold text-coral">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Use case */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold text-plum">
            {t.setup.useCaseQuestion}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {USE_CASE_OPTIONS.map((o) => {
              const selected = useCase === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setUseCase(o.id)}
                  className={optionClass(selected)}
                >
                  <span className="flex-shrink-0 text-xl">{o.emoji}</span>
                  <span className="flex-1 text-sm font-semibold text-plum">
                    {t.useCases[o.id]}
                  </span>
                  {selected && (
                    <span className="flex-shrink-0 text-sm font-bold text-coral">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Role */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold text-plum">
            {t.setup.roleQuestion}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {ROLE_OPTIONS.map((o) => {
              const selected = role === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setRole(o.id)}
                  className={optionClass(selected)}
                >
                  <span className="flex-shrink-0 text-xl">{o.emoji}</span>
                  <span className="flex-1 text-sm font-semibold text-plum">
                    {t.roles[o.id]}
                  </span>
                  {selected && (
                    <span className="flex-shrink-0 text-sm font-bold text-coral">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleNext}
          disabled={!canNext}
          className={`w-full rounded-full py-4 text-base font-bold shadow-lg transition-all duration-200 ${
            canNext
              ? "text-[#3a1f16] hover:-translate-y-0.5"
              : "cursor-not-allowed bg-peach-200 text-plum-faint"
          }`}
          style={
            canNext
              ? {
                  background: "linear-gradient(135deg,#e0714a,#eb9a70)",
                  boxShadow: "0 18px 40px -18px rgba(224,113,74,.45)",
                }
              : undefined
          }
        >
          {canNext ? `${t.setup.ctaReady} →` : t.setup.ctaWait}
        </button>
      </div>
    </div>
  );
}
