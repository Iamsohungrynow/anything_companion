"use client";

// ============================================================
// PAGE 5: MEMORY / RESULT PAGE
// ============================================================
import { Fragment } from "react";
import {
  ChatResult,
  CompanionCard,
  Memory,
  Scenario,
} from "../shared/types";
import AlignmentBadges from "./AlignmentBadges";
import SameEngineTable from "./SameEngineTable";
import Pseudo3DPreview from "../companion/Pseudo3DPreview";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { demoCopy } from "@/lib/i18n/demo";

interface Props {
  companion: CompanionCard;
  scenario: Scenario;
  lastResult: ChatResult;
  memory: Memory;
  onHome: () => void;
  onTryAnother: () => void;
}

export default function MemoryResult({
  companion,
  lastResult,
  memory,
  onHome,
  onTryAnother,
}: Props) {
  const { locale } = useLocale();
  const t = demoCopy[locale];
  const name = companion.name;
  const modeLabel = t.modes[lastResult.mode] ?? lastResult.mode;

  const fill = (template: string) =>
    template
      .replace(/\{name\}/g, name)
      .replace(/\{length\}/g, memory.preferred_task_length)
      .replace(/\{mode\}/g, modeLabel);

  const steps = lastResult.micro_task_plan?.length
    ? lastResult.micro_task_plan.map((task) => task.label)
    : lastResult.micro_task ?? [];

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6 animate-slide-up">
        {/* Header */}
        <div className="mb-2 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-plum-faint">
            {t.memory.sessionComplete}
          </p>
          <h2 className="mb-2 font-display text-3xl font-bold text-plum">
            {fill(t.memory.titleTemplate)}
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-plum-soft">
            {t.memory.subtitleTop}
            <br />
            {t.memory.subtitleBottom}
          </p>
        </div>

        {/* Companion summary */}
        <div
          className="rounded-blob border border-peach-200 p-6 shadow-lg"
          style={{ background: "linear-gradient(160deg,#ffffff,#f1e7d6)" }}
        >
          <div className="mb-5 flex items-center gap-4">
            <Pseudo3DPreview companion={companion} size="md" />
            <div>
              <h3 className="font-display text-xl font-bold text-plum">{name}</h3>
              <p className="text-sm text-plum-soft">{companion.type}</p>
            </div>
            <span
              className="ml-auto inline-block rounded-full px-3 py-1.5 text-xs font-bold text-[#3a1f16]"
              style={{ background: "linear-gradient(135deg,#e0714a,#eb9a70)" }}
            >
              {modeLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MemoryField
              icon="🔍"
              label={t.memory.feelingLabel}
              value={lastResult.detected_state.replace(/_/g, " ")}
            />
            <MemoryField icon="⚡" label={t.memory.modeHelpedLabel} value={modeLabel} />
            <MemoryField
              icon="⏱️"
              label={t.memory.workedLabel}
              value={memory.preferred_task_length}
            />
            <MemoryField
              icon="💬"
              label={t.memory.workingOnLabel}
              value={memory.last_goal}
            />
          </div>
        </div>

        {/* What your companion learned */}
        <div className="rounded-blob border border-rose-soft bg-rose-soft/50 p-6 shadow-sm">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-coral-deep">
            <span>🧠</span> {fill(t.memory.learnedTitleTemplate)}
          </p>
          <p className="mb-4 text-base font-semibold leading-relaxed text-plum">
            &quot;{lastResult.memory_update}&quot;
          </p>
          <div className="space-y-2">
            {[
              fill(t.memory.learnedLine1Template),
              fill(t.memory.learnedLine2Template),
              t.memory.learnedLine3,
            ].map((line) => (
              <div
                key={line}
                className="flex items-start gap-2 text-sm text-plum-soft"
              >
                <span className="mt-0.5 flex-shrink-0 text-coral">·</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The steps you took */}
        <div className="rounded-blob border border-peach-200 bg-white/70 p-6 shadow-sm">
          <p className="mb-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-plum-faint">
            <span>🎯</span> {t.memory.stepsTitle}
          </p>
          <div className="mb-5 space-y-2">
            {steps.map((task, i) => (
              <div
                key={task}
                className="flex items-center gap-3 rounded-soft bg-peach-50 px-4 py-2.5"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-peach-200 text-xs font-bold text-coral-deep">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-plum">{task}</span>
              </div>
            ))}
          </div>

          <div className="rounded-soft border border-peach-200 bg-peach-100 p-4">
            <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-coral-deep">
              <span>💌</span> {fill(t.memory.fromCompanionTemplate)}
            </p>
            <p className="text-sm font-medium italic text-plum">
              &quot;{lastResult.check_in_message}&quot;
            </p>
          </div>
        </div>

        {/* Journey */}
        <div className="rounded-blob border border-peach-200 bg-white/60 p-6 shadow-sm">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-plum-faint">
            🧭 {t.memory.journeyTitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {t.memory.journeySteps.map((label, i, arr) => (
              <Fragment key={label}>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-lg text-white shadow-sm">
                    ✓
                  </div>
                  <span className="text-center text-xs font-medium leading-tight text-plum-soft">
                    {label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <span className="mx-1 mb-4 text-xl font-bold text-coral-soft">
                    →
                  </span>
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* AI-assisted build workflow */}
        <div className="rounded-blob border border-peach-200 bg-peach-100 p-5 shadow-sm">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-coral-deep">
            <span>🤖</span> {t.memory.buildTitle}
          </p>
          <p className="mb-3 text-xs text-plum-soft">{t.memory.buildSubtitle}</p>
          <div className="flex flex-wrap gap-2">
            {t.memory.buildTags.map((item) => (
              <span
                key={item}
                className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-coral-deep"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Same engine table */}
        <SameEngineTable />

        {/* Alignment badges */}
        <div className="py-2">
          <AlignmentBadges />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            onClick={onHome}
            className="flex-1 rounded-card border-2 border-peach-200 bg-white py-4 font-bold text-plum shadow-sm transition-all hover:border-coral hover:bg-peach-50"
          >
            ← {t.memory.backHome}
          </button>
          <button
            onClick={onTryAnother}
            className="flex-1 rounded-card py-4 font-bold text-[#3a1f16] shadow-lg transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg,#e0714a,#eb9a70)",
              boxShadow: "0 18px 40px -18px rgba(224,113,74,.45)",
            }}
          >
            {t.memory.tryAnother} →
          </button>
        </div>
      </div>
    </div>
  );
}

function MemoryField({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-card border border-peach-200 bg-white/60 p-4">
      <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-plum-faint">
        <span>{icon}</span>
        {label}
      </p>
      <p className="text-sm font-semibold text-plum">{value}</p>
    </div>
  );
}
