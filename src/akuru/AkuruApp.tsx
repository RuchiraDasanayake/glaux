import { Fragment } from "react";
import OwlMark from "../components/OwlMark";
import { CONTACT_EMAIL, WORDMARK } from "../lib/brand";
import {
  FIXES,
  FREE_FEATURES,
  PLANS,
  QUESTIONS,
  TRIAL_DAYS,
  steps,
  type Specimen,
} from "./content";
import { RELEASE, downloadUrl, fileSize, releaseDate } from "./release";

const { setup, portable } = RELEASE.files;
const onWindows = /Windows/i.test(navigator.userAgent);
const lkr = (amount: number) => `LKR ${amount.toLocaleString("en-US")}`;

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 2.5v8m0 0-3.2-3.2M8 10.5l3.2-3.2M3 13.5h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Sample({ specimen, wrong }: { specimen: Specimen; wrong?: boolean }) {
  const className = `akuru-sample${wrong ? " akuru-sample--wrong" : ""}`;
  return specimen.sinhala ? (
    <span className={`${className} akuru-si`} lang="si">
      {specimen.text}
    </span>
  ) : (
    <code className={className}>{specimen.text}</code>
  );
}

function SectionHead({
  id,
  eyebrow,
  title,
  lead,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="section__head section__head--split">
      <p className="eyebrow">
        <span className="dot" aria-hidden="true" />
        {eyebrow}
      </p>
      <div className="section__intro">
        <h2 id={id} className="section__title">
          {title}
        </h2>
        {lead && <p className="section__lead">{lead}</p>}
      </div>
    </div>
  );
}

export default function AkuruApp() {
  return (
    <>
      <a className="skip-link" href="#akuru-content">
        Skip to content
      </a>
      <header className="akuru-nav shell">
        <a className="akuru-nav__brand" href="/" aria-label="Glaux home">
          <OwlMark size={24} />
          {WORDMARK}
        </a>
        <a className="link-arrow link-arrow--sm" href="/#products">
          All products
        </a>
      </header>

      <main id="akuru-content" tabIndex={-1}>
        <section className="akuru-hero shell" aria-labelledby="akuru-title">
          <div className="akuru-hero__copy">
            <p className="akuru-hero__product">
              <img src="/akuru/icon.svg" alt="" width={44} height={44} />
              <span>
                Glaux Akuru
                <small>Windows app · Free to download</small>
              </span>
            </p>
            <h1 id="akuru-title" className="akuru-hero__title">
              Sinhala, typed right.
            </h1>
            <p className="akuru-hero__si akuru-si" lang="si">
              සිංහල අකුරු, නිවැරදිව.
            </p>
            <p className="akuru-hero__lead">
              Type in Singlish or Wijesekara, turn FM Abhaya text and Word files into Unicode and
              back, and fix Sinhala that only looks right. Made for communication centres, bookshops
              and print shops, and it works with no internet.
            </p>

            <div className="akuru-download">
              <a className="btn" href={downloadUrl(setup)}>
                <DownloadIcon />
                Download for Windows
              </a>
              <p className="akuru-download__spec">
                {[
                  `Version ${RELEASE.version}`,
                  fileSize(setup),
                  "Windows 10 and 11",
                  "No admin password",
                ].map((item, index) => (
                  <Fragment key={item}>
                    {index > 0 && " · "}
                    <span>{item}</span>
                  </Fragment>
                ))}
              </p>
              {!onWindows && (
                <p className="akuru-download__note">
                  This download is for Windows PCs. Open useglaux.com/akuru on the shop computer to
                  install it.
                </p>
              )}
              <a className="link-arrow" href={downloadUrl(portable)}>
                Portable version, nothing to install
              </a>
            </div>
          </div>

          <figure className="akuru-shot">
            <div className="akuru-shot__frame">
              <div className="akuru-shot__bar" aria-hidden="true">
                <img src="/akuru/icon.svg" alt="" width={14} height={14} />
                Glaux Akuru
                <svg
                  className="akuru-shot__controls"
                  width="96"
                  height="10"
                  viewBox="0 0 96 10"
                  fill="none"
                >
                  <path
                    d="M4 5h10M41 1h8v8h-8zM82 1l8 8m0-8-8 8"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <img
                src="/akuru/editor.webp"
                width={1600}
                height={1013}
                fetchPriority="high"
                alt="The Glaux Akuru editor with a shop notice typed in Sinhala from Singlish, and word suggestions above the text."
              />
            </div>
            <figcaption>
              Typed as “heta udhei 8 ta kadei arinavaa”. The suggestions finish the word.
            </figcaption>
          </figure>
        </section>

        <section className="section shell" aria-labelledby="fixes-title">
          <SectionHead
            id="fixes-title"
            eyebrow="What it fixes"
            title="Sinhala work that shops still redo by hand."
            lead="A notice retyped from scratch, a CV that turns into boxes on the customer's phone, a web form that won't take FM text. Akuru handles each one on the PC, without uploading anything."
          />
          <ol className="akuru-fixes">
            {FIXES.map((fix, index) => (
              <li className="akuru-fix" key={fix.title}>
                <span className="akuru-fix__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="akuru-fix__title">{fix.title}</h3>
                <p className="akuru-fix__specimen">
                  <span className="sr-only">Before: </span>
                  <Sample specimen={fix.before} wrong={fix.broken} />
                  <span className="akuru-fix__after">
                    <span className="akuru-fix__arrow" aria-hidden="true">
                      →
                    </span>
                    <span className="sr-only">After: </span>
                    <Sample specimen={fix.after} />
                  </span>
                </p>
                <p className="akuru-fix__body">{fix.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="section shell" id="pricing" aria-labelledby="pricing-title">
          <SectionHead
            id="pricing-title"
            eyebrow="Pricing"
            title="Free for typing. Pro for Word files and hotkeys."
            lead={`Every install starts with ${TRIAL_DAYS} days of Pro. To keep it, pay monthly or yearly by bank transfer, eZ Cash or card, and send the receipt on WhatsApp from inside the app. We reply with a key. No account, and the app still never goes online.`}
          />
          <ul className="akuru-plans">
            <li className="akuru-plan">
              <h3>
                Free <span className="akuru-plan__pcs">Any number of PCs</span>
              </h3>
              <p className="akuru-plan__price">LKR 0</p>
              <p className="akuru-plan__note">For good</p>
              <ul>
                {FREE_FEATURES.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </li>
            {PLANS.map((plan) => (
              <li className="akuru-plan" key={plan.name}>
                <h3>
                  {plan.name} <span className="akuru-plan__pcs">{plan.pcs}</span>
                </h3>
                <p className="akuru-plan__price">
                  {lkr(plan.month)}
                  <small> a month</small>
                </p>
                <p className="akuru-plan__note">or {lkr(plan.year)} a year, two months free</p>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section className="section shell" id="install" aria-labelledby="install-title">
          <SectionHead
            id="install-title"
            eyebrow="Install"
            title="Installed in a minute, without an admin password."
            lead="One file and no setup questions. It installs for the Windows account you're signed in to."
          />
          <ol className="akuru-steps">
            {steps(setup.name).map((step, index) => (
              <li className="akuru-step" key={step.title}>
                <span className="akuru-step__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="akuru-extras">
            <div className="akuru-portable">
              <h3>A shop PC you can't install on, or a USB stick?</h3>
              <p>The portable version runs from any folder and leaves nothing installed.</p>
              <a className="link-arrow" href={downloadUrl(portable)}>
                Download portable · {fileSize(portable)}
              </a>
            </div>
            <dl className="akuru-specs">
              <div>
                <dt>Windows</dt>
                <dd>10 or 11, 64-bit</dd>
              </div>
              <div>
                <dt>Space</dt>
                <dd>350 MB free</dd>
              </div>
              <div>
                <dt>Internet</dt>
                <dd>Only to download</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>
                  {RELEASE.version}, {releaseDate}
                </dd>
              </div>
            </dl>
          </div>

          <details className="akuru-checksums">
            <summary>Check the files (SHA-256)</summary>
            <p>
              In PowerShell, run <code>Get-FileHash .\{setup.name}</code> in your Downloads folder
              and compare it with the line below.
            </p>
            <dl>
              {[setup, portable].map((file) => (
                <div key={file.name}>
                  <dt>{file.name}</dt>
                  <dd>
                    <code>{file.sha256.toUpperCase()}</code>
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        </section>

        <section className="section shell" aria-labelledby="faq-title">
          <SectionHead id="faq-title" eyebrow="Questions" title="Before you install." />
          <dl className="akuru-faq">
            {QUESTIONS.map((item) => (
              <div className="akuru-faq__item" key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="akuru-footer shell">
        <p>© {new Date().getFullYear()} Glaux. All rights reserved.</p>
        <nav aria-label="Footer">
          <a href="/">Glaux</a>
          <a href="/terms/">Terms</a>
          <a href="/privacy/">Privacy</a>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </nav>
      </footer>
    </>
  );
}
