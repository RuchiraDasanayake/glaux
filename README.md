# Glaux | useglaux.com

The company site for Glaux: the parent-brand hub that explains what Glaux is
and routes people to the products. A single page, dark-only, anchored on the
Glaux logo: the owl emblem set large in the hero with its instrument ring
turning slowly around it. Beside it sit the download page for the Glaux Akuru
Windows app at `/akuru/` and the Terms and Privacy pages, all under one
header and one footer.

The page is built on one left spine. The logo in the header sits on it, copy
starts on it in every section, the hero splits copy left against the owl
right, and nothing is centred. A centred hero over left-aligned sections is
the shape of a template, and this is meant to read as a research group rather
than a landing page.

Products it points at:

- **Glaux Ledger**: [ledger.useglaux.com](https://ledger.useglaux.com) (live)
- **Glaux Akuru**: [useglaux.com/akuru](https://useglaux.com/akuru/) (live; a Windows app, downloaded
  from its page here)
- **Glaux Markets**: in development
- **Glaux Agro**: in development

## Stack

React 19 · TypeScript 5.9 · Vite 8 · plain CSS custom properties (no
Tailwind). There is no animation or 3D library: the logo is inline SVG and
everything that moves is CSS.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script                 | What it does                                           |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Vite dev server                                        |
| `npm run build`        | `tsc --noEmit` then a production build into `dist/`    |
| `npm run preview`      | Serve the built `dist/` on port 4173                   |
| `npm run typecheck`    | Types only                                             |
| `npm run lint`         | ESLint with TypeScript, hooks, and accessibility rules |
| `npm run format:check` | Check formatting with Prettier                         |
| `npm run check`        | Lint, formatting, and strict types                     |
| `npm run test:e2e`     | Playwright smoke and accessibility checks              |
| `npm run assets`       | Re-render the favicon, social cards and app icons      |

### Environment

Everything has a working default; `.env` is optional. See `.env.example`.

| Variable               | Default                                | Purpose                                     |
| ---------------------- | -------------------------------------- | ------------------------------------------- |
| `VITE_LEDGER_URL`      | `https://ledger.useglaux.com`          | Product origin used by every Ledger link    |
| `VITE_AKURU_DOWNLOADS` | `https://downloads.useglaux.com/akuru` | Where the Glaux Akuru installers are served |

## Deployment

A static upload of `dist/`. There is no server code, no API route, no
Cloudflare Worker, no Wrangler config, and no Pages Functions: only static
files. Any static host serves it identically.

It runs on **Cloudflare Pages** (Git-connected build in the dashboard; not a
Workers project). Connect the repo and set:

| Setting          | Value           |
| ---------------- | --------------- |
| Build command    | `npm run build` |
| Output directory | `dist`          |
| Root directory   | `/`             |

Node is pinned by `.node-version` (22.12.0), because Vite 8 needs 20.19 or
newer and build images default to something older.

`public/_headers` is the only Cloudflare-specific file in the repo.

Worth knowing if you are tempted to move it: Vercel's free Hobby plan does not
permit this site. Its [fair use
guidelines](https://vercel.com/docs/limits/fair-use-guidelines) restrict Hobby
to non-commercial personal use and name "advertising the sale of a product or
service" as commercial, which is what a company hub pointing at Glaux Ledger
is. That would be Pro at $20/month. Cloudflare Pages and Netlify both allow
commercial use on their free tiers.

### Headers

`public/_headers` ships to `dist/_headers`, which Cloudflare Pages reads at the
build output root. It sets a year of immutable caching on the fingerprinted
`/assets/*`, forbids caching the HTML that names those fingerprints, and adds
the usual security headers plus a CSP.

The CSP needs `'unsafe-inline'` for the critical background style and JSON-LD.
Fonts and images are self-hosted, and every network-capable directive remains
restricted to the site origin. Nothing on the site compiles WebAssembly or
starts a worker, so neither is allowed. The header set also includes HSTS,
frame denial, MIME sniffing protection, and a restrictive permissions policy.

`vite preview` does not apply `_headers`, so a policy that is too tight would
only show up after a deploy. The e2e suite therefore reads the policy out of
`public/_headers`, attaches it to each page by hand, and fails if the browser
refuses anything.

### DNS

The apex `useglaux.com` points at Pages. Leave the `ledger` record alone: each
product is a separate deployment, and they only share a domain with this site.

## The logo

The artwork lives in `logo/` as SVG and is the one source for every place the
brand appears. Nothing is redrawn by hand anywhere else.

| File                              | What it is                                                      |
| --------------------------------- | --------------------------------------------------------------- |
| `logo/glaux-mark.svg`             | The emblem on its dark rounded tile                             |
| `logo/glaux-mark-transparent.svg` | The emblem alone: owl, calibration ring, degree marks           |
| `logo/glaux-logo.svg`             | Stacked lockup: emblem, wordmark, tagline, the four principles  |
| `logo/glaux-logo-horizontal.svg`  | Horizontal lockup: emblem, wordmark, mission line, product list |

On the page the emblem is a set of React components in `src/components/`,
ported from `glaux-mark-transparent.svg` with every path, radius and colour
kept. Only the ring's tick marks are generated, because the artwork lays them
out on exact angles. The port was checked against the source by rendering both
and comparing pixels. They are inline SVG rather than an image so the logo is
in the first paint, stays sharp at any size, and can have its irises moved.

| File                    | Role                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| `brand/owlArt.tsx`      | The owl head and its gradients, in the artwork's own coordinates    |
| `brand/GlauxMark.tsx`   | The full emblem: the owl inside its ring, ticks and degree labels   |
| `brand/GlauxGlyph.tsx`  | The owl head alone, cropped tight, for the header and the footer    |
| `brand/degreeLabels.ts` | The 0°, −90° and +90° lettering, as outlines                        |
| `brand/artId.ts`        | A unique id per instance, so two logos on a page share no gradients |
| `HeroMark.tsx`          | The hero's stage: the emblem, two orbits, the glow, the gaze        |
| `SiteHeader.tsx`        | The header every page shares, and its menu on a phone               |
| `Footer.tsx`            | The footer every page shares, in a full and a compact length        |

The glyph asks `owlArt` for `detail="compact"`, which leaves out the sensor
ticks and hairline rings inside the eyes and the secondary glints. At header
size they cannot be resolved and only grey the gold of the iris. That is the
only liberty taken with the artwork.

`scripts/generate-og.mjs` reads `glaux-mark.svg` and
`glaux-logo-horizontal.svg` and writes everything a browser or another site
asks for by URL. It runs as `npm run assets` and before every build.

| Output                 | Made from                                                    |
| ---------------------- | ------------------------------------------------------------ |
| `favicon.svg`          | The owl head on the tile, without the ring it cannot resolve |
| `favicon-32.png`       | The same, for browsers that do not take an SVG icon          |
| `apple-touch-icon.png` | The tile mark, squared off, at 180px                         |
| `brand-icon-512.png`   | The tile mark as supplied                                    |
| `og-image.png`         | The horizontal lockup, as a 1200×630 card                    |
| `og-akuru.png`         | The Glaux Akuru card, signed with the owl and the wordmark   |

The lockup's last line, `LEDGER · AKURU · MARKETS · AGRO`, is left off the
share card. It sets the two products that are still in development beside the
two that ship, and a card travels without the page that says which is which.

### The hero

The hero is the logo's own lockup, at page scale: the emblem, then the three
lines the lockups set with it. The wordmark, the tagline under its diamond
("Risk-first intelligence systems") and the mission line ("Instruments for
reading risk before it matters.") are one `<h1>`, styled apart. The four words
the stacked lockup sets beneath itself sit under the emblem, and they are the
four principles further down the page.

**The emblem is never animated.** A logo that drifts or wobbles stops being
the logo, so it is drawn exactly as supplied and held still. What moves is
around it and inside its eyes:

- Two graduated orbits turn around it in opposite directions, one every three
  minutes and one every five.
- The glow behind the owl breathes on a nine-second cycle and each eye pulses.
- On a device with a mouse the irises lean a few units towards the pointer.
- The wordmark takes a single glint as the page arrives, then holds still.

The orbits, the glow and the eyes are `transform` or `opacity` on their own
layers, so the compositor carries them and the main thread is idle while the
page sits open. They pause when the hero scrolls out of view. The irises are
only redrawn while the pointer is moving. Under `prefers-reduced-motion` none
of it runs: the hero is simply there, complete.

**CSS places the emblem and sizes it.** `.hero__art` is a size container, and
the stage inside it is sized against that cell rather than the viewport:
`min(100cqw / --fit-w, 100cqh / --fit-h, --stage-max)`. The two `--fit`
numbers say how much of the stage has to stay inside the cell, across and
down, which is what lets the orbits run off a phone's edges while the emblem
and its degree labels never do. So a breakpoint is three custom properties,
and no script measures anything.

**Stacked, or split.** The emblem sits above the copy on a phone and on a
tablet held upright, and takes whatever height the copy leaves it. On a screen
at least 980px wide that is wider than it is tall, the copy takes the spine
and the emblem its own column to the right. A phone on its side gets the split
too: stacked, the emblem alone would fill the screen.

### The header

One header on every page: the logo on the spine, the page's links, one quiet
action. It is always on screen, bare over the top of a page and solid once the
page has moved, so the brand and the way around are never more than a glance
away. Below 900px the links fold into a full-screen menu instead of
disappearing. While that menu is open the page behind it is `inert` and does
not scroll, Escape closes it and returns focus to the button, and choosing a
link closes it and travels there.

## Performance

The hero used to be a WebGL scene behind a static poster. It is now vector
artwork in the document, which is where most of the numbers below come from.

- [x] **No 3D or animation library.** A visit to the home page downloads about
      74 kB of JavaScript gzipped. With the WebGL hero it was about 350 kB.
- [x] **Idle is idle.** With the page open and untouched the main thread is at
      rest. The WebGL hero drew a new frame on every tick for as long as it
      was on screen.
- [x] **Continuous motion is compositor-only.** Everything that loops is
      `transform` or `opacity` on its own layer. The one painted animation
      is the wordmark's glint, and it runs once.
- [x] **Offscreen pauses the stage**: an `IntersectionObserver` sets
      `data-paused`, which stops every animation on it.
- [x] **`prefers-reduced-motion` gets a still page**, with no reveal
      animations and nothing left hidden.
- [x] **Reveals never hide content by default.** `<Reveal>` marks a block as
      pending only after the page has painted, and only if the block is
      below the fold. If the observer never runs, or the page is printed,
      everything is visible.
- [x] **Scroll and pointer stay out of React.** Reading progress is one
      custom property written in a frame callback and the irises are moved
      by attribute. The header re-renders only when it changes state: bare
      to solid, or a new section under the reader.
- [x] **The display font is preloaded.** Marcellus sets the wordmark and
      every heading, so the HTML names it and it downloads alongside the
      script instead of after the stylesheet has been parsed. On the home
      page it is there for the first paint.
- [x] **No backdrop blur.** The header is opaque, so scrolling does not
      re-blur the page under it on every frame.
- [x] **No image requests for the hero**, and no HDRI, texture or model.

### Rough budget

| Asset                                       | Raw    | Gzip  | When                           |
| ------------------------------------------- | ------ | ----- | ------------------------------ |
| `react-vendor`                              | 190 kB | 60 kB | Every page, cached across them |
| `app`: header, footer, logo art, shared CSS | 58 kB  | 16 kB | Every page, cached across them |
| `home`                                      | 20 kB  | 6 kB  | Home                           |
| `scrollTo`                                  | 2 kB   | 1 kB  | Home, `/akuru/`                |
| `akuru` and its CSS                         | 21 kB  | 7 kB  | `/akuru/`                      |
| `legal` and its CSS                         | 9 kB   | 4 kB  | Terms, Privacy                 |
| Marcellus                                   | 15 kB  | n/a   | Preloaded                      |
| Schibsted Grotesk ×3, Spline Sans Mono ×2   | 100 kB | n/a   | When text first uses each one  |

Measured against the previous build in headless Chromium throttled to
Lighthouse's phone profile (1.6 Mbps, 150 ms round trip, CPU slowed four
times): the home page's largest paint moved from about 1.9 s to 1.3 s. First
paint moved the other way, from about 0.5 s to 0.65 s: the display font is now
fetched before the first paint rather than after it, which costs about a tenth
of a second, and the emblem is more to draw than the old poster was. The Akuru
page took on the shared header, footer and logo: its largest paint is
unchanged at about 1.6 s and its first paint moved from about 0.55 s to 0.7 s.

Every page still needs its script before anything paints. Prerendering the
markup at build time would take the script off that path and is the obvious
next step.

## Accessibility

Semantic `header`/`main`/`section`/`footer`, one `h1` carrying the wordmark,
the tagline and the headline, no skipped heading levels, a skip link, gold
`:focus-visible` outlines from the design tokens, and a `prefers-contrast:
more` branch that firms up hairlines and lifts secondary text. The hero
artwork is decorative and `aria-hidden`; every word on the page is present and
readable without it. A product that is not out yet is plain text with its
status beside it, never a link, in the catalogue and in the footer alike. The
e2e suite runs axe against the home and Akuru pages.

## Design system

Foundations are ported from Glaux Markets so the two properties read as one
brand. Its components are not.

Sharing the palette, the type and the motion curves is what makes the hub and
the products feel like one company. Sharing Markets' chrome (surface-filled
panels, blurred glass, chips, a pulsing live pill) made the company page look
like a screenshot of its own dashboard. So products are hairline rows rather
than cards, facets are a mono spec line rather than pills, the nav is opaque
rather than frosted, and the page carries exactly one filled button: the hero's
"Open Glaux Ledger" (on the Akuru page, "Download for Windows"). Everything else
is a rule-and-arrow link, which is what keeps that one gold rectangle meaning
something.

The catalogue is in two parts that cannot be mistaken for each other. What can
be opened today is set as full rows, each with its way in, under "Available
now". What is still being built is set smaller and quieter under "Not yet
released", keeps its own status, and is never a link.

The marker in front of every label is the logo's calibration diamond: the gold
lozenge that marks the cardinal points of its ring.

- `src/styles/tokens.css`: the Nyx palette (`--nyx #070b12`, `--gleam
#e9b45c`, `--verdigris #45b98e`, `--ember #d85f55`), type scale, motion
  curves, radii, elevation. Trading-specific tokens, glass and status tints
  are omitted.
- `src/styles/base.css`: reset, the body radial-gradient atmosphere,
  typography, skip link, reduced-motion branch.
- `src/styles/app.css`: the shell and its spine, section rhythm, actions, the
  site header, the hero composition, the product catalogue, the footer.

Type: Marcellus (display) · Schibsted Grotesk (body) · Spline Sans Mono
(labels). Exact weights are bundled from `@fontsource`, fingerprinted by Vite,
and served from the same origin.

### One measure, and what happens past it

`--shell-max` is the site's only measure. The header, the hero, every section
and the footer share it on every page, so the spine the copy starts on is one
unbroken vertical from the logo in the header to the logo in the footer. The
hero and the nav used to run to a wider stage, which on anything past 1920px
left them hugging the screen edge above a column floating in the middle of the
display.

Above 1700px the fractional columns stop being fractions. A rail set to 42% of
the width keeps taking 42% of a 34" screen, so the eyebrow ends up holding a
third of the page and the title is marooned in the middle of it. Each one is
capped in `rem`, which means the layout holds its proportions against the type
ramp rather than the viewport. Past 2000px the root size steps up in
percentages (so a reader's own font size still multiplies it) and `--shell-max`
opens with it: the page scales rather than stretching.

The catalogue re-columns there too. The spec line leaves the description and
takes the right edge of the row, so each row is anchored at both ends of its
hairline instead of trailing off into half a screen of empty width, and the
section head above adopts the same four columns: eyebrow on the spine, title
where product names start, lead where their descriptions do.

### In-page navigation

`scroll-behavior: smooth` is still the fallback, but the anchors are animated
in `src/lib/scrollTo.ts`. The CSS property gives every jump the same duration
and a near-linear curve, so a nudge to the next section and a jump from the
footer to the top feel equally mechanical. Distance sets the duration there,
the page eases on the shared `--ease-out` curve, and a wheel, a drag or a key
press abandons the animation on the spot. The target takes focus so Tab
continues from where the page landed, which is what the browser would have done
had the anchor not been intercepted. The skip link is deliberately excluded: it
has to land instantly.

The atmosphere behind all of it is a fixed layer rather than a fixed background
attachment. An attached background is repainted across the whole document on
every scroll frame, and on a large display that is what made the page feel
heavy under the hand.

## SEO

Title, description, canonical, OG and Twitter cards, and an `Organization` +
`WebSite` JSON-LD graph that names the Glaux products as brands, all in
`index.html`. `public/robots.txt` and `public/sitemap.xml` are static.
`npm run build` regenerates `public/favicon.svg`, `favicon-32.png`,
`og-image.png`, `og-akuru.png`, `brand-icon-512.png`, and
`apple-touch-icon.png` from `logo/` before Vite runs. Commit the generated
files so previews and non-build consumers have the same assets.
`akuru/index.html` carries its own cards and a `SoftwareApplication` JSON-LD.

## Glaux Akuru downloads

`/akuru/` is the download page for the Glaux Akuru Windows app (`akuru/index.html`,
`src/akuru/`, `src/styles/akuru.css`). The app itself lives in its own repo; there is
no web version of it.

The installers are about 100 MB, and Cloudflare Pages refuses files over 25 MiB, so
they live in the R2 bucket `glaux-downloads` under `akuru/`, served from the bucket's
custom domain `downloads.useglaux.com`. The page reads the version, file names, sizes
and SHA-256 sums from `src/akuru/release.json`, which the app's `pnpm release` writes.

To publish a version: in the app repo run `pnpm dist:win` and `pnpm release`, run the
two `wrangler r2 object put` commands it prints, copy its `dist/release.json` over
`src/akuru/release.json` here, and deploy. Upload first: the page links to the new
files as soon as it is live. Old versions can stay in the bucket.

`public/akuru/editor.webp` is a real screenshot of the app's editor (dark theme,
1600 px wide). Retake it when the editor changes visibly.

## Legal

Glaux publishes analytical intelligence only. Nothing on this site or in any
Glaux product is financial, investment or trading advice. The footer carries
the full disclaimer and links to first-party `/terms/` and `/privacy/` pages.
Those documents are a plain-language operational draft and require review by
qualified counsel before they are treated as final legal advice.
