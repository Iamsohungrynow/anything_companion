// ============================================================
// PAGE 4: CHAT INTERFACE
// ============================================================
// Voice input:  src/hooks/useVoiceInput.ts
// Voice output: src/utils/voiceOutput.ts  (session-locked voice)
// AI replies:   src/utils/generateChatResult.ts
// ============================================================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CompanionCard, ChatMessage, ChatResult, Scenario } from '../types';
import { generateChatResultAsync } from '../utils/generateChatResult';
import {
  speakText, stopSpeaking, isSpeechSynthesisSupported, getLockedVoiceName,
} from '../utils/voiceOutput';
import { useVoiceInput } from '../hooks/useVoiceInput';
import Pseudo3DPreview from './Pseudo3DPreview';

interface Props {
  companion:    CompanionCard;
  scenario:     Scenario;
  messages:     ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
  onChatResult: (result: ChatResult, userMessage: string) => void;
  lastResult:   ChatResult | null;
  onViewMemory: () => void;
  onVideoMode?: () => void;
}

const accentMap: Record<Scenario, { btn: string; bubble: string; input: string }> = {
  study: { btn:'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600',  bubble:'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200',  input:'focus:ring-amber-300'  },
  acg:   { btn:'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700', bubble:'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200', input:'focus:ring-violet-300' },
  pet:   { btn:'bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600',         bubble:'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200',     input:'focus:ring-rose-300'   },
};

const modeColors: Record<string, { bg: string; text: string; dot: string }> = {
  'Encourage Mode':         { bg:'bg-amber-50 border-amber-200',   text:'text-amber-700',  dot:'bg-amber-400'  },
  'Focus Mode':             { bg:'bg-blue-50 border-blue-200',     text:'text-blue-700',   dot:'bg-blue-400'   },
  'Companion Mode':         { bg:'bg-violet-50 border-violet-200', text:'text-violet-700', dot:'bg-violet-400' },
  'Companion Presence Mode':{ bg:'bg-violet-50 border-violet-200', text:'text-violet-700', dot:'bg-violet-400' },
  'Routine Mode':           { bg:'bg-rose-50 border-rose-200',     text:'text-rose-700',   dot:'bg-rose-400'   },
  'Study Sprint Mode':      { bg:'bg-indigo-50 border-indigo-200', text:'text-indigo-700', dot:'bg-indigo-400' },
  'Check-in Mode':          { bg:'bg-teal-50 border-teal-200',     text:'text-teal-700',   dot:'bg-teal-400'   },
};
const defaultModeStyle = { bg:'bg-gray-50 border-gray-200', text:'text-gray-600', dot:'bg-gray-400' };

const scenarioDefault: Record<Scenario, { detected_state: string; mode: string }> = {
  study: { detected_state:'Awaiting input…',    mode:'Check-in Mode'          },
  acg:   { detected_state:'Listening quietly…', mode:'Companion Presence Mode' },
  pet:   { detected_state:'Watching over you…', mode:'Routine Check-in Mode'  },
};

// ── Right-side structured task panel ───────────────────────────────────────
function TaskSupportPanel({
  result, scenario, isTyping,
}: { result: ChatResult | null; scenario: Scenario; isTyping: boolean }) {
  const [checked,      setChecked]      = useState<Record<number, boolean>>({});
  const [sprintActive, setSprintActive] = useState(false);
  const [checkInDone,  setCheckInDone]  = useState<string | null>(null);
  const toggle = (i: number) => setChecked(p => ({ ...p, [i]: !p[i] }));

  const def = scenarioDefault[scenario];
  const data: ChatResult = result ?? {
    reply: '',
    detected_state: 'neutral',
    companion_state: 'idle',
    mode: def.mode as ChatResult['mode'],
    goal_understanding: '',
    micro_task_plan: [],
    start_button_label: 'Start Session',
    check_in_message: '',
    check_in_options: ['Done', 'Partly done', 'I got stuck'],
    memory_update: '',
    memory: {},
    trace: [],
    fallback_used: false,
  };
  const ms = modeColors[data.mode] ?? defaultModeStyle;
  const tasks = data.micro_task_plan ?? [];
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-3">

      {/* 1 – Adaptive Mode Panel */}
      <div className={`rounded-2xl border ${ms.bg} p-4 shadow-sm`}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
          <span>⚡</span> Adaptive Mode Panel
        </p>
        <div className="space-y-2.5">
          <Row label="Detected State">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isTyping?'animate-pulse':''} ${ms.dot}`}/>
            <span className="text-sm font-semibold text-gray-700">{isTyping?'Analyzing…':data.detected_state}</span>
          </Row>
          <Row label="Active Mode">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ms.bg} ${ms.text}`}>
              {isTyping?'…':data.mode}
            </span>
          </Row>
          {tasks.length > 0 && !isTyping && (
            <Row label="Next Action">
              <span className="text-sm text-gray-600 font-medium leading-snug">{tasks[0].label}</span>
            </Row>
          )}
        </div>
      </div>

      {/* 1b – Goal Understanding */}
      {data.goal_understanding && !isTyping && (
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 shadow-sm">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <span>🎯</span> Goal Understanding
          </p>
          <p className="text-sm text-amber-800 font-medium leading-relaxed">{data.goal_understanding}</p>
        </div>
      )}

      {/* 2 – Micro-Task Support */}
      {tasks.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
            <span>📋</span> Micro-Task Plan
            {doneCount > 0 && (
              <span className="ml-auto bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                {doneCount}/{tasks.length}
              </span>
            )}
          </p>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <button key={i} onClick={() => toggle(i)}
                className={`w-full flex items-center gap-3 text-left p-2.5 rounded-xl transition-all
                  ${checked[i]?'bg-green-50 border border-green-100':'bg-gray-50 hover:bg-gray-100 border border-transparent'}`}>
                <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${checked[i]?'bg-green-400 border-green-400':'border-gray-300 bg-white'}`}>
                  {checked[i] && <span className="text-white text-xs font-black">✓</span>}
                </span>
                <div className="flex-1">
                  <span className={`text-sm font-medium leading-snug ${checked[i]?'text-green-600 line-through':'text-gray-700'}`}>
                    {task.label}
                  </span>
                  {task.duration_minutes > 0 && (
                    <span className="text-xs text-gray-400 ml-2">{task.duration_minutes} min</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Sprint button */}
          {!sprintActive ? (
            <button
              onClick={() => setSprintActive(true)}
              className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-sm shadow transition-all hover:shadow-md"
            >
              ▶ {data.start_button_label || 'Start Session'}
            </button>
          ) : (
            <div className="mt-3 w-full py-2.5 rounded-xl bg-green-50 border border-green-200 text-center">
              <span className="text-green-700 font-bold text-sm">✓ Sprint started — you've got this!</span>
            </div>
          )}
        </div>
      )}

      {/* 3 – Check-in with action buttons */}
      {data.check_in_message && (
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 shadow-sm">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <span>💌</span> Check-in
          </p>
          <p className="text-sm text-blue-700 font-medium leading-relaxed mb-3">{data.check_in_message}</p>
          {checkInDone ? (
            <p className="text-xs text-blue-500 font-semibold text-center py-1">Noted: <span className="italic">"{checkInDone}"</span></p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {(data.check_in_options ?? ['Done', 'Partly done', 'I got stuck']).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCheckInDone(opt)}
                  className="flex-1 min-w-[70px] py-2 rounded-xl text-xs font-bold border border-blue-200 bg-white/70 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4 – Memory Updated */}
      {data.memory_update && result && (
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 p-4 shadow-sm">
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <span>🧠</span> Memory Updated
          </p>
          <p className="text-sm text-purple-700 font-medium leading-relaxed italic">"{data.memory_update}"</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-gray-400 font-semibold w-24 flex-shrink-0 pt-0.5 uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-1.5 flex-wrap">{children}</div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ChatInterface({
  companion, scenario, messages, onAddMessage, onChatResult,
  lastResult, onViewMemory, onVideoMode,
}: Props) {
  const [inputText,  setInputText]  = useState('');
  const [isTyping,   setIsTyping]   = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showDbg,    setShowDbg]    = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const colors = accentMap[scenario];
  const ttsSupported = isSpeechSynthesisSupported();

  const handleTranscript = useCallback((text: string) => setInputText(text), []);
  const { isListening, interimTranscript, startListening, stopListening,
          error: voiceError, isSupported: voiceSupported } = useVoiceInput(handleTranscript);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length === 0) {
      const welcome: Record<Scenario,string> = {
        study: `Hi! I'm ${companion.name} ☕ What are we working on today?`,
        acg:   `Hello. I'm ${companion.name} ✨ I'm here with you. What's on your mind?`,
        pet:   `Hey! ${companion.name} here 🐾 Ready for your check-in? How are you feeling?`,
      };
      onAddMessage({ id:'c-welcome', role:'companion', content:welcome[scenario], timestamp:new Date() });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMessage = text.trim();
    onAddMessage({ id:`u-${Date.now()}`, role:'user', content:userMessage, timestamp:new Date() });
    setInputText(''); setIsTyping(true);
    const result = await generateChatResultAsync(scenario, userMessage);
    setIsTyping(false);
    onAddMessage({ id:`c-${Date.now()}`, role:'companion', content:result.reply, timestamp:new Date() });
    // Pass userMessage directly so App.tsx memory is always accurate
    onChatResult(result, userMessage);
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (speakingId === msgId) { stopSpeaking(); setSpeakingId(null); }
    else { speakText(text, scenario, () => setSpeakingId(null)); setSpeakingId(msgId); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Chat column ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/50">
          <div className="flex-shrink-0"><Pseudo3DPreview companion={companion} size="sm" /></div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-gray-800 truncate">{companion.name}</h2>
            <p className="text-xs text-gray-500 truncate">{companion.type}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-xs text-green-600 font-semibold">Online</span>
              {lastResult && <><span className="text-gray-300 mx-1">·</span><span className="text-xs text-gray-500">{lastResult.mode}</span></>}
            </div>
          </div>

          {/* Video Mode button */}
          {onVideoMode && (
            <button onClick={onVideoMode}
              className={`flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm
                ${scenario==='acg'
                  ?'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-md'
                  :'text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
              title="Switch to Video Companion Mode">
              🎬 Video Mode
            </button>
          )}

          <button onClick={onViewMemory}
            className="flex-shrink-0 text-xs font-bold text-gray-400 hover:text-gray-600 border border-gray-200 rounded-xl px-3 py-2 transition-colors hover:bg-gray-50">
            Memory →
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[320px] max-h-[440px] pr-1">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role==='user'?'justify-end':'justify-start'} animate-fade-in`}>
              {msg.role==='companion' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1 text-sm select-none">
                  {companion.emoji}
                </div>
              )}
              <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role==='user'?'items-end':'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role==='user'?'bg-gray-800 text-white rounded-tr-sm':`${colors.bubble} border text-gray-800 rounded-tl-sm`}`}>
                  {msg.content}
                </div>
                {msg.role==='companion' && ttsSupported && (
                  <button onClick={() => handleSpeak(msg.id, msg.content)}
                    className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors
                      ${speakingId===msg.id?'bg-gray-200 text-gray-600 font-bold':'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                    {speakingId===msg.id?'⏹ Stop':'🔊 Play'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1 text-sm">{companion.emoji}</div>
              <div className={`px-4 py-3 rounded-2xl ${colors.bubble} border shadow-sm`}>
                <div className="flex gap-1 items-center h-4">
                  {[0,1,2].map(i=><div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay:`${i*150}ms`}}/>)}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        {voiceError && (
          <div className="mb-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-xs text-red-600 flex items-center gap-2">
            <span>⚠️</span>{voiceError}
          </div>
        )}
        {interimTranscript && (
          <div className="mb-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs text-blue-600 italic flex items-center gap-2">
            <span className="animate-pulse">🎤</span>{interimTranscript}…
          </div>
        )}

        {/* Input area */}
        <div className="flex gap-2 items-end">
          {voiceSupported ? (
            <button onClick={isListening?stopListening:startListening}
              className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm
                ${isListening?'bg-red-500 hover:bg-red-600 text-white animate-pulse':'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              title={isListening?'Stop recording':'Voice input'}>
              {isListening?'⏹':'🎤'}
            </button>
          ) : (
            <button disabled className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200">
              🎤
            </button>
          )}

          <textarea value={inputText} onChange={e=>setInputText(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage(inputText);}}}
            placeholder={`Message ${companion.name}…`} rows={2}
            className={`flex-1 resize-none bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${colors.input} transition-all`}/>

          <button onClick={()=>sendMessage(inputText)} disabled={!inputText.trim()||isTyping}
            className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md transition-all
              ${inputText.trim()&&!isTyping?`${colors.btn} hover:shadow-lg`:'bg-gray-200 cursor-not-allowed'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        {showDbg && (
          <p className="mt-2 text-[10px] text-gray-400 text-center">Voice locked: {getLockedVoiceName()}</p>
        )}
        <button onClick={()=>setShowDbg(d=>!d)} className="mt-1 text-[10px] text-gray-300 hover:text-gray-500 text-center w-full transition-colors">
          {showDbg?'Hide debug':'🔍 Debug'}
        </button>
      </div>

      {/* ── Right sidebar ───────────────────────────────────────────────── */}
      <div className="lg:w-80 xl:w-96 px-4 pb-6 lg:pt-6 flex-shrink-0 space-y-3">
        <TaskSupportPanel result={lastResult} scenario={scenario} isTyping={isTyping}/>
        {lastResult && (
          <button onClick={onViewMemory}
            className={`w-full py-3 rounded-2xl text-white font-bold text-sm shadow-lg transition-all ${colors.btn}`}>
            View Memory & Summary →
          </button>
        )}
      </div>
    </div>
  );
}
