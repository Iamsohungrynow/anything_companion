// ============================================================
// PAGE 1.5: TONE + USE CASE SETUP
// ============================================================
// Person A owns this file.
// Inserted between ScenarioSelector (Page 1) and ImageUpload (Page 2).
// Captures tone, role, and use_case, then passes them upstream via onComplete.
// ============================================================
import React, { useState } from 'react';
import { Scenario, Tone, UseCase, CompanionRole, SetupProfile } from '../../shared/types';

interface Props {
  scenario: Scenario;
  onComplete: (profile: SetupProfile) => void;
  onBack: () => void;
}

// ── Tone options ──────────────────────────────────────────────────────────────

const TONES: Array<{ id: Tone; label: string; sublabel: string; emoji: string }> = [
  { id: 'soft_supportive', label: 'Soft & supportive', sublabel: '温柔支持型', emoji: '🌸' },
  { id: 'short_direct',    label: 'Short & direct',    sublabel: '简短直接型', emoji: '⚡' },
  { id: 'cute_playful',    label: 'Cute & playful',    sublabel: '可爱活泼型', emoji: '🌟' },
  { id: 'coach_like',      label: 'Coach-like',        sublabel: '教练型',     emoji: '🏆' },
  { id: 'friend_like',     label: 'Friend-like',       sublabel: '朋友型',     emoji: '👋' },
];

// ── Use case options ──────────────────────────────────────────────────────────

const USE_CASES: Array<{ id: UseCase; label: string; sublabel: string; emoji: string }> = [
  { id: 'study', label: 'Help me study', sublabel: '帮我学习', emoji: '📚' },
  { id: 'work',  label: 'Help me work',  sublabel: '帮我工作', emoji: '💼' },
];

// ── Companion role options ────────────────────────────────────────────────────

const ROLES: Array<{ id: CompanionRole; label: string; sublabel: string; emoji: string }> = [
  { id: 'study_companion',  label: 'Study companion',        sublabel: '学习陪伴者', emoji: '📚' },
  { id: 'emotional_support',label: 'Emotional support buddy', sublabel: '情绪支持伙伴', emoji: '🫶' },
  { id: 'memory_keeper',    label: 'Memory keeper',           sublabel: '记忆陪伴者', emoji: '🧠' },
  { id: 'daily_reminder',   label: 'Daily reminder buddy',    sublabel: '日常提醒伙伴', emoji: '📅' },
];

// ── Scenario accent colours ───────────────────────────────────────────────────

const ACCENT: Record<Scenario, { selected: string; btn: string; ring: string }> = {
  study: {
    selected: 'border-amber-400 bg-amber-50 shadow-amber-100',
    btn:      'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600',
    ring:     'ring-amber-300',
  },
  acg: {
    selected: 'border-violet-400 bg-violet-50 shadow-violet-100',
    btn:      'bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600',
    ring:     'ring-violet-300',
  },
  pet: {
    selected: 'border-rose-400 bg-rose-50 shadow-rose-100',
    btn:      'bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600',
    ring:     'ring-rose-300',
  },
};

export default function SetupPage({ scenario, onComplete, onBack }: Props) {
  const [tone, setTone]       = useState<Tone | null>(null);
  const [useCase, setUseCase] = useState<UseCase | null>(
    scenario === 'study' ? 'study' : scenario === 'pet' ? 'pet_companionship' : null
  );
  const [role, setRole]       = useState<CompanionRole | null>(
    scenario === 'study' ? 'study_companion' : scenario === 'pet' ? 'daily_reminder' : null
  );

  const accent  = ACCENT[scenario];
  const canNext = tone !== null && useCase !== null && role !== null;

  const handleNext = () => {
    if (!tone || !useCase || !role) return;
    onComplete({ tone, use_case: useCase, role });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-slide-up">

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-8 transition-colors"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Step 1 of 2</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Shape your companion</h2>
          <p className="text-sm text-gray-500">Choose its tone, role, and how it should support you.</p>
        </div>

        {/* ── Tone section ── */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            How should your companion sound?
          </p>
          <div className="grid grid-cols-1 gap-2">
            {TONES.map((t) => {
              const isSelected = tone === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`flex items-center gap-4 w-full text-left px-5 py-3.5 rounded-2xl border-2 transition-all duration-150 bg-white/70
                    ${isSelected
                      ? `${accent.selected} shadow-md`
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    }
                  `}
                >
                  <span className="text-xl flex-shrink-0">{t.emoji}</span>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-800">{t.label}</span>
                    <span className="text-xs text-gray-400 ml-2">{t.sublabel}</span>
                  </div>
                  {isSelected && (
                    <span className="text-green-500 font-bold text-sm flex-shrink-0">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Use case section ── */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Main use case — what should it help you with?
          </p>
          <div className="grid grid-cols-1 gap-2">
            {USE_CASES.map((u) => {
              const isSelected = useCase === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setUseCase(u.id)}
                  className={`flex items-center gap-4 w-full text-left px-5 py-3.5 rounded-2xl border-2 transition-all duration-150 bg-white/70
                    ${isSelected
                      ? `${accent.selected} shadow-md`
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    }
                  `}
                >
                  <span className="text-xl flex-shrink-0">{u.emoji}</span>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-800">{u.label}</span>
                    <span className="text-xs text-gray-400 ml-2">{u.sublabel}</span>
                  </div>
                  {isSelected && (
                    <span className="text-green-500 font-bold text-sm flex-shrink-0">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Role section ── */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            What role should your companion play?
          </p>
          <div className="grid grid-cols-1 gap-2">
            {ROLES.map((r) => {
              const isSelected = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex items-center gap-4 w-full text-left px-5 py-3.5 rounded-2xl border-2 transition-all duration-150 bg-white/70
                    ${isSelected
                      ? `${accent.selected} shadow-md`
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                    }
                  `}
                >
                  <span className="text-xl flex-shrink-0">{r.emoji}</span>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-gray-800">{r.label}</span>
                    <span className="text-xs text-gray-400 ml-2">{r.sublabel}</span>
                  </div>
                  {isSelected && (
                    <span className="text-green-500 font-bold text-sm flex-shrink-0">✓</span>
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
          className={`w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg transition-all duration-200
            ${canNext
              ? `${accent.btn} hover:shadow-xl hover:-translate-y-0.5`
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {canNext ? 'Next: Upload your image →' : 'Complete your companion setup to continue'}
        </button>
      </div>
    </div>
  );
}
