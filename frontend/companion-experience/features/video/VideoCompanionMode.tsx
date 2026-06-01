// ============================================================
// VIDEO COMPANION MODE - Light 3D/Animation display
// ============================================================
// This is a simplified alternative to full Live2D
// Shows animated emoji, background effects, and state reactions
// Person C owns this component
// ============================================================

import React, { useEffect, useState } from 'react';
import { CompanionCard, ChatMessage, ChatResult, Scenario } from '../../shared/types';

interface Props {
  companion: CompanionCard;
  scenario?: Scenario;
  messages: ChatMessage[];
  lastResult: ChatResult | null;
  onChatMode?: () => void;
  onBackToChat?: () => void;
  onViewMemory?: () => void;
  onAddMessage?: (msg: ChatMessage) => void;
  onChatResult?: (result: ChatResult, userMessage: string) => void;
}

const stateEmojis: Record<string, string> = {
  'idle': '😊',
  'happy': '😄',
  'thinking': '🤔',
  'encouraging': '💪',
  'focused': '🎯',
  'resting': '😌',
  'concerned': '😟',
};

const stateBackgrounds: Record<string, string> = {
  'idle': 'from-blue-100 to-cyan-100',
  'happy': 'from-amber-100 to-orange-100',
  'thinking': 'from-purple-100 to-indigo-100',
  'encouraging': 'from-green-100 to-emerald-100',
  'focused': 'from-indigo-100 to-blue-100',
  'resting': 'from-violet-100 to-purple-100',
  'concerned': 'from-rose-100 to-pink-100',
};

export default function VideoCompanionMode({
  companion, messages, lastResult, onChatMode, onBackToChat, onViewMemory,
}: Props) {
  const [pulseScale, setPulseScale] = useState(1);
  const companionState = lastResult?.companion_state ?? 'idle';
  const bgClass = stateBackgrounds[companionState] ?? 'from-gray-100 to-gray-200';
  const handleBackToChat = onChatMode ?? onBackToChat;

  // Pulsing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale(prev => (prev === 1 ? 1.1 : 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${bgClass} p-6 transition-all duration-500`}>
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">{companion.name}</h1>
        <button onClick={handleBackToChat}
          className="px-4 py-2 rounded-2xl bg-white/70 border border-white/50 hover:bg-white text-gray-700 font-bold text-sm shadow-md transition-all">
          ← Back to Chat
        </button>
      </div>

      {/* Main companion display */}
      <div className="flex flex-col items-center gap-8">
        {/* Big emoji with state */}
        <div 
          className="text-9xl transition-transform duration-500 ease-in-out"
          style={{ transform: `scale(${pulseScale})` }}
        >
          {stateEmojis[companionState.toLowerCase()] ?? '😊'}
        </div>

        {/* Companion info */}
        <div className="text-center space-y-2">
          <p className="text-3xl font-black text-gray-800">{companion.name}</p>
          <p className="text-lg text-gray-700 italic">"{companion.personality.join(', ')}"</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/80 text-sm font-bold text-gray-700">
              {companionState}
            </span>
            {lastResult && (
              <span className="px-3 py-1 rounded-full bg-white/80 text-sm font-bold text-gray-700">
                {lastResult.mode}
              </span>
            )}
          </div>
        </div>

        {/* Latest message display */}
        {messages.length > 0 && (
          <div className="max-w-md bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50 text-center">
            <p className="text-gray-700 text-lg leading-relaxed font-medium">
              "{messages[messages.length - 1].content}"
            </p>
          </div>
        )}

        {/* Goal & task preview */}
        {lastResult?.goal_understanding && (
          <div className="max-w-md bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-200 text-center">
            <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">🎯 Goal</p>
            <p className="text-sm text-amber-900 font-medium">{lastResult.goal_understanding}</p>
          </div>
        )}

        {/* Micro-task preview */}
        {lastResult?.micro_task_plan && lastResult.micro_task_plan.length > 0 && (
          <div className="max-w-md bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-200">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">📋 Next Steps</p>
            <div className="space-y-2">
              {lastResult.micro_task_plan.slice(0, 3).map((task, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-white bg-gray-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    {i + 1}
                  </span>
                  <span className="text-gray-700 font-medium">{task.label}</span>
                  {task.duration_minutes > 0 && (
                    <span className="ml-auto text-xs text-gray-500">{task.duration_minutes} min</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Memory badge */}
      {lastResult?.memory_update && (
        <div className="absolute bottom-6 left-6 right-6 max-w-md mx-auto bg-gradient-to-r from-purple-100 to-violet-100 rounded-3xl p-4 border border-purple-200">
          <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-1">🧠 Memory</p>
          <p className="text-sm text-purple-800 font-medium italic">"{lastResult.memory_update}"</p>
          {onViewMemory && (
            <button
              onClick={onViewMemory}
              className="mt-3 w-full py-2 rounded-2xl bg-purple-500 text-white text-xs font-black shadow-sm hover:bg-purple-600 transition-colors"
            >
              View Memory
            </button>
          )}
        </div>
      )}
    </div>
  );
}
