"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Mascot } from "@/components/ui/Mascot";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { landingCopy } from "@/lib/i18n/landing";

export function MiniTV() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const on = reduce ? true : inView;
  const { locale } = useLocale();
  const t = landingCopy[locale];

  return (
    <section id="hw" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1120px] px-6 text-center sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-coral">
          {t.miniTv.eyebrow}
        </p>
        <h2 className="mx-auto mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.15] text-plum">
          {t.miniTv.title}
        </h2>
        <p className="mx-auto mt-4 max-w-[40ch] text-lg text-plum-soft">
          {t.miniTv.lead}
        </p>

        <div className="mt-12">
          <div ref={ref} className="relative mx-auto w-full max-w-[420px]">
            {/* screen bezel */}
            <div
              className="relative rounded-blob border border-peach-200 p-5"
              style={{ background: "linear-gradient(160deg,#f1e7d6,#e6d7bf)" }}
            >
              <div
                className="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-card"
                style={{ background: "linear-gradient(160deg,#f6f1e6,#f1e7d6)" }}
              >
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  style={{
                    background:
                      "radial-gradient(circle at 50% 55%,rgba(224,113,74,.5),transparent 65%)",
                  }}
                  aria-hidden="true"
                />
                <motion.div
                  initial={false}
                  animate={{ opacity: on ? 1 : 0.12, scale: on ? 1 : 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 22,
                    delay: on ? 0.15 : 0,
                  }}
                >
                  <Mascot size={150} />
                </motion.div>
              </div>
            </div>

            {/* stand + base */}
            <div
              className="mx-auto h-6 w-16 rounded-b-xl"
              style={{ background: "linear-gradient(180deg,#e6d7bf,#f0c39a)" }}
              aria-hidden="true"
            />
            <div
              className="mx-auto -mt-1 h-3 w-36 rounded-full"
              style={{ background: "linear-gradient(180deg,#e6d7bf,#f0c39a)" }}
              aria-hidden="true"
            />
          </div>

          <p className="mt-8 font-mono text-xs text-plum-soft">
            {t.miniTv.caption}
          </p>
        </div>
      </div>
    </section>
  );
}

export default MiniTV;
