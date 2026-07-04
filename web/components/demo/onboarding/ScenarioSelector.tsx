"use client";

// ============================================================
// PAGE 1: HOME / PRODUCT FRAMING
// ============================================================
import { Fragment, useState } from "react";
import { Scenario } from "../shared/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { demoCopy } from "@/lib/i18n/demo";

interface Props {
  onSelect: (scenario: Scenario) => void;
}

const PROOF_ICONS = ["🔍", "📋", "🧠"];
const FEATURE_ICONS = ["🫶", "⚡", "📝", "🧠"];

export default function ScenarioSelector({ onSelect }: Props) {
  const { locale } = useLocale();
  const t = demoCopy[locale].scenario;
  const [toast, setToast] = useState(false);

  const handleOtherScenario = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const otherScenarios: Array<{ id: Scenario; label: string; emoji: string }> = [
    { id: "acg", label: t.acg, emoji: "✨" },
    { id: "pet", label: t.pet, emoji: "🐾" },
  ];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-10">
      {/* Brand badge */}
      <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-peach-200 bg-white/70 px-4 py-1.5 shadow-sm">
        <span className="yo-pulse h-2 w-2 rounded-full bg-coral" />
        <span className="text-xs font-semibold uppercase tracking-widest text-coral-deep">
          {t.badge}
        </span>
      </div>

      {/* Headline */}
      <div className="mb-4 animate-fade-in text-center">
        <h1 className="mb-4 text-4xl font-bold leading-tight text-plum">
          {t.headlineTop}
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg,#c9572f,#e0714a,#eea79c)",
            }}
          >
            {t.headlineAccent}
          </span>
        </h1>
        <p className="mx-auto max-w-sm text-base leading-relaxed text-plum-soft">
          {t.subtitleTop}
          <br />
          {t.subtitleBottom}
        </p>
      </div>

      {/* Proof chips */}
      <div className="mb-10 flex animate-fade-in flex-wrap items-center justify-center gap-3">
        {t.proofChips.map((label, i) => (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-peach-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-plum-soft shadow-sm"
          >
            <span>{PROOF_ICONS[i]}</span>
            {label}
          </span>
        ))}
      </div>

      {/* Study hero card */}
      <div className="mb-6 w-full max-w-md animate-slide-up">
        <div
          className="group relative cursor-pointer rounded-blob border-2 border-peach-200 p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-coral"
          style={{ background: "linear-gradient(160deg,#ffffff,#f1e7d6)" }}
          onClick={() => onSelect("study")}
        >
          {/* Featured ribbon */}
          <div className="absolute -top-3 left-6">
            <span
              className="rounded-full px-4 py-1 text-xs font-bold text-[#3a1f16] shadow-md"
              style={{ background: "linear-gradient(135deg,#e0714a,#eb9a70)" }}
            >
              {t.ribbon}
            </span>
          </div>

          {/* Icon + title */}
          <div className="mb-5 mt-2 flex items-center gap-4">
            <div className="text-5xl">☕</div>
            <div>
              <h2 className="text-2xl font-bold text-plum">{t.studyTitle}</h2>
              <p className="mt-0.5 text-sm text-plum-soft">{t.studySubtitle}</p>
            </div>
          </div>

          {/* Thesis */}
          <p className="mb-6 text-base leading-relaxed text-plum-soft">
            {t.thesisTop}
            <br />
            <span className="font-semibold text-plum">{t.thesisBottom}</span>
          </p>

          {/* Feature list */}
          <div className="mb-7 space-y-2">
            {t.features.map((text, i) => (
              <div
                key={text}
                className="flex items-start gap-2.5 text-sm text-plum-soft"
              >
                <span className="flex-shrink-0">{FEATURE_ICONS[i]}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect("study");
            }}
            className="w-full rounded-full py-4 text-base font-bold text-[#3a1f16] shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg,#e0714a,#eb9a70)",
              boxShadow: "0 18px 40px -18px rgba(224,113,74,.45)",
            }}
          >
            {t.cta} →
          </button>
        </div>
      </div>

      {/* Other scenarios */}
      <div className="flex animate-fade-in flex-col items-center gap-2">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-plum-faint">
          {t.otherLabel}
        </p>
        <div className="flex gap-3">
          {otherScenarios.map((s) => (
            <button
              key={s.id}
              onClick={handleOtherScenario}
              className="flex items-center gap-2 rounded-full border border-peach-200 bg-white/60 px-5 py-2 text-sm font-medium text-plum-soft shadow-sm transition-all duration-200 hover:border-coral hover:text-coral"
            >
              <span>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coming Soon toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 animate-fade-in">
          <div className="max-w-sm rounded-card bg-plum px-6 py-3 text-center text-sm font-medium leading-relaxed text-white shadow-xl">
            {t.toast}
          </div>
        </div>
      )}

      {/* Journey footer */}
      <div className="mt-10 w-full max-w-lg animate-fade-in">
        <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-plum-faint">
          {t.journey.map((step, i, arr) => (
            <Fragment key={step}>
              <span className="rounded-soft border border-peach-200 bg-white/60 px-3 py-1.5 font-medium">
                {step}
              </span>
              {i < arr.length - 1 && (
                <span className="font-bold text-coral-soft">→</span>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
