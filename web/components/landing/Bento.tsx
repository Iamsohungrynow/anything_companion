"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Mascot } from "@/components/ui/Mascot";
import { Reveal } from "@/components/ui/Reveal";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { landingCopy } from "@/lib/i18n/landing";

function Cell({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`relative overflow-hidden rounded-blob border border-peach-200 p-7 ${className}`}
      style={{ background: "linear-gradient(160deg,#ffffff,#f1e7d6)" }}
    >
      {children}
    </motion.div>
  );
}

export function Bento() {
  const { locale } = useLocale();
  const t = landingCopy[locale];

  return (
    <section id="love" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1120px] px-6 sm:px-8">
        <Reveal className="max-w-2xl">
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.15] text-plum">
            {t.bento.title}
          </h2>
          <p className="mt-4 text-lg text-plum-soft">{t.bento.lead}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-6">
          {/* characters and skins */}
          <Cell className="min-h-[240px] md:col-span-4">
            <div
              className="pointer-events-none absolute -right-6 -top-8 h-44 w-44 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle,rgba(224,113,74,.45),transparent 70%)",
              }}
              aria-hidden="true"
            />
            <div className="relative max-w-[64%]">
              <h3 className="font-display text-xl font-bold text-plum">
                {t.bento.cells[0].title}
              </h3>
              <p className="mt-3 text-plum-soft">{t.bento.cells[0].body}</p>
            </div>
            <div className="pointer-events-none absolute -bottom-1 right-3">
              <Mascot size={120} float />
            </div>
          </Cell>

          {/* voice */}
          <Cell className="md:col-span-2">
            <h3 className="font-display text-xl font-bold text-plum">
              {t.bento.cells[1].title}
            </h3>
            <p className="mt-3 text-plum-soft">{t.bento.cells[1].body}</p>
            <div className="mt-6 flex h-16 items-end gap-1.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={i}
                  className="yo-eq-bar w-1.5 rounded-full"
                  style={{
                    height: "40%",
                    animationDelay: `${i * 0.12}s`,
                    background: "linear-gradient(180deg,#e0714a,#f0c39a)",
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </Cell>

          {/* a memory that grows */}
          <Cell className="md:col-span-3">
            <h3 className="font-display text-xl font-bold text-plum">
              {t.bento.cells[2].title}
            </h3>
            <p className="mt-3 text-plum-soft">{t.bento.cells[2].body}</p>
            <div className="mt-5 space-y-2">
              {t.bento.memoryChips.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-2.5 rounded-soft border border-peach-200 bg-white/70 py-2 pl-3 pr-4"
                >
                  <span
                    className="h-4 w-1 rounded-full bg-coral"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-plum">{c}</span>
                </div>
              ))}
            </div>
          </Cell>

          {/* presence on your desk */}
          <Cell className="md:col-span-3">
            <div
              className="pointer-events-none absolute -bottom-10 -right-8 h-40 w-40 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle,rgba(224,113,74,.35),transparent 70%)",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <h3 className="font-display text-xl font-bold text-plum">
                {t.bento.cells[3].title}
              </h3>
              <p className="mt-3 text-plum-soft">{t.bento.cells[3].body}</p>
            </div>
          </Cell>
        </div>
      </div>
    </section>
  );
}

export default Bento;
