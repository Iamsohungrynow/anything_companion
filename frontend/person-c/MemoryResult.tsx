// ============================================================
// PAGE 5: MEMORY / RESULT PAGE
// ============================================================
import React from 'react';
import { CompanionCard, ChatResult, Memory, Scenario } from '../types';
import AlignmentBadges from './AlignmentBadges';
import SameEngineTable from './SameEngineTable';

interface Props {
  companion: CompanionCard;
  scenario: Scenario;
  lastResult: ChatResult;
  memory: Memory;
  onHome: () => void;
  onTryAnother: () => void;
}

const accentMap: Record<Scenario, { gradient: string; card: string }> = {
  study: { gradient: 'from-amber-400 to-orange-500', card: 'from-amber-50 to-orange-50 border-amber-200' },
  acg: { gradient: 'from-violet-400 to-purple-500', card: 'from-violet-50 to-purple-50 border-violet-200' },
  pet: { gradient: 'from-rose-400 to-pink-500', card: 'from-rose-50 to-pink-50 border-rose-200' },
};

export default function MemoryResult({ companion, scenario, lastResult, memory, onHome, onTryAnother }: Props) {
  const accent = accentMap[scenario] || accentMap.study;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Session complete</p>
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            {companion.name} remembers you.
          </h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            Not just what you did — but how you work best.<br />
            This is how your companion gets better at supporting you.
          </p>
        </div>

        {/* Companion Summary Card */}
        <div className={`bg-gradient-to-br ${accent.card} border rounded-3xl p-6 shadow-lg`}>
          <div className="flex items-center gap-4 mb-5">
            <span className="text-4xl">{companion.emoji}</span>
            <div>
              <h3 className="text-xl font-black text-gray-800">{companion.name}</h3>
              <p className="text-sm text-gray-500">{companion.type}</p>
            </div>
            <span className={`ml-auto inline-block text-xs font-bold px-3 py-1.5 rounded-full text-white bg-gradient-to-r ${accent.gradient}`}>
              {lastResult.mode}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MemoryField icon="🔍" label="How you were feeling" value={lastResult.detected_state.replace(/_/g, ' ')} />
            <MemoryField icon="⚡" label="Mode that helped" value={lastResult.mode} />
            <MemoryField icon="⏱️" label="What worked for you" value={memory.preferred_task_length} />
            <MemoryField icon="💬" label="What you were working on" value={memory.last_goal} />
          </div>
        </div>

        {/* What your companion learned */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-3xl p-6 shadow-sm">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span>🧠</span> What {companion.name} learned about you
          </p>
          <p className="text-base text-purple-800 font-semibold leading-relaxed mb-4">
            "{lastResult.memory_update}"
          </p>
          <div className="space-y-2">
            {[
              `You start better with ${memory.preferred_task_length.toLowerCase()} — ${companion.name} will remember this.`,
              `${lastResult.mode} helped you today. Next time, ${companion.name} can go there faster.`,
              `Your companion is building a picture of how to support you specifically.`,
            ].map((line, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-purple-700">
                <span className="flex-shrink-0 mt-0.5 text-purple-400">·</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The steps you took */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-3xl p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <span>🎯</span> The steps you took this session
          </p>
          <div className="space-y-2 mb-5">
            {(lastResult.micro_task_plan?.length
              ? lastResult.micro_task_plan.map((t) => t.label)
              : lastResult.micro_task ?? []
            ).map((task, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs font-black flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 font-medium">{task}</span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1">
              <span>💌</span> From {companion.name}
            </p>
            <p className="text-sm text-amber-800 font-medium italic">"{lastResult.check_in_message}"</p>
          </div>
        </div>

        {/* AI-Native Journey */}
        <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-3xl p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
            🧭 What happened this session
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {[
              { label: 'Companion\npresence', done: true },
              { label: 'State\ndetected', done: true },
              { label: 'Mode\nswitch', done: true },
              { label: 'Sprint\nstarted', done: true },
              { label: 'Memory\nlearned', done: true },
            ].map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-green-400 text-white text-lg flex items-center justify-center shadow-sm">
                    ✓
                  </div>
                  <span className="text-xs text-gray-500 font-medium text-center whitespace-pre-line leading-tight">
                    {step.label}
                  </span>
                </div>
                {i < 4 && <span className="text-gray-200 font-bold text-xl mx-1 mb-4">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* AI-Assisted Build Workflow */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-3xl p-5 shadow-sm">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <span>🤖</span> AI-assisted Build Workflow
          </p>
          <p className="text-xs text-teal-700 mb-3">Built as a rapid MVP using AI-assisted development:</p>
          <div className="flex flex-wrap gap-2">
            {['UI generation', 'Prompt iteration', 'API testing', 'Integration debugging', 'Fallback design'].map((item) => (
              <span key={item} className="bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Same Engine Table */}
        <SameEngineTable />

        {/* Alignment Badges */}
        <div className="py-2">
          <AlignmentBadges />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onHome}
            className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all hover:shadow-xl"
          >
            ← Back to Home
          </button>
          <button
            onClick={onTryAnother}
            className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg bg-gradient-to-r ${accent.gradient} hover:shadow-xl transition-all hover:-translate-y-0.5`}
          >
            Try Another Scenario →
          </button>
        </div>
      </div>
    </div>
  );
}

function MemoryField({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white/60 rounded-2xl p-4 border border-white/50">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
        <span>{icon}</span>
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-700">{value}</p>
    </div>
  );
}
