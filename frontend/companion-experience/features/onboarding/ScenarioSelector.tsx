// ============================================================
// PAGE 1: HOME / PRODUCT FRAMING
// ============================================================
// Person A owns this file. Only Person A changes the primary
// demo path or root step names.
// ============================================================
import React, { useState } from 'react';
import { Scenario } from '../../shared/types';

interface Props {
  onSelect: (scenario: Scenario) => void;
}

const PROOF_CHIPS = [
  { icon: '🔍', label: 'Detects your state' },
  { icon: '📋', label: 'Plans micro-tasks' },
  { icon: '🧠', label: 'Remembers what helps' },
];

const OTHER_SCENARIOS: Array<{ id: Scenario; label: string; emoji: string }> = [
  { id: 'acg',  label: 'ACG Companion', emoji: '✨' },
  { id: 'pet',  label: 'Pet Companion',  emoji: '🐾' },
];

export default function ScenarioSelector({ onSelect }: Props) {
  const [toast, setToast] = useState(false);

  const handleOtherScenario = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-14">

      {/* ── Brand badge ── */}
      <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-fade-in">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs font-semibold tracking-widest text-purple-600 uppercase">
          Companion-to-Action AI
        </span>
      </div>

      {/* ── Headline ── */}
      <div className="text-center mb-4 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-800 leading-tight mb-4">
          A companion that stays with you<br />
          <span className="bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500 bg-clip-text text-transparent">
            when starting feels hard.
          </span>
        </h1>
        <p className="text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
          It understands your state, gives gentle support,<br />
          and helps you take one small next step.
        </p>
      </div>

      {/* ── Proof chips ── */}
      <div className="flex items-center gap-3 flex-wrap justify-center mb-10 animate-fade-in">
        {PROOF_CHIPS.map((c) => (
          <span
            key={c.label}
            className="flex items-center gap-1.5 bg-white/70 border border-white/60 rounded-full px-4 py-1.5 text-sm text-gray-600 shadow-sm font-medium"
          >
            <span>{c.icon}</span>
            {c.label}
          </span>
        ))}
      </div>

      {/* ── Study hero card ── */}
      <div className="w-full max-w-md animate-slide-up mb-6">
        <div
          className="group relative bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-200 hover:border-amber-400 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          onClick={() => onSelect('study')}
        >
          {/* "Featured" ribbon */}
          <div className="absolute -top-3 left-6">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
              ★ Main Demo
            </span>
          </div>

          {/* Icon + title */}
          <div className="flex items-center gap-4 mb-5 mt-2">
            <div className="text-5xl">☕</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Study Companion</h2>
              <p className="text-sm text-gray-500 mt-0.5">For when you can't start</p>
            </div>
          </div>

          {/* One-line thesis */}
          <p className="text-base text-gray-600 leading-relaxed mb-6">
            Not a task planner. Not just an AI friend.<br />
            <span className="font-semibold text-gray-800">
              A companion that gives you presence — then helps you start.
            </span>
          </p>

          {/* Three-layer feature list */}
          <div className="space-y-2 mb-7">
            {[
              { icon: '🫶', text: 'Companion soul — your own tone, personality, and presence' },
              { icon: '⚡', text: 'Detects when you\'re stuck, tired, overwhelmed, or struggling to begin' },
              { icon: '📝', text: 'Creates 2–4 micro-tasks and starts a timed sprint' },
              { icon: '🧠', text: 'Remembers how you start best — gets better each time' },
            ].map((f) => (
              <div key={f.text} className="flex items-start gap-2.5 text-sm text-gray-600">
                <span className="flex-shrink-0">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={(e) => { e.stopPropagation(); onSelect('study'); }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            Create my companion →
          </button>
        </div>
      </div>

      {/* ── Other scenarios (chips) ── */}
      <div className="flex flex-col items-center gap-2 animate-fade-in">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
          Same engine, other companions
        </p>
        <div className="flex gap-3">
          {OTHER_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={handleOtherScenario}
              className="flex items-center gap-2 bg-white/60 border border-gray-200 hover:border-gray-300 rounded-full px-5 py-2 text-sm text-gray-500 hover:text-gray-700 shadow-sm transition-all duration-200 hover:shadow-md font-medium"
            >
              <span>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Coming Soon toast ── */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-800 text-white text-sm font-medium px-6 py-3 rounded-2xl shadow-xl max-w-sm text-center leading-relaxed">
            Coming soon — this companion skin will be powered by the same Companion-to-Action engine.
          </div>
        </div>
      )}

      {/* ── AI journey footer ── */}
      <div className="w-full max-w-lg mt-10 animate-fade-in">
        <div className="flex items-center justify-center gap-1 flex-wrap text-xs text-gray-400">
          {['Companion presence', 'State detected', 'Mode switch', 'Micro-task + sprint', 'Memory update'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span className="bg-white/60 border border-gray-100 rounded-lg px-3 py-1.5 font-medium">
                {step}
              </span>
              {i < arr.length - 1 && <span className="text-gray-300 font-bold">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
