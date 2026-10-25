import {
  AKURU_PATH,
  COMPANY_NAME,
  CONTACT_EMAIL,
  DISCLAIMER,
  LEDGER_URL,
  WORDMARK,
} from "../lib/brand";
import ArrowUpRight from "./ArrowUpRight";
import OwlMark from "./OwlMark";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__statement">
          <span className="eyebrow">
            <span className="dot" />
            Start a conversation
          </span>
          <div className="footer__statement-main">
            <p>Make uncertainty visible.</p>
            <a className="footer__contact" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>

        <div className="footer__grid">
          <div className="footer__brand">
            <span className="footer__lockup">
              <OwlMark size={26} />
              {WORDMARK}
            </span>
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
              <li>
                <span>Glaux Markets (in development)</span>
              </li>
              <li>
                <span>Glaux Agro (in development)</span>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h2>Company</h2>
            <ul>
              <li>
                <a href="#what">What we do</a>
              </li>
              <li>
                <a href="#principles">Principles</a>
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
          <p className="footer__disclaimer">{DISCLAIMER}</p>
          <p className="footer__copyright">
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
        </div>

        <a className="footer__back" href="#top" aria-label="Back to top">
          Back to top
          <span aria-hidden="true">↑</span>
        </a>
      </div>
      <div className="footer__wordmark" aria-hidden="true">
        {WORDMARK}
      </div>
    </footer>
  );
}
