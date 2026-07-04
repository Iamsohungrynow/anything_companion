"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { landingCopy } from "@/lib/i18n/landing";

export function Reserve() {
  const [sent, setSent] = useState(false);
  const reduce = useReducedMotion();
  const { locale } = useLocale();
  const t = landingCopy[locale];

  return (
    <section id="reserve" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1120px] px-6 text-center sm:px-8">
        <h2 className="mx-auto text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.12] text-plum">
          {t.reserve.title}
        </h2>
        <p className="mx-auto mt-4 max-w-[38ch] text-lg text-plum-soft">
          {t.reserve.lead}
        </p>

        <div className="mx-auto mt-8 w-full max-w-[460px]">
          {sent ? (
            <motion.p
              className="rounded-full border border-peach-200 bg-white px-6 py-4 font-semibold text-plum"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {t.reserve.success}
            </motion.p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="reserve-contact" className="sr-only">
                {t.reserve.srLabel}
              </label>
              <input
                id="reserve-contact"
                name="contact"
                type="text"
                required
                placeholder={t.reserve.placeholder}
                className="w-full rounded-full border border-peach-200 bg-white px-6 py-3.5 text-plum placeholder:text-plum-faint focus:border-coral focus:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              />
              <motion.button
                type="submit"
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className="shrink-0 rounded-full px-7 py-3.5 text-sm font-bold text-[#3a1f16]"
                style={{
                  background: "linear-gradient(135deg,#e0714a,#eb9a70)",
                  boxShadow: "0 18px 40px -16px rgba(224,113,74,.45)",
                }}
              >
                {t.reserve.submit}
              </motion.button>
            </form>
          )}

          <p className="mt-4 text-sm text-plum-soft">{t.reserve.note}</p>
        </div>
      </div>
    </section>
  );
}

export default Reserve;
