"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { Reveal } from "@/components/ui/Reveal";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { landingCopy } from "@/lib/i18n/landing";

const R = 95;
const CIRC = 2 * Math.PI * R; // ~596.9
const TOTAL = 10;
const TASK_COUNT = 3;

const pickTaskIndex = () => Math.floor(Math.random() * TASK_COUNT);

export function LoopDemo() {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const { locale } = useLocale();
  const t = landingCopy[locale];

  const [count, setCount] = useState(TOTAL);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [done, setDone] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);
  const [playToken, setPlayToken] = useState(0);

  useEffect(() => {
    if (reduce) {
      // Reduced motion: jump straight to the final resolved state.
      setTaskIndex(pickTaskIndex());
      setCount(0);
      setProgress(1);
      setActiveStep(3);
      setDone(true);
      return;
    }
    if (!inView) return;

    setDone(false);
    setActiveStep(0);
    setCount(TOTAL);
    setProgress(0);
    setTaskIndex(pickTaskIndex());

    const start = performance.now();
    const id = window.setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      const remaining = Math.max(0, TOTAL - elapsed);
      setCount(Math.ceil(remaining));
      setProgress(Math.min(1, elapsed / TOTAL));

      if (elapsed >= 1.4) setActiveStep(2);
      else if (elapsed >= 0.7) setActiveStep(1);
      else setActiveStep(0);

      if (elapsed >= TOTAL) {
        window.clearInterval(id);
        setCount(0);
        setProgress(1);
        setActiveStep(3);
        setDone(true);
      }
    }, 50);

    return () => window.clearInterval(id);
  }, [inView, reduce, playToken]);

  return (
    <section id="loop" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1120px] px-6 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-bold text-coral">{t.loop.note}</p>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.15] text-plum">
            {t.loop.title[0]}
            <br />
            {t.loop.title[1]}
          </h2>
          <p className="mt-4 text-lg text-plum-soft">{t.loop.lead}</p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {/* Card 1: the steps flow */}
          <div
            className="rounded-card border border-peach-200 p-6 sm:p-7"
            style={{ background: "linear-gradient(160deg,#ffffff,#f1e7d6)" }}
          >
            <div className="flex flex-col gap-2">
              {t.loop.steps.map((s, i) => {
                const active = i === activeStep;
                return (
                  <div
                    key={s.n}
                    className={`flex gap-4 rounded-soft border p-4 transition-colors duration-300 ${
                      active
                        ? "border-coral bg-peach-100"
                        : "border-transparent"
                    }`}
                  >
                    <span
                      className={`font-display text-sm font-bold tabular-nums ${
                        active ? "text-coral" : "text-plum-faint"
                      }`}
                    >
                      {s.n}
                    </span>
                    <div>
                      <p
                        className={`font-semibold ${
                          active ? "text-plum" : "text-plum-soft"
                        }`}
                      >
                        {s.title}
                      </p>
                      <p className="mt-0.5 text-sm text-plum-soft">{s.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: the countdown timer */}
          <div
            ref={cardRef}
            className="flex flex-col items-center rounded-card border border-peach-200 p-6 text-center sm:p-7"
            style={{ background: "linear-gradient(160deg,#ffffff,#f1e7d6)" }}
          >
            <div className="relative mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center">
              <svg
                viewBox="0 0 220 220"
                className="h-full w-full -rotate-90"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="loop-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f0c39a" />
                    <stop offset="1" stopColor="#e0714a" />
                  </linearGradient>
                </defs>
                <circle
                  cx="110"
                  cy="110"
                  r={R}
                  fill="none"
                  stroke="#f1e7d6"
                  strokeWidth="14"
                />
                <circle
                  cx="110"
                  cy="110"
                  r={R}
                  fill="none"
                  stroke="url(#loop-ring)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={progress * CIRC}
                  style={{ transition: "stroke-dashoffset 0.12s linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-6xl font-bold tabular-nums text-plum">
                  {count}
                </span>
                <span className="mt-1 text-xs text-plum-soft">
                  {t.loop.ringLabel}
                </span>
              </div>
            </div>

            <p className="mt-6 text-plum">
              <span className="text-plum-soft">{t.loop.taskCue}</span>
              <span className="font-semibold">{t.loop.tasks[taskIndex]}</span>
            </p>

            {done && (
              <motion.div
                className="mt-5 flex flex-wrap items-center justify-center gap-2"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span
                  className="rounded-full px-4 py-1.5 text-sm font-bold text-[#3a1f16]"
                  style={{ background: "linear-gradient(135deg,#e0714a,#eb9a70)" }}
                >
                  {t.loop.outcomes[0]}
                </span>
                <span className="rounded-full border border-peach-200 bg-white px-4 py-1.5 text-sm text-plum-soft">
                  {t.loop.outcomes[1]}
                </span>
                <span className="rounded-full border border-peach-200 bg-white px-4 py-1.5 text-sm text-plum-soft">
                  {t.loop.outcomes[2]}
                </span>
              </motion.div>
            )}

            <button
              type="button"
              onClick={() => setPlayToken((t) => t + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-peach-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-plum transition-colors hover:border-coral hover:text-coral"
            >
              <ArrowClockwise weight="bold" size={16} />
              {t.loop.replay}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoopDemo;
