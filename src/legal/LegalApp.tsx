import Footer from "../components/Footer";
import SiteHeader from "../components/SiteHeader";
import type { HeaderAction } from "../components/SiteHeader";
import type { LegalDocument } from "./documents";

const ACTION: HeaderAction = { href: "/", label: "Back to company" };

export default function LegalApp({ document }: { document: LegalDocument }) {
  return (
    <>
      <a className="skip-link" href="#legal-content">
        Skip to legal content
      </a>
      <SiteHeader brandHref="/" action={ACTION} />

      <main className="legal-shell shell" id="legal-content" tabIndex={-1}>
        <header className="legal-hero">
          <p className="eyebrow">
            <span className="dot" aria-hidden="true" />
            Legal
          </p>
          <h1>{document.title}</h1>
          <p className="legal-hero__summary">{document.summary}</p>
          <p className="legal-hero__effective">Effective {document.effective}</p>
        </header>

        <div className="legal-document">
          {document.sections.map((section) => (
            <section className="legal-section" key={section.title}>
              <h2>{section.title}</h2>
              <div className="legal-section__body">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.items && (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer variant="compact" />
    </>
  );
}
