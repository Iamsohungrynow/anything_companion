import type { CSSProperties } from "react";

type MascotProps = {
  /** Rendered pixel size (square-ish; viewBox is 240x264). */
  size?: number;
  /** Toggle the ambient bob loop. Blink + sparkle always run (cheap). */
  float?: boolean;
  /** Soft mood tweak: happy (smile) or resting (calm). */
  mood?: "happy" | "resting";
  className?: string;
  style?: CSSProperties;
};

/**
 * Yorimi — the companion. A chubby, rounded marshmallow spirit with a warm
 * peach-to-rose body, big glossy eyes, rosy cheeks and a little orbiting spark.
 * Deliberate hand-authored mascot (the brand's face), not an icon glyph.
 * Placeholder character direction — not the flagship IP.
 */
export function Mascot({
  size = 260,
  float = true,
  mood = "happy",
  className = "",
  style,
}: MascotProps) {
  return (
    <svg
      width={size}
      height={(size * 264) / 240}
      viewBox="0 0 240 264"
      role="img"
      aria-label="Yorimi 陪伴精灵"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="yo-body" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#f6e2c8" />
          <stop offset="0.5" stopColor="#eaa576" />
          <stop offset="1" stopColor="#e58f76" />
        </linearGradient>
        <radialGradient id="yo-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#e0846f" stopOpacity="0.7" />
          <stop offset="1" stopColor="#e0846f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="yo-gloss" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* grounding shadow — sits outside the bob group so it stays put */}
      <ellipse
        className="yo-shadow"
        cx="120"
        cy="246"
        rx="58"
        ry="11"
        fill="#2b2420"
        opacity="0.16"
      />

      <g className={float ? "yo-float" : undefined}>
        {/* body */}
        <path
          d="M120 34c-58 0-76 46-76 100 0 55 34 86 76 86s76-31 76-86c0-54-18-100-76-100z"
          fill="url(#yo-body)"
        />
        {/* soft gloss highlight */}
        <ellipse
          cx="92"
          cy="96"
          rx="34"
          ry="26"
          fill="url(#yo-gloss)"
          transform="rotate(-18 92 96)"
        />
        {/* cheeks */}
        <ellipse cx="80" cy="150" rx="18" ry="12" fill="url(#yo-cheek)" />
        <ellipse cx="160" cy="150" rx="18" ry="12" fill="url(#yo-cheek)" />
        {/* eyes */}
        <g fill="#3a2a22" className="yo-blink">
          <ellipse cx="96" cy="130" rx="11" ry="14" />
          <ellipse cx="144" cy="130" rx="11" ry="14" />
          <circle cx="100" cy="124" r="4" fill="#fff" />
          <circle cx="148" cy="124" r="4" fill="#fff" />
          <circle cx="92" cy="135" r="2.4" fill="#fff" />
          <circle cx="140" cy="135" r="2.4" fill="#fff" />
        </g>
        {/* mouth */}
        {mood === "happy" ? (
          <path
            d="M110 150c4 7 16 7 20 0"
            stroke="#3a2a22"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M112 152h16"
            stroke="#3a2a22"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </g>

      {/* orbiting spark — cute pop, uses the cool sweetener sparingly */}
      <g className="yo-orbit" style={{ transformOrigin: "120px 140px" }}>
        <path
          d="M120 40l3.4 8.6 8.6 3.4-8.6 3.4-3.4 8.6-3.4-8.6-8.6-3.4 8.6-3.4z"
          fill="#f0c58a"
        />
      </g>
    </svg>
  );
}

export default Mascot;
