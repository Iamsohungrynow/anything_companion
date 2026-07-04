"use client";

import { Microphone, PaperPlaneRight } from "@phosphor-icons/react";
import { Mascot } from "@/components/ui/Mascot";
import { TabBar } from "@/components/mockups/TabBar";

const CORAL_CTA = "linear-gradient(135deg,#e0714a,#eb9a70)";

/** Conversation: cozy header, a short reassuring thread, a soft input bar. */
export function ChatScreen() {
  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-peach-200 bg-white/80 px-5 pb-3 pt-10 backdrop-blur">
        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-peach-100">
          <Mascot size={40} float={false} />
        </span>
        <span>
          <span className="block font-display text-base leading-tight text-plum">
            依
          </span>
          <span className="block text-[11px] font-semibold text-coral">
            在陪你
          </span>
        </span>
      </div>

      {/* messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        <div className="max-w-[80%] self-end rounded-card bg-peach-100 px-4 py-2.5 text-sm text-plum">
          今天好累，什么都不想做。
        </div>
        <div className="max-w-[84%] self-start rounded-card border border-rose-soft bg-white px-4 py-2.5 text-sm text-plum">
          累了就先不做大的。我们只做一件小事，好不好？
        </div>
        <div className="max-w-[84%] self-start rounded-card border border-rose-soft bg-white px-4 py-2.5 text-sm text-plum">
          先把书翻开第一页，我陪你，两分钟就好。
        </div>
        <div className="self-start">
          <button
            type="button"
            className="rounded-full px-4 py-2 text-xs font-bold text-[#3a1f16]"
            style={{
              background: CORAL_CTA,
              boxShadow: "0 12px 26px -14px rgba(224,113,74,.7)",
            }}
          >
            开始两分钟
          </button>
        </div>
        <div className="max-w-[80%] self-end rounded-card bg-peach-100 px-4 py-2.5 text-sm text-plum">
          好吧，试试。
        </div>
      </div>

      {/* input bar */}
      <div className="border-t border-peach-200 bg-white/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-peach-100 px-4 py-2.5">
            <input
              type="text"
              placeholder="说点什么…"
              aria-label="输入消息"
              className="flex-1 bg-transparent text-sm text-plum outline-none placeholder:text-plum-faint"
            />
            <Microphone size={20} className="shrink-0 text-plum-soft" />
          </div>
          <button
            type="button"
            aria-label="发送"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
            style={{
              background: CORAL_CTA,
              boxShadow: "0 12px 26px -14px rgba(224,113,74,.75)",
            }}
          >
            <PaperPlaneRight size={20} weight="fill" />
          </button>
        </div>
      </div>

      <TabBar active="chat" />
    </div>
  );
}

export default ChatScreen;
