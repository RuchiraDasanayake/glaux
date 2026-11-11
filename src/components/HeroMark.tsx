import { useEffect, useRef } from "react";
import GlauxMark from "./brand/GlauxMark";

const GOLD = "#E9B45C";
const STEEL = "#8DA0BC";

/**
 * The stage is 1080 units across and the mark is drawn into it at its own
 * scale (1000 units), so every radius below is in the artwork's units and
 * measured from the centre of the mark's astrolabe ring. The mark's own ring
 * ends at 377 and its degree labels at 440; the two orbits sit outside that.
 */
const STAGE = 1080;
const VIEW_BOX = `${-STAGE / 2} ${-STAGE / 2} ${STAGE} ${STAGE}`;

/** How far the irises travel towards the pointer, in artwork units. The iris
    is 45 units in radius and its inner reticle ring 54, so 9 keeps the gold
    inside its own sensor however far away the pointer is. */
const GAZE = 9;

const point = (radius: number, degrees: number) => {
  const angle = (degrees * Math.PI) / 180;
  return [radius * Math.cos(angle), radius * Math.sin(angle)].map((n) => n.toFixed(2)).join(" ");
};

/** Dash pattern that lays `count` ticks of `length` evenly around a circle. */
const ticks = (radius: number, count: number, length: number) =>
  `${length} ${((2 * Math.PI * radius) / count - length).toFixed(3)}`;

/**
 * The hero's subject: the Glaux mark, at rest in the middle of a slowly
 * turning instrument.
 *
 * The mark itself is never animated. It is the logo, and it is drawn exactly
 * as supplied. The life around it comes from three things layered on the
 * stage: two graduated rings that turn in opposite directions, a warm glow
 * behind the owl that breathes, and a glow over each eye that pulses. All of
 * those are opacity and transform on their own layers, so they run on the
 * compositor and cost the main thread nothing while the page is idle.
 *
 * On a device with a mouse the irises also follow the pointer by a few
 * units. That is the only script-driven motion, and it only runs while the
 * pointer is actually moving.
 */
export default function HeroMark() {
  const stageRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<SVGSVGElement>(null);

  // Nothing on the stage needs to tick while the hero is off screen.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) delete stage.dataset.paused;
      else stage.dataset.paused = "";
    });
    observer.observe(stage);
    return () => {
      observer.disconnect();
      delete stage.dataset.paused;
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const mark = markRef.current;
    if (!stage || !mark) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const irises = Array.from(mark.querySelectorAll<SVGGElement>("[data-iris]"));
    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    // Read once and reused until the page scrolls or resizes, so following
    // the pointer never forces a layout of its own.
    let box: DOMRect | null = null;

    const step = () => {
      frame = 0;
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      const settled = Math.abs(targetX - x) < 0.02 && Math.abs(targetY - y) < 0.02;
      if (settled) {
        x = targetX;
        y = targetY;
      }
      const transform = `translate(${x.toFixed(2)} ${y.toFixed(2)})`;
      for (const iris of irises) iris.setAttribute("transform", transform);
      if (!settled) frame = requestAnimationFrame(step);
    };
    const aim = (nextX: number, nextY: number) => {
      targetX = nextX;
      targetY = nextY;
      if (!frame) frame = requestAnimationFrame(step);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || "paused" in stage.dataset) return;
      box ??= stage.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy);
      if (distance < 1) {
        aim(0, 0);
        return;
      }
      // Full deflection is reached about half a stage away and held beyond.
      const reach = Math.min(1, distance / (box.width * 0.5));
      aim((dx / distance) * GAZE * reach, (dy / distance) * GAZE * reach);
    };
    const forget = () => {
      box = null;
    };
    const rest = () => aim(0, 0);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", forget, { passive: true });
    window.addEventListener("resize", forget, { passive: true });
    document.documentElement.addEventListener("pointerleave", rest);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", forget);
      window.removeEventListener("resize", forget);
      document.documentElement.removeEventListener("pointerleave", rest);
      if (frame) cancelAnimationFrame(frame);
      for (const iris of irises) iris.removeAttribute("transform");
    };
  }, []);

  return (
    <div className="mark-stage" ref={stageRef}>
      <div className="mark-stage__glow" />

      {/* Outer orbit: a dashed track and a hairline, with one satellite. */}
      <svg className="orbit orbit--outer" viewBox={VIEW_BOX} fill="none" focusable="false">
        <circle
          r="506"
          stroke={STEEL}
          strokeOpacity="0.26"
          strokeWidth="0.9"
          strokeDasharray="2 13"
        />
        <circle r="522" stroke={GOLD} strokeOpacity="0.13" strokeWidth="1" />
        <path
          d={`M${point(522, 150)} A522 522 0 0 1 ${point(522, 196)}`}
          stroke={GOLD}
          strokeOpacity="0.55"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle r="4.5" fill={GOLD} transform={`translate(${point(522, 150)})`} />
        <circle r="3" fill={STEEL} fillOpacity="0.8" transform={`translate(${point(506, -28)})`} />
      </svg>

      {/* Inner orbit: a graduated bezel, ticked every 3° and every 30°. */}
      <svg className="orbit orbit--inner" viewBox={VIEW_BOX} fill="none" focusable="false">
        <circle r="460" stroke={GOLD} strokeOpacity="0.2" strokeWidth="1" />
        <circle
          r="468"
          stroke={STEEL}
          strokeOpacity="0.38"
          strokeWidth="7"
          strokeDasharray={ticks(468, 120, 1)}
        />
        <circle
          r="471"
          stroke={GOLD}
          strokeOpacity="0.62"
          strokeWidth="13"
          strokeDasharray={ticks(471, 12, 1.5)}
        />
        <path
          d={`M${point(460, -90)} A460 460 0 0 1 ${point(460, -56)}`}
          stroke="#F2C674"
          strokeOpacity="0.8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <polygon points="0,-474 6.5,-460 0,-446 -6.5,-460" fill={GOLD} />
      </svg>

      <GlauxMark className="mark-stage__mark" ref={markRef} />

      <span className="mark-stage__eye mark-stage__eye--left" />
      <span className="mark-stage__eye mark-stage__eye--right" />
    </div>
  );
}
