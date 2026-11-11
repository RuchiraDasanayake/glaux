import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Principles from "./components/Principles";
import ProductGrid from "./components/ProductGrid";
import SiteHeader from "./components/SiteHeader";
import type { HeaderAction, HeaderLink } from "./components/SiteHeader";
import WhatWeDo from "./components/WhatWeDo";
import { HERO, LEDGER_URL } from "./lib/brand";
import { useSmoothAnchors } from "./lib/scrollTo";

const LINKS: readonly HeaderLink[] = [
  { href: "#what", label: "What we do" },
  { href: "#products", label: "Products" },
  { href: "#principles", label: "Principles" },
  { href: "#contact", label: "Contact" },
];

/** The same destination as the hero's button, as a quiet link: the page still
    has exactly one filled button. */
const ACTION: HeaderAction = { href: LEDGER_URL, label: HERO.primaryCta, external: true };

export default function App() {
  useSmoothAnchors();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader brandHref="#top" links={LINKS} action={ACTION} />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <WhatWeDo />
        <hr className="rule" />
        <ProductGrid />
        <hr className="rule" />
        <Principles />
      </main>
      <Footer />
    </>
  );
}
