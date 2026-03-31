import { useId } from "react";

/**
 * Layered SVG wave — brand gradient + soft back layer + crest highlight.
 * Use under headers (default) or flip for above footers.
 */
function Wave({ flip = false, compact = false, className = "" }) {
  const raw = useId().replace(/:/g, "");
  const gBack = `wvb-${raw}`;
  const gFront = `wvf-${raw}`;
  const gLine = `wvl-${raw}`;

  const heightClass = compact
    ? "h-9 w-full sm:h-11 md:h-12"
    : "h-[68px] w-full sm:h-[92px] md:h-[112px]";

  return (
    <div
      className={`wave-separator w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={heightClass}
      >
        <defs>
          <linearGradient id={gBack} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#312e81" stopOpacity="0.92" />
            <stop offset="28%" stopColor="#701a3d" stopOpacity="0.88" />
            <stop offset="55%" stopColor="#0e7490" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#115e59" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={gFront} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.88" />
            <stop offset="42%" stopColor="#a855f7" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={gLine} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M0,52 C320,98 640,22 960,56 C1120,74 1280,38 1440,50 L1440,0 L0,0 Z"
          fill={`url(#${gBack})`}
          opacity="0.55"
        />
        <path
          d="M0,68 C280,118 560,28 840,58 C1000,78 1180,32 1440,64 L1440,0 L0,0 Z"
          fill={`url(#${gFront})`}
        />
        <path
          d="M0,68 C280,118 560,28 840,58 C1000,78 1180,32 1440,64"
          fill="none"
          stroke={`url(#${gLine})`}
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export default Wave;
