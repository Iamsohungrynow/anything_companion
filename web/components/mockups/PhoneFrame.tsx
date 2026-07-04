import type { ReactNode } from "react";

type PhoneFrameProps = {
  children: ReactNode;
  className?: string;
};

/** Soft in-page vertical wash behind every screen. */
const SCREEN_BG = "linear-gradient(180deg,#f6f1e6,#f1e7d6)";

/**
 * Cute rounded phone shell. Presentational only: a white body with a soft peach
 * bezel, a big tinted drop shadow, a centered top notch pill, and a portrait
 * screen that its children fill (flex column).
 */
export function PhoneFrame({ children, className = "" }: PhoneFrameProps) {
  return (
    <div
      className={`inline-block rounded-[46px] bg-white p-2.5 ${className}`}
      style={{ boxShadow: "0 34px 70px -28px rgba(224,113,74,.55)" }}
    >
      <div className="rounded-[40px] bg-peach-100 p-1.5">
        <div
          className="relative flex h-[620px] w-[300px] max-w-full flex-col overflow-hidden rounded-[38px]"
          style={{ background: SCREEN_BG }}
        >
          {/* notch / speaker pill */}
          <div className="pointer-events-none absolute left-1/2 top-2.5 z-20 h-1.5 w-24 -translate-x-1/2 rounded-full bg-plum-faint/40" />
          {children}
        </div>
      </div>
    </div>
  );
}

export default PhoneFrame;
