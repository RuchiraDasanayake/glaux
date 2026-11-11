/**
 * The Glaux owl, ported from `logo/glaux-mark-transparent.svg`.
 *
 * Every path, radius and colour below is the supplied artwork's own, in its
 * own coordinates. Nothing is redrawn. The only things computed rather than
 * copied are the tick marks, which the artwork lays out on exact angles, so
 * generating them gives the same coordinates to two decimals without 150
 * hand-copied lines in the bundle.
 *
 * `detail="compact"` leaves out what cannot survive at header size (the
 * sensor ticks and hairline rings inside the eyes, the secondary glints) so
 * a 32px owl stays crisp instead of turning that detail into grey haze.
 */

const GOLD = "#E9B45C";
const INK = "#060A12";

type Stop = readonly [offset: number, color: string, opacity?: number];
type Linear = readonly [name: string, x1: number, y1: number, x2: number, y2: number, Stop[]];
type Radial = readonly [name: string, cx: number, cy: number, r: number, Stop[]];

const LINEAR: readonly Linear[] = [
  // Sculpted silver plates
  [
    "plate",
    0,
    0,
    100,
    100,
    [
      [0, "#FFFFFF"],
      [35, "#DCE6F4"],
      [75, "#7F95B5"],
      [100, "#2D3E5A"],
    ],
  ],
  [
    "plate-left",
    0,
    0,
    100,
    100,
    [
      [0, "#F7FAFF"],
      [30, "#D4E1F2"],
      [70, "#758BA9"],
      [100, "#25344D"],
    ],
  ],
  [
    "plate-right",
    100,
    0,
    0,
    100,
    [
      [0, "#F7FAFF"],
      [30, "#C9D8EC"],
      [70, "#687E9E"],
      [100, "#1E2C42"],
    ],
  ],
  [
    "steel",
    0,
    0,
    0,
    100,
    [
      [0, "#8DA0BC"],
      [50, "#3E5270"],
      [100, "#141E30"],
    ],
  ],
  [
    "rim",
    0,
    0,
    0,
    100,
    [
      [0, "#FFFFFF", 0.9],
      [55, "#DCE6F4", 0.65],
      [100, GOLD, 0.45],
    ],
  ],
  // Brow blades and crown
  [
    "brow-left",
    0,
    0,
    100,
    80,
    [
      [0, "#FFFFFF"],
      [28, "#E4EDF9"],
      [68, "#8FA4C2"],
      [100, "#435775"],
    ],
  ],
  [
    "brow-right",
    100,
    0,
    0,
    80,
    [
      [0, "#FFFFFF"],
      [28, "#DCE7F6"],
      [68, "#8298B8"],
      [100, "#384B68"],
    ],
  ],
  [
    "bevel",
    0,
    0,
    0,
    100,
    [
      [0, "#1B273D"],
      [100, "#0B111D"],
    ],
  ],
  [
    "crown",
    50,
    0,
    50,
    100,
    [
      [0, "#3B4F70"],
      [55, "#19253A"],
      [100, "#0B111E"],
    ],
  ],
  // The four facets of the beak
  [
    "beak-tl",
    0,
    0,
    100,
    100,
    [
      [0, "#FFFDF5"],
      [50, "#F7D391"],
      [100, GOLD],
    ],
  ],
  [
    "beak-tr",
    0,
    0,
    100,
    100,
    [
      [0, "#F2C674"],
      [60, "#C98A27"],
      [100, "#8C5B0E"],
    ],
  ],
  [
    "beak-bl",
    0,
    0,
    100,
    100,
    [
      [0, "#F2C674"],
      [55, "#D49632"],
      [100, "#8F5D10"],
    ],
  ],
  [
    "beak-br",
    0,
    0,
    100,
    100,
    [
      [0, "#B87A1B"],
      [60, "#7D4F0A"],
      [100, "#452903"],
    ],
  ],
];

const RADIAL: readonly Radial[] = [
  [
    "eye-glow",
    50,
    50,
    50,
    [
      [0, "#F5C66B", 0.38],
      [65, GOLD, 0.1],
      [100, GOLD, 0],
    ],
  ],
  [
    "chamber",
    50,
    50,
    50,
    [
      [0, "#1C160B"],
      [70, "#090D16"],
      [100, "#030509"],
    ],
  ],
  [
    "iris",
    44,
    38,
    62,
    [
      [0, "#FFFDF4"],
      [22, "#FFE6A3"],
      [55, GOLD],
      [85, "#B87818"],
      [100, "#6B4105"],
    ],
  ],
];

function Stops({ stops }: { stops: readonly Stop[] }) {
  return stops.map(([offset, color, opacity]) => (
    <stop key={offset} offset={`${offset}%`} stopColor={color} stopOpacity={opacity} />
  ));
}

export function OwlGradients({ id }: { id: string }) {
  return (
    <defs>
      {LINEAR.map(([name, x1, y1, x2, y2, stops]) => (
        <linearGradient
          key={name}
          id={`${id}-${name}`}
          x1={`${x1}%`}
          y1={`${y1}%`}
          x2={`${x2}%`}
          y2={`${y2}%`}
        >
          <Stops stops={stops} />
        </linearGradient>
      ))}
      {RADIAL.map(([name, cx, cy, r, stops]) => (
        <radialGradient key={name} id={`${id}-${name}`} cx={`${cx}%`} cy={`${cy}%`} r={`${r}%`}>
          <Stops stops={stops} />
        </radialGradient>
      ))}
    </defs>
  );
}

const EYE_Y = 410;
const EYES = [366, 634] as const;

/** 24 sensor ticks at 15° steps: long on the axes, medium on the diagonals. */
const EYE_TICKS = Array.from({ length: 24 }, (_, k) => {
  const angle = (k * 15 * Math.PI) / 180;
  const axis = k % 6 === 0;
  const diagonal = k % 3 === 0;
  return {
    cos: Math.cos(angle),
    sin: Math.sin(angle),
    inner: axis ? 55 : diagonal ? 58 : 60,
    width: axis ? 2.2 : diagonal ? 1.5 : 0.9,
    opacity: axis ? 0.9 : 0.5,
  };
});

function Eye({ cx, u, full }: { cx: number; u: (name: string) => string; full: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={EYE_Y} r="102" fill={u("eye-glow")} />
      <circle cx={cx} cy={EYE_Y} r="84" fill={INK} stroke={u("plate")} strokeWidth="7" />
      {full && (
        <circle
          cx={cx}
          cy={EYE_Y}
          r="79"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.45"
        />
      )}
      <circle
        cx={cx}
        cy={EYE_Y}
        r="74"
        fill={u("chamber")}
        stroke={GOLD}
        strokeWidth="1.8"
        strokeOpacity="0.75"
      />
      <circle
        cx={cx}
        cy={EYE_Y}
        r="66"
        fill="none"
        stroke={GOLD}
        strokeWidth="1.2"
        strokeOpacity="0.55"
      />
      {full && (
        <>
          <circle
            cx={cx}
            cy={EYE_Y}
            r="54"
            fill="none"
            stroke={GOLD}
            strokeWidth="1.4"
            strokeDasharray="22 8 6 8"
            strokeOpacity="0.7"
          />
          {EYE_TICKS.map((tick, k) => (
            <line
              key={k}
              x1={(cx + tick.inner * tick.cos).toFixed(2)}
              y1={(EYE_Y + tick.inner * tick.sin).toFixed(2)}
              x2={(cx + 66 * tick.cos).toFixed(2)}
              y2={(EYE_Y + 66 * tick.sin).toFixed(2)}
              stroke={GOLD}
              strokeWidth={tick.width}
              strokeOpacity={tick.opacity}
              strokeLinecap="round"
            />
          ))}
        </>
      )}

      {/* The iris moves as one piece when the hero owl follows the pointer. */}
      <g data-iris="">
        <circle cx={cx} cy={EYE_Y} r="45" fill={u("iris")} stroke="#FFE39E" strokeWidth="1.6" />
        {full && (
          <>
            <circle
              cx={cx}
              cy={EYE_Y}
              r="33"
              fill="none"
              stroke="#5E3804"
              strokeWidth="1.4"
              strokeDasharray="8 4"
              strokeOpacity="0.55"
            />
            <circle
              cx={cx}
              cy={EYE_Y}
              r="25"
              fill="none"
              stroke="#FFF6D6"
              strokeWidth="1"
              strokeOpacity="0.65"
            />
          </>
        )}
        <circle cx={cx} cy={EYE_Y} r="17.5" fill="#05080F" stroke="#FFF0C2" strokeWidth="1.2" />
        <circle cx={cx - 14} cy={EYE_Y - 14} r="6.2" fill="#FFFFFF" opacity="0.94" />
        {full && (
          <>
            <circle cx={cx - 5} cy={EYE_Y - 20} r="2.5" fill="#FFFFFF" opacity="0.75" />
            <circle cx={cx + 13} cy={EYE_Y + 13} r="3.2" fill="#FFE8A3" opacity="0.82" />
          </>
        )}
      </g>
    </g>
  );
}

export function OwlHead({ id, detail = "full" }: { id: string; detail?: "full" | "compact" }) {
  const u = (name: string) => `url(#${id}-${name})`;
  const full = detail === "full";

  return (
    <>
      {/* 1. Dark shield backing: the negative space between the plates. */}
      <path
        d="M186 232C264 226 360 258 430 296C462 272 538 272 570 296C640 258 736 226 814 232C806 310 796 420 762 504C712 624 614 708 500 778C386 708 288 624 238 504C204 420 194 310 186 232Z"
        fill={INK}
        stroke={GOLD}
        strokeWidth="1.2"
        strokeOpacity="0.28"
      />

      {/* 2. Three nested silver wing plates each side, and the gold spine. */}
      <g strokeLinejoin="round">
        <path
          d="M212 318C226 326 240 342 244 362C238 446 272 536 344 614C392 666 446 708 493 740L493 776C428 734 358 680 302 614C228 526 196 424 212 318Z"
          fill={u("plate-left")}
          stroke={u("rim")}
          strokeWidth="1.8"
        />
        <path
          d="M788 318C774 326 760 342 756 362C762 446 728 536 656 614C608 666 554 708 507 740L507 776C572 734 642 680 698 614C772 526 804 424 788 318Z"
          fill={u("plate-right")}
          stroke={u("rim")}
          strokeWidth="1.8"
        />
        <path
          d="M254 446C268 468 286 484 306 494C336 558 398 622 493 684L493 722C386 654 294 566 254 446Z"
          fill={u("plate-left")}
          stroke={u("rim")}
          strokeWidth="1.6"
        />
        <path
          d="M746 446C732 468 714 484 694 494C664 558 602 622 507 684L507 722C614 654 706 566 746 446Z"
          fill={u("plate-right")}
          stroke={u("rim")}
          strokeWidth="1.6"
        />
        <path
          d="M326 504C356 516 388 518 418 510C442 552 466 588 493 620L493 664C418 612 358 560 326 504Z"
          fill={u("plate-left")}
          stroke={GOLD}
          strokeWidth="1.5"
          strokeOpacity="0.85"
        />
        <path
          d="M674 504C644 516 612 518 582 510C558 552 534 588 507 620L507 664C582 612 642 560 674 504Z"
          fill={u("plate-right")}
          stroke={GOLD}
          strokeWidth="1.5"
          strokeOpacity="0.85"
        />
      </g>
      <line
        x1="500"
        y1="546"
        x2="500"
        y2="782"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <polygon points="500,774 507,788 500,802 493,788" fill={GOLD} />

      {/* 3. Cheek crescents framing the eyes. */}
      <path
        d="M234 294C214 366 232 442 288 484C332 516 392 516 438 486C394 498 340 490 304 456C262 416 250 352 266 298Z"
        fill={u("steel")}
        stroke={u("rim")}
        strokeWidth="1.4"
      />
      <path
        d="M766 294C786 366 768 442 712 484C668 516 608 516 562 486C606 498 660 490 696 456C738 416 750 352 734 298Z"
        fill={u("steel")}
        stroke={u("rim")}
        strokeWidth="1.4"
      />

      {/* 4. The eyes. */}
      {EYES.map((cx) => (
        <Eye key={cx} cx={cx} u={u} full={full} />
      ))}

      {/* 5. Crown crest and the two brow blades, each with its bevel. */}
      <path
        d="M340 278C392 246 444 232 500 232C556 232 608 246 660 278C608 286 552 314 500 356C448 314 392 286 340 278Z"
        fill={u("crown")}
        stroke={u("rim")}
        strokeWidth="1.6"
      />
      <path
        d="M436 266L500 318L564 266"
        fill="none"
        stroke={GOLD}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {full && (
        <path
          d="M458 250L500 284L542 250"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.6"
          strokeOpacity="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <polygon points="500,214 507,228 500,242 493,228" fill={GOLD} />
      <path
        d="M176 226C254 228 344 252 424 294C454 310 480 330 500 354L500 388C466 356 424 330 374 316C308 298 242 292 198 274C186 260 180 244 176 226Z"
        fill={u("brow-left")}
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M198 274C242 292 308 298 374 316C424 330 466 356 500 388L500 400C460 366 412 340 358 328C298 314 242 308 206 288Z"
        fill={u("bevel")}
        stroke={GOLD}
        strokeWidth="1"
        strokeOpacity="0.55"
      />
      <path
        d="M824 226C746 228 656 252 576 294C546 310 520 330 500 354L500 388C534 356 576 330 626 316C692 298 758 292 802 274C814 260 820 244 824 226Z"
        fill={u("brow-right")}
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M802 274C758 292 692 298 626 316C576 330 534 356 500 388L500 400C540 366 588 340 642 328C702 314 758 308 794 288Z"
        fill={u("bevel")}
        stroke={GOLD}
        strokeWidth="1"
        strokeOpacity="0.55"
      />

      {/* 6. The faceted gold beak: the plumb line of the whole mark. */}
      <polygon
        points="500,350 554,442 500,564 446,442"
        fill={INK}
        stroke={GOLD}
        strokeWidth="1.5"
      />
      <polygon points="500,358 452,442 500,442" fill={u("beak-tl")} />
      <polygon points="500,358 548,442 500,442" fill={u("beak-tr")} />
      <polygon points="500,442 452,442 500,556" fill={u("beak-bl")} />
      <polygon points="500,442 548,442 500,556" fill={u("beak-br")} />
      <polygon
        points="500,358 548,442 500,556 452,442"
        fill="none"
        stroke="#FFF3D1"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {full && (
        <>
          <line
            x1="500"
            y1="358"
            x2="500"
            y2="556"
            stroke="#FFFDF7"
            strokeWidth="1.6"
            strokeOpacity="0.9"
          />
          <line
            x1="452"
            y1="442"
            x2="548"
            y2="442"
            stroke="#5E3804"
            strokeWidth="1.2"
            strokeOpacity="0.55"
          />
          <circle cx="500" cy="442" r="4" fill="#070B12" stroke="#FFF3D1" strokeWidth="1.6" />
        </>
      )}
    </>
  );
}
