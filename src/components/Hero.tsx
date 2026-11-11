import { HERO, LEDGER_URL, PRINCIPLES, TAGLINE, WORDMARK } from "../lib/brand";
import ArrowUpRight from "./ArrowUpRight";
import HeroMark from "./HeroMark";

/**
 * One composition: the logo, set large and alive, and beside it the same
 * three lines the logo lockups carry, in the same order. Wordmark, the
 * tagline under its diamond, then the mission line as the headline.
 *
 * The art column is decorative here because the heading already says the
 * name; the header's logo is the one that is announced.
 */
export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__grid shell">
        <div className="hero__art" aria-hidden="true">
          <HeroMark />
        </div>

        <div className="hero__content">
          {/* The wordmark, the tagline and the headline are one <h1> so the
              page has a single, fully descriptive top-level heading; they are
              only styled apart. */}
          <h1 className="hero__title">
            <span className="hero__wordmark">{WORDMARK}</span>
            <span className="hero__tagline">
              <span className="hero__tagline-rule" aria-hidden="true" />
              <span className="dot" aria-hidden="true" />
              {TAGLINE}
            </span>
            <span className="hero__headline">{HERO.headline}</span>
          </h1>

          <p className="hero__sub">{HERO.sub}</p>

          <div className="hero__cta">
            <a className="btn" href={LEDGER_URL}>
              {HERO.primaryCta}
              <ArrowUpRight size={15} />
            </a>
            <a className="link-arrow" href="#what">
              {HERO.secondaryCta}
            </a>
          </div>
        </div>
      </div>

      <div className="hero__foot shell">
        <a className="hero__scroll" href="#what">
          <span>Scroll</span>
          <span className="hero__scroll-line" aria-hidden="true" />
        </a>
        {/* The four words under the logo, which are also the four principles
            further down the page. */}
        <ul className="hero__pillars" aria-label="Glaux principles">
          {PRINCIPLES.map((principle) => (
            <li key={principle.index}>{principle.title}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
