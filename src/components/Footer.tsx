import {
  AKURU_PATH,
  COMPANY_NAME,
  CONTACT_EMAIL,
  DISCLAIMER,
  LEDGER_URL,
  PRODUCTS,
  TAGLINE,
  WORDMARK,
} from "../lib/brand";
import ArrowUpRight from "./ArrowUpRight";
import GlauxGlyph from "./brand/GlauxGlyph";

const unreleased = PRODUCTS.filter((product) => product.status !== "live");

/**
 * One footer for every page, in two lengths.
 *
 * `full` is the home page's: it opens with the closing statement and the
 * contact line, carries the disclaimer, and signs off with the wordmark.
 * `compact` is for the product and legal pages, which are there to do one
 * job and only need the way back: the logo, the same three columns, and the
 * copyright line.
 */
export default function Footer({ variant = "full" }: { variant?: "full" | "compact" }) {
  const full = variant === "full";
  /** Section links are in-page on the home page and lead back to it elsewhere. */
  const section = (hash: string) => (full ? hash : `/${hash}`);

  return (
    <footer className={`footer${full ? "" : " footer--compact"}`}>
      <div className="shell">
        {full && (
          <section className="footer__statement" id="contact" aria-labelledby="contact-title">
            <span className="eyebrow">
              <span className="dot" />
              Start a conversation
            </span>
            <div className="footer__statement-main">
              <h2 id="contact-title">Make uncertainty visible.</h2>
              <a className="footer__contact" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
                <ArrowUpRight size={18} />
              </a>
            </div>
          </section>
        )}

        <div className="footer__grid">
          <div className="footer__brand">
            <a className="footer__lockup" href={full ? "#top" : "/"} aria-label="Glaux home">
              <GlauxGlyph className="footer__mark" size={60} />
              <span className="footer__word">
                <span className="footer__name">{WORDMARK}</span>
                <span className="footer__tagline">{TAGLINE}</span>
              </span>
            </a>
            <p className="footer__tag">
              Calibrated, regime-aware intelligence systems. Built to be inspected, not taken on
              faith.
            </p>
          </div>

          <div className="footer__col">
            <h2>Products</h2>
            <ul>
              <li>
                <a href={LEDGER_URL}>
                  Glaux Ledger
                  <ArrowUpRight size={12} />
                </a>
              </li>
              <li>
                <a href={AKURU_PATH}>Glaux Akuru</a>
              </li>
              {unreleased.map((product) => (
                <li key={product.id}>
                  <span>
                    {product.name} <small>{product.statusLabel}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h2>Company</h2>
            <ul>
              <li>
                <a href={section("#what")}>What we do</a>
              </li>
              <li>
                <a href={section("#principles")}>Principles</a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h2>Legal</h2>
            <ul>
              <li>
                <a href="/terms/">Terms</a>
              </li>
              <li>
                <a href="/privacy/">Privacy</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__legal">
          {full && <p className="footer__disclaimer">{DISCLAIMER}</p>}
          <p className="footer__copyright">
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
        </div>

        {full && (
          <a className="footer__back" href="#top" aria-label="Back to top">
            Back to top
            <span aria-hidden="true">↑</span>
          </a>
        )}
      </div>
      {full && (
        <div className="footer__wordmark" aria-hidden="true">
          {WORDMARK}
        </div>
      )}
    </footer>
  );
}
