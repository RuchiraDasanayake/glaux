import { useEffect, useRef, useState } from "react";
import { WORDMARK } from "../lib/brand";
import ArrowUpRight from "./ArrowUpRight";
import GlauxGlyph from "./brand/GlauxGlyph";

export interface HeaderLink {
  href: string;
  label: string;
}

export interface HeaderAction extends HeaderLink {
  /** Leaves this site, so it carries the outbound arrow. */
  external?: boolean;
}

/** Below this width the links move into the menu. Mirrors the CSS breakpoint. */
const DESKTOP = "(min-width: 900px)";

/**
 * The one header every page shares: the logo on the spine, the page's links,
 * and one quiet action on the right.
 *
 * It is always on screen. Over the top of a page it is bare, so the hero keeps
 * its full height; once the page moves it takes a solid bar. On a phone the
 * links fold into a menu rather than disappearing, which is what they used to
 * do.
 */
export default function SiteHeader({
  brandHref,
  links = [],
  action,
}: {
  /** "#top" on the home page, "/" everywhere else. */
  brandHref: string;
  links?: readonly HeaderLink[];
  action?: HeaderAction;
}) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  const hasMenu = links.length > 0;

  // Solid bar and reading progress. The document height is cached and only
  // re-read when the page resizes, so scrolling never forces a layout.
  useEffect(() => {
    let frame = 0;
    let scrollable = document.documentElement.scrollHeight - window.innerHeight;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setSolid(y > 12);
      const progress = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;
      progressRef.current?.style.setProperty("--scroll-progress", String(progress));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const remeasure = () => {
      scrollable = document.documentElement.scrollHeight - window.innerHeight;
      onScroll();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Which in-page section is being read. Every tracked section's state is
  // kept, not just the ones in the latest callback, so scrolling back up to
  // the hero clears the highlight instead of leaving the last one lit.
  useEffect(() => {
    const ids = links.filter((link) => link.href.startsWith("#")).map((link) => link.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        setActive(best);
      },
      { rootMargin: "-24% 0px -58% 0px", threshold: [0, 0.1, 0.25] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);

  // While the menu is open it is the only thing on the page: the content
  // behind it neither scrolls nor takes focus, and Escape closes it.
  useEffect(() => {
    if (!open) return;

    const header = headerRef.current;
    const root = document.documentElement;
    const behind = Array.from(header?.parentElement?.children ?? []).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== header,
    );
    root.classList.add("menu-open");
    for (const el of behind) el.inert = true;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const desktop = window.matchMedia(DESKTOP);
    const onWiden = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onWiden);
    return () => {
      root.classList.remove("menu-open");
      for (const el of behind) el.inert = false;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onWiden);
    };
  }, [open]);

  const classes = ["site-header", solid && "is-solid", open && "is-open", !hasMenu && "is-plain"]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes} ref={headerRef}>
      <div className="site-header__inner shell">
        <a className="brand" href={brandHref} aria-label="Glaux home">
          <GlauxGlyph className="brand__mark" size={36} />
          <span className="brand__word">{WORDMARK}</span>
        </a>

        {hasMenu && (
          <nav className="site-nav" aria-label="Primary">
            {links.map((link) => (
              <a
                key={link.href}
                className="site-nav__link"
                href={link.href}
                aria-current={
                  active !== null && link.href === `#${active}` ? "location" : undefined
                }
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {action && (
          <a className="link-arrow link-arrow--sm site-header__action" href={action.href}>
            {action.label}
            {action.external && <ArrowUpRight size={12} />}
          </a>
        )}

        {hasMenu && (
          <button
            ref={toggleRef}
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((current) => !current)}
          >
            <span className="menu-toggle__label">{open ? "Close" : "Menu"}</span>
            <span className="menu-toggle__icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        )}
      </div>

      {hasMenu && (
        <div className="site-menu" id="site-menu" hidden={!open}>
          <nav className="site-menu__inner shell" aria-label="Menu">
            <ul>
              {links.map((link, index) => (
                <li key={link.href}>
                  <a className="site-menu__link" href={link.href} onClick={() => setOpen(false)}>
                    <span className="site-menu__index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            {action && (
              <a
                className="link-arrow link-arrow--lead site-menu__action"
                href={action.href}
                onClick={() => setOpen(false)}
              >
                {action.label}
                {action.external && <ArrowUpRight size={15} />}
              </a>
            )}
          </nav>
        </div>
      )}

      <span className="site-header__progress" ref={progressRef} aria-hidden="true" />
    </header>
  );
}
