// ============================================================
// Companion Card Component
// ============================================================
import React from 'react';
import { CompanionCard as Companion } from '../../shared/types';
import Pseudo3DPreview from './Pseudo3DPreview';

interface Props {
  companion: Companion;
  onStartChat: () => void;
  onBack: () => void;
}

export default function CompanionCardPage({ companion, onStartChat, onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-800">Meet Your Companion</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          {/* Avatar */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex justify-center">
            <Pseudo3DPreview companion={companion} size="lg" />
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Name & Type */}
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-gray-800">{companion.name}</h2>
              <p className="text-lg text-gray-600">{companion.type}</p>
            </div>

            {/* Personality */}
            <div className="space-y-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Personality</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {companion.personality.map((trait, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-sm font-bold text-blue-700">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Backstory */}
            <div className="space-y-2 bg-amber-50 p-4 rounded-2xl">
              <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Backstory</p>
              <p className="text-gray-700 leading-relaxed">{companion.backstory}</p>
            </div>

            {/* Tone & Use Case */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-violet-50 p-4 rounded-2xl text-center">
                <p className="text-xs font-black text-violet-600 uppercase tracking-widest">Tone</p>
                <p className="text-sm font-bold text-violet-800 mt-2">{companion.tone}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl text-center">
                <p className="text-xs font-black text-green-600 uppercase tracking-widest">Use Case</p>
                <p className="text-sm font-bold text-green-800 mt-2">{companion.use_case}</p>
              </div>
            </div>

            {/* Interaction Style */}
            <div className="space-y-2 bg-rose-50 p-4 rounded-2xl">
              <p className="text-xs font-black text-rose-600 uppercase tracking-widest">How They Interact</p>
              <p className="text-gray-700">{companion.interaction_style}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onStartChat}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            💬 Start Chat
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded-2xl border-2 border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-all"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
