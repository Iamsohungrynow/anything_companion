"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { PhoneFrame } from "@/components/mockups/PhoneFrame";
import { HomeScreen } from "@/components/mockups/HomeScreen";
import { CountdownScreen } from "@/components/mockups/CountdownScreen";
import { ChatScreen } from "@/components/mockups/ChatScreen";

const SCREENS: { screen: ReactNode; caption: string }[] = [
  { screen: <HomeScreen />, caption: "陪伴主页" },
  { screen: <CountdownScreen />, caption: "倒计时 micro-action" },
  { screen: <ChatScreen />, caption: "对话" },
];

export default function MockupsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cream">
      {/* soft coral glow near the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-140px] h-[440px] w-[640px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(224,113,74,.45), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1120px] px-6 py-16 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-plum-soft transition-colors hover:text-plum"
        >
          <ArrowLeft size={18} />
          回到首页
        </Link>

        <header className="mt-8">
          <h1 className="font-display text-4xl text-plum sm:text-5xl">
            Yorimi App 界面预览
          </h1>
          <p className="mt-4 max-w-[50ch] text-plum-soft">
            陪伴主页、倒计时 micro-action、对话，一套统一的暖色系统，也是桌面小电视继承的视觉语言。
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 items-start justify-items-center gap-8 md:grid-cols-3">
          {SCREENS.map((item, i) => (
            <Reveal key={item.caption} delay={i * 0.1}>
              <div className="flex flex-col items-center gap-4">
                <PhoneFrame>{item.screen}</PhoneFrame>
                <p className="text-center text-sm text-plum-soft">
                  {item.caption}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
