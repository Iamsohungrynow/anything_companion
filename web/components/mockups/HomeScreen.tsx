import { Mascot } from "@/components/ui/Mascot";
import { TabBar } from "@/components/mockups/TabBar";

const CORAL_CTA = "linear-gradient(135deg,#e0714a,#eb9a70)";
const HALO = "radial-gradient(circle, rgba(224,113,74,.45), transparent 70%)";

/** Companion home: warm greeting, the mascot under a coral halo, a soft prompt. */
export function HomeScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col px-5 pt-10">
        {/* status row */}
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-semibold tabular-nums text-plum-soft">
            21:34
          </span>
          <span className="flex items-center gap-1.5 text-plum-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            依 在线
          </span>
        </div>

        {/* greeting */}
        <div className="mt-5">
          <h2 className="font-display text-[26px] leading-tight text-plum">
            你回来啦，阿栗
          </h2>
          <p className="mt-1 text-sm text-plum-soft">今天辛苦了，我在呢。</p>
        </div>

        {/* hero */}
        <div className="relative flex flex-1 flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div
              className="pointer-events-none absolute h-56 w-56 rounded-full"
              style={{ background: HALO }}
            />
            <Mascot size={150} />
          </div>
          <span className="mt-3 rounded-full bg-peach-100 px-4 py-1.5 text-xs font-semibold text-plum">
            状态 · 陪着你
          </span>
        </div>

        {/* prompt card */}
        <div
          className="mb-4 rounded-card bg-white p-4"
          style={{ boxShadow: "0 20px 50px -28px rgba(224,113,74,.5)" }}
        >
          <p className="text-sm font-semibold text-plum">现在想做点什么？</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-full bg-peach-100 px-4 py-2 text-xs font-semibold text-plum"
            >
              陪我坐一会
            </button>
            <button
              type="button"
              className="rounded-full px-4 py-2 text-xs font-bold text-[#3a1f16]"
              style={{
                background: CORAL_CTA,
                boxShadow: "0 12px 26px -14px rgba(224,113,74,.7)",
              }}
            >
              帮我开始
            </button>
          </div>
        </div>
      </div>

      <TabBar active="home" />
    </div>
  );
}

export default HomeScreen;
