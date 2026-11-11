import type { Ref } from "react";
import { useArtId } from "./artId";
import { DEGREE_LABELS } from "./degreeLabels";
import { OwlGradients, OwlHead } from "./owlArt";

const GOLD = "#E9B45C";
const STEEL = "#8DA0BC";

/** Centre of the astrolabe ring, in the artwork's own coordinates. */
const CX = 500;
const CY = 410;

/**
 * The graduated half-ring above the owl: 73 ticks from −90° to +90° in 2.5°
 * steps. Cardinal ticks every 45°, gold ticks every 15°, steel every 5°.
 */
const PROTRACTOR = Array.from({ length: 73 }, (_, i) => {
  const angle = ((180 - i * 2.5) * Math.PI) / 180;
  const cardinal = i % 18 === 0;
  const major = i % 6 === 0;
  const minor = i % 2 === 0;
  const inner = cardinal ? 322 : 328;
  const outer = cardinal ? 348 : major ? 342 : minor ? 337 : 333;
  return {
    x1: (CX + inner * Math.cos(angle)).toFixed(2),
    y1: (CY - inner * Math.sin(angle)).toFixed(2),
    x2: (CX + outer * Math.cos(angle)).toFixed(2),
    y2: (CY - outer * Math.sin(angle)).toFixed(2),
    stroke: cardinal || major ? GOLD : STEEL,
    width: cardinal ? 2.6 : major ? 1.8 : minor ? 1.2 : 0.75,
    opacity: cardinal ? 0.95 : major ? 0.75 : minor ? 0.45 : 0.26,
  };
});

/**
 * The full Glaux mark: the owl inside its astrolabe ring, exactly as supplied
 * in `logo/glaux-mark-transparent.svg` (same viewBox, same placement).
 *
 * Used large, in the hero. For header and footer sizes use `GlauxGlyph`, which
 * is the same owl without the ring.
 */
export default function GlauxMark({
  className,
  ref,
}: {
  className?: string;
  ref?: Ref<SVGSVGElement>;
}) {
  const id = useArtId();

  return (
    <svg
      ref={ref}
      className={className}
      viewBox="0 0 1000 1000"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <OwlGradients id={id} />
      <g transform="translate(500 488) scale(1.06) translate(-500 -450)">
        {/* Astrolabe horizon circles */}
        <circle cx={CX} cy={CY} r="356" stroke={GOLD} strokeWidth="1.1" strokeOpacity="0.22" />
        <circle cx={CX} cy={CY} r="328" stroke={GOLD} strokeWidth="1.6" strokeOpacity="0.38" />
        <circle
          cx={CX}
          cy={CY}
          r="314"
          stroke={STEEL}
          strokeWidth="0.9"
          strokeDasharray="4 8"
          strokeOpacity="0.28"
        />

        {/* Crosshairs: the spine and the horizon */}
        <line
          x1="500"
          y1="18"
          x2="500"
          y2="802"
          stroke={GOLD}
          strokeWidth="1.2"
          strokeOpacity="0.32"
        />
        <line
          x1="152"
          y1="410"
          x2="848"
          y2="410"
          stroke={GOLD}
          strokeWidth="1.1"
          strokeOpacity="0.26"
        />

        {PROTRACTOR.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.stroke}
            strokeWidth={tick.width}
            strokeOpacity={tick.opacity}
            strokeLinecap="round"
          />
        ))}

        {/* Cardinal diamonds */}
        <polygon points="500,48 507,60 500,72 493,60" fill={GOLD} />
        <polygon points="500,782 506,770 500,758 494,770" fill={GOLD} opacity="0.8" />
        <polygon points="144,410 154,405 164,410 154,415" fill={GOLD} opacity="0.75" />
        <polygon points="856,410 846,405 836,410 846,415" fill={GOLD} opacity="0.75" />

        {DEGREE_LABELS.map((label, i) => (
          <path key={i} d={label.d} fill={GOLD} fillOpacity={label.opacity} />
        ))}

        <OwlHead id={id} detail="full" />
      </g>
    </svg>
  );
}
