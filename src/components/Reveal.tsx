import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";

/**
 * The one reveal used across the site: a short fade and rise as a block
 * scrolls into view, on the shared `--ease-out` curve.
 *
 * Nothing is hidden by default, and nothing depends on this running. A block
 * is only held back if it is still below the fold once the page has painted,
 * so the first screen never flashes out and back in. Anything already
 * scrolled past (a reload half way down, a link straight to a section) is
 * shown at once. Reduced motion, printing and a browser without an observer
 * all leave the block exactly as it was written.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Seconds. Staggers siblings so a row arrives in reading order. */
  delay?: number;
  /** So a reveal can sit directly inside a list without breaking it. */
  as?: "div" | "li";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) el.dataset.reveal = "in";
        else if (entry.boundingClientRect.top < 0) delete el.dataset.reveal;
        else return;
        observer.disconnect();
      },
      { rootMargin: "0px 0px -7% 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      delete el.dataset.reveal;
    };
  }, []);

  const style = delay
    ? ({ "--reveal-delay": `${Math.round(delay * 1000)}ms` } as CSSProperties)
    : undefined;

  return as === "li" ? (
    <li ref={ref as RefObject<HTMLLIElement | null>} className={className} style={style}>
      {children}
    </li>
  ) : (
    <div ref={ref as RefObject<HTMLDivElement | null>} className={className} style={style}>
      {children}
    </div>
  );
}
