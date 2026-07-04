"use client";

import { ChatCircle, House, Timer, User } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

type TabKey = "home" | "countdown" | "chat" | "me";

type TabBarProps = {
  active: TabKey;
};

const TABS: { key: TabKey; label: string; Glyph: Icon }[] = [
  { key: "home", label: "陪伴", Glyph: House },
  { key: "countdown", label: "倒计时", Glyph: Timer },
  { key: "chat", label: "聊天", Glyph: ChatCircle },
  { key: "me", label: "我的", Glyph: User },
];

/** Bottom navigation pinned inside a phone screen. Coral marks the active tab. */
export function TabBar({ active }: TabBarProps) {
  return (
    <nav className="mt-auto flex items-stretch justify-around border-t border-peach-200 bg-white/85 px-2 pb-5 pt-2.5 backdrop-blur">
      {TABS.map(({ key, label, Glyph }) => {
        const isActive = key === active;
        return (
          <span
            key={key}
            className={`flex flex-1 flex-col items-center gap-1 ${
              isActive ? "text-coral" : "text-plum-faint"
            }`}
          >
            <Glyph size={23} weight={isActive ? "fill" : "regular"} />
            <span className="text-[11px] font-semibold leading-none">
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

export default TabBar;
