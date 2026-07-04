import { TabBar } from "@/components/mockups/TabBar";

const CORAL_CTA = "linear-gradient(135deg,#e0714a,#eb9a70)";

const RING_RADIUS = 86;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_PROGRESS = 0.62;
const RING_OFFSET = RING_CIRCUMFERENCE * (1 - RING_PROGRESS);

/** Countdown micro-action: one tiny task, a gentle ring, a lot of reassurance. */
export function CountdownScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col px-5 pt-10">
        <span className="text-xs font-bold tracking-wide text-coral">
          小行动
        </span>

        {/* task card */}
        <div
          className="mt-3 rounded-card bg-white p-4"
          style={{ boxShadow: "0 20px 50px -28px rgba(224,113,74,.5)" }}
        >
          <p className="text-sm font-semibold text-plum">先翻开第一页</p>
        </div>

        {/* progress ring */}
        <div className="relative mt-7 flex items-center justify-center">
          <svg
            width={210}
            height={210}
            viewBox="0 0 200 200"
            role="img"
            aria-label="进度 62%"
          >
            <defs>
              <linearGradient id="yo-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f0c39a" />
                <stop offset="1" stopColor="#e0714a" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r={RING_RADIUS}
              fill="none"
              stroke="#f1e7d6"
              strokeWidth="14"
            />
            <circle
              cx="100"
              cy="100"
              r={RING_RADIUS}
              fill="none"
              stroke="url(#yo-ring)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_OFFSET}
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[44px] leading-none tabular-nums text-plum">
              01:32
            </span>
            <span className="mt-2 text-xs text-plum-soft">一起，慢慢来</span>
          </div>
        </div>

        <p className="mt-7 text-center text-sm text-plum-soft">
          你已经坐下来了，这就很好。
        </p>

        {/* actions */}
        <div className="mt-auto mb-4">
          <button
            type="button"
            className="w-full rounded-full py-3.5 text-sm font-bold text-[#3a1f16]"
            style={{
              background: CORAL_CTA,
              boxShadow: "0 16px 32px -14px rgba(224,113,74,.75)",
            }}
          >
            完成了
          </button>
          <button
            type="button"
            className="mt-3 w-full text-center text-xs font-medium text-plum-soft"
          >
            还需要一点时间。
          </button>
        </div>
      </div>

      <TabBar active="countdown" />
    </div>
  );
}

export default CountdownScreen;
