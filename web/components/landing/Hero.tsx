"use client";

import { motion, useReducedMotion } from "motion/react";
import { Heart, Sparkle } from "@phosphor-icons/react";
import { Mascot } from "@/components/ui/Mascot";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { landingCopy } from "@/lib/i18n/landing";

const spring = { type: "spring", stiffness: 220, damping: 22 } as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};
const child = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: spring },
};

export function Hero() {
  const reduce = useReducedMotion();
  const { locale } = useLocale();
  const t = landingCopy[locale];

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1120px] items-center px-6 pt-24 pb-16 sm:px-8">
        <div className="grid w-full items-center gap-10 md:grid-cols-2 md:gap-12">
          {/* Text column: below the mascot on mobile, left on desktop */}
          <motion.div
            className="order-2 flex flex-col md:order-1"
            variants={container}
            initial={reduce ? "show" : "hidden"}
            animate="show"
          >
            <motion.p
              variants={child}
              className="font-mono text-xs uppercase tracking-[0.22em] text-coral"
            >
              {t.hero.eyebrow}
            </motion.p>

            <motion.h1
              variants={child}
              className="mt-5 text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.1] text-plum"
            >
              {t.hero.title[0]}
              <br />
              {t.hero.title[1]}
            </motion.h1>

            <motion.p
              variants={child}
              className="mt-5 max-w-[30ch] text-lg text-plum-soft"
            >
              {t.hero.lead}
            </motion.p>

            <motion.div
              variants={child}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <motion.a
                href="#reserve"
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                transition={spring}
                className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-bold text-[#3a1f16]"
                style={{
                  background: "linear-gradient(135deg,#e0714a,#eb9a70)",
                  boxShadow: "0 18px 40px -16px rgba(224,113,74,.45)",
                }}
              >
                {t.hero.ctaPrimary}
              </motion.a>
              <motion.a
                href="/demo"
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                transition={spring}
                className="inline-flex items-center justify-center rounded-full border border-peach-200 bg-white/70 px-7 py-3.5 text-sm font-semibold text-plum transition-colors hover:border-coral hover:text-coral"
              >
                {t.hero.ctaSecondary}
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Mascot moment: above the text on mobile, right on desktop */}
          <div className="order-1 flex items-center justify-center md:order-2">
            <div className="relative flex items-center justify-center">
              <div
                className="pointer-events-none absolute h-[340px] w-[340px] rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle,rgba(224,113,74,.5),transparent 70%)",
                }}
                aria-hidden="true"
              />
              <Sparkle
                weight="fill"
                size={22}
                className="yo-drift absolute left-1 top-8 text-coral"
                style={{ animationDelay: "0s" }}
                aria-hidden="true"
              />
              <Heart
                weight="fill"
                size={20}
                className="yo-drift absolute right-3 top-24 text-rose"
                style={{ animationDelay: "1.3s" }}
                aria-hidden="true"
              />
              <Sparkle
                weight="fill"
                size={15}
                className="yo-drift absolute bottom-14 right-10 text-coral-soft"
                style={{ animationDelay: "2.2s" }}
                aria-hidden="true"
              />
              <Mascot size={300} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
