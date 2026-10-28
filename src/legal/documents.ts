export interface LegalSection {
  title: string;
  paragraphs: readonly string[];
  items?: readonly string[];
}

export interface LegalDocument {
  title: string;
  summary: string;
  effective: string;
  sections: readonly LegalSection[];
}

export const TERMS: LegalDocument = {
  title: "Terms of Use",
  summary: "The terms that apply when you visit useglaux.com and use Glaux publications.",
  effective: "1 August 2026",
  sections: [
    {
      title: "Agreement",
      paragraphs: [
        "By accessing this website, you agree to these Terms of Use. If you do not agree, do not use the website. These terms apply to useglaux.com and the company information published here. A Glaux product may publish additional terms that apply to that product.",
      ],
    },
    {
      title: "Intelligence, not advice",
      paragraphs: [
        "Glaux publishes analytical intelligence and information. Nothing on this website is financial, investment, trading, legal, tax, agricultural, or other professional advice. Nothing is a recommendation to buy, sell, hold, or take any action.",
        "Models, estimates, and published records are uncertain and may be incomplete, delayed, or wrong. You remain responsible for checking information, obtaining appropriate professional advice, and making your own decisions.",
      ],
    },
    {
      title: "Permitted use",
      paragraphs: ["You may use this website for lawful personal or internal business purposes."],
      items: [
        "Do not interfere with the website, its hosting, or its security.",
        "Do not attempt to gain unauthorized access to systems or data.",
        "Do not misrepresent Glaux content, remove attribution, or imply an endorsement.",
        "Do not use automated access in a way that degrades service for others.",
      ],
    },
    {
      title: "Intellectual property",
      paragraphs: [
        "The Glaux name, owl mark, website design, copy, software, models, and publications are owned by Glaux or used with permission. These Terms do not transfer any ownership rights. You may link to public pages and quote short passages with clear attribution, subject to applicable law.",
      ],
    },
    {
      title: "Third-party services",
      paragraphs: [
        "This website links to Glaux products and may link to third-party services. Those destinations have their own terms and privacy practices. Glaux is not responsible for third-party availability, content, or conduct.",
      ],
    },
    {
      title: "Availability and changes",
      paragraphs: [
        "We may change, suspend, or discontinue any part of the website without notice. We may also update these Terms. The effective date above identifies the current version; continued use after an update means the revised Terms apply.",
      ],
    },
    {
      title: "Disclaimers",
      paragraphs: [
        "The website is provided on an “as is” and “as available” basis. To the fullest extent permitted by applicable law, Glaux disclaims implied warranties, including warranties of accuracy, availability, fitness for a particular purpose, and non-infringement.",
      ],
    },
    {
      title: "Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by applicable law, Glaux will not be liable for indirect, incidental, special, consequential, or punitive loss, or for lost profits, data, opportunity, or goodwill arising from use of or reliance on this website. Nothing in these Terms excludes liability that cannot legally be excluded.",
      ],
    },
    {
      title: "Applicable law",
      paragraphs: [
        "These Terms are governed by the laws that apply to Glaux and to your use of the website, without creating a choice of law where one is not legally available. Disputes will be brought before a court with competent jurisdiction.",
      ],
    },
    {
      title: "Contact",
      paragraphs: ["Questions about these Terms can be sent to support@useglaux.com."],
    },
  ],
};

export const PRIVACY: LegalDocument = {
  title: "Privacy Policy",
  summary: "How Glaux handles information when you visit useglaux.com.",
  effective: "1 August 2026",
  sections: [
    {
      title: "Scope",
      paragraphs: [
        "This Privacy Policy applies to useglaux.com. Glaux products may publish separate privacy notices when they collect or process information for their own services.",
      ],
    },
    {
      title: "Information we receive",
      paragraphs: [
        "This website has no accounts, forms, advertising pixels, or visitor analytics. We do not set cookies for analytics or marketing.",
        "Our hosting and security providers may automatically process basic technical information needed to deliver and protect the website. This can include an IP address, request time, requested URL, browser or device type, referring page, and security signals.",
        "If you email us, we receive the address, message, and any information you choose to include.",
      ],
    },
    {
      title: "How information is used",
      paragraphs: ["Technical and contact information may be used to:"],
      items: [
        "deliver, secure, diagnose, and maintain the website;",
        "detect abuse and respond to security incidents;",
        "reply to messages and provide requested support;",
        "comply with legal obligations and protect legitimate rights.",
      ],
    },
    {
      title: "Service providers",
      paragraphs: [
        "Cloudflare provides website delivery, security, and related infrastructure. It may process technical request information on our behalf or as an independent provider under its own privacy terms. We do not sell personal information or share it for targeted advertising.",
      ],
    },
    {
      title: "Retention",
      paragraphs: [
        "Technical logs are retained only as long as reasonably needed for delivery, security, troubleshooting, and legal compliance, subject to provider settings. Correspondence is retained as long as needed to answer the request and maintain an appropriate business record.",
      ],
    },
    {
      title: "International processing",
      paragraphs: [
        "Infrastructure providers may process information in multiple countries. Where required, appropriate contractual or legal safeguards are used for international transfers.",
      ],
    },
    {
      title: "Your choices and rights",
      paragraphs: [
        "Depending on applicable law, you may have rights to request access, correction, deletion, restriction, or a copy of personal information, or to object to certain processing. Contact us to make a request. We may need to verify your identity and may retain information where law permits or requires it.",
      ],
    },
    {
      title: "Children",
      paragraphs: [
        "This website is not directed to children, and we do not knowingly collect personal information from children through it.",
      ],
    },
    {
      title: "Security",
      paragraphs: [
        "We use reasonable technical and organizational safeguards, but no internet service can guarantee absolute security.",
      ],
    },
    {
      title: "Changes and contact",
      paragraphs: [
        "We may update this policy as the website or applicable requirements change. The effective date above identifies the current version.",
        "Privacy questions and requests can be sent to support@useglaux.com.",
      ],
    },
  ],
};
