# Glaux | useglaux.com

The company site for Glaux: the parent-brand hub that explains what Glaux is
and routes people to the products. A single page, dark-only, anchored on a
lazily-loaded 3D owl that is the `OwlMark` brand SVG given depth, plus the
download page for the Glaux Akuru Windows app at `/akuru/`.

The page is built on one left spine. Copy starts on it in every section, the
hero splits copy left against the owl right, and nothing is centred. A
centred hero over left-aligned sections is the shape of a template, and this
is meant to read as a research group rather than a landing page.

Products it points at:

- **Glaux Ledger**: [ledger.useglaux.com](https://ledger.useglaux.com) (live)
- **Glaux Akuru**: [useglaux.com/akuru](https://useglaux.com/akuru/) (live; a Windows app, downloaded
  from its page here)
- **Glaux Markets**: in development
- **Glaux Agro**: in development

## Stack

React 19 · TypeScript 5.9 · Vite 8 · three 0.185 with
`@react-three/fiber` + `@react-three/drei` · Framer Motion 12 · plain CSS
custom properties (no Tailwind).

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
| `npm run assets`       | Re-render the social card and square brand icons       |

### Environment

Everything has a working default; `.env` is optional. See `.env.example`.

| Variable               | Default                                | Purpose                                       |
| ---------------------- | -------------------------------------- | --------------------------------------------- |
| `VITE_LEDGER_URL`      | `https://ledger.useglaux.com`          | Product origin used by every Ledger link      |
| `VITE_AKURU_DOWNLOADS` | `https://downloads.useglaux.com/akuru` | Where the Glaux Akuru installers are served   |
| `VITE_OWL_MODEL_URL`   | _(unset)_                              | Load a glTF/GLB instead of the procedural owl |

## Deployment

A static upload of `dist/`. There is no server code, no API route, no
Cloudflare Worker, no Wrangler config, and no Pages Functions — only static
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
restricted to the site origin. `'wasm-unsafe-eval'` and `worker-src blob:` are
limited to the optional local Meshopt model decoder. The header set also
includes HSTS, frame denial, MIME sniffing protection, and a restrictive
permissions policy.

### DNS

The apex `useglaux.com` points at Pages. Leave the `ledger` record alone: each
product is a separate deployment, and they only share a domain with this site.

## The hero owl

The owl is generated from three.js primitives, not downloaded. It is a
deliberate 3D port of `src/components/OwlMark.tsx`, sharing its measurements:
eyes at ±5.5 SVG units with r=4.2 circles and r=1.7 irises, and the brow path
`M5.5 11.5 Q10.5 7 16 11.5 Q21.5 7 26.5 11.5` swept as a tube. The mark's
colouring carries over too: steel brow and bezels, gold only in the irises.

| File                     | Role                                                      |
| ------------------------ | --------------------------------------------------------- |
| `hero/owlGeometry.ts`    | Lathe profiles, the SVG→3D brow curve, generated textures |
| `hero/ProceduralOwl.tsx` | The owl itself, under 10k triangles                       |
| `hero/Reticle.tsx`       | The graduated instrument ring, one billboard              |
| `hero/OwlScene.tsx`      | Lighting rig, framing, and the pointer signal             |
| `hero/gaze.ts`           | The one thing everything reacting to the pointer reads    |
| `hero/Hero3D.tsx`        | Canvas, DPR cap, frame-loop gating, `PerformanceMonitor`  |
| `hero/HeroPoster.tsx`    | The CSS/SVG fallback and LCP element                      |
| `hero/OwlModel.tsx`      | Dormant glTF slot                                         |

### It watches you

The owl is the only thing on the page that answers back, so the interaction is
the reason it earns a WebGL context at all. Everything below is skipped
entirely under `prefers-reduced-motion`, which never mounts the canvas.

The head turns to the pointer and the irises lead the turn; the eyes warm as
you come near; the graduated ring creeps round and gains a little when you
approach; the eyes blink on a random gap of four to ten seconds; and behind all
of it a gold rim light orbits, the body breathes, and the head drifts when
there is nothing to look at. Scrolling past the hero tips the owl forward and
cools the gaze, so it stops competing with the copy below it.

Four things make that read as a bird rather than a gadget:

**The head turns; the body does not.** Everything above the neck sits on its
own pivot inside `ProceduralOwl`, nested so it rotates about the head's own
centre. Turning the whole owl instead swings the head through an arc and pulls
it off the reticle it is supposed to sit inside. An owl holding its body
still while its head tracks you is the single most recognisable thing the
animal does. The yaw is capped near twenty degrees: past that the facial disc
goes three-quarter, the far eye slides behind the skull's rim, and the brand
mark stops being legible as the mark.

**The pointer is measured from the owl, not from the viewport.** The owl sits
off to one side of a split hero, so a pointer over the headline is well to its
left while still near the middle of the screen. `OwlScene` takes the offset
from the measured slot, damps it once, and publishes it as the `Gaze`. Head,
irises and reticle all move off that one signal and so stay in step. A useful
side effect: before you touch the mouse the owl is already looking at the
wordmark.

**Nothing here re-renders React.** The pointer, the scroll position and the
gaze are all refs read inside the frame loop. The per-frame cost is a handful
of lerps and four writes to object transforms.

**The camera keeps out of the way.** It still drifts with the pointer, but at
roughly half its old amplitude. The camera and the head now pull the same
direction so the two summed; worse, the reticle sits behind the head, so
camera drift slides the ring off the face it frames. What is left is enough
for depth and not enough to break the composition.

On touch screens `usePointerVector` reports `tracking: false` rather than a
position of zero, and the owl falls back to its idle drift. Without that flag a
phone reads as a pointer parked in the middle of the screen and the owl holds
one slightly askew pose for as long as the page is open.

### Four decisions worth knowing before you change it

**CSS places the owl; the scene obeys.** The hero renders an empty
`.hero__slot` div wherever the layout wants the subject: a right-hand column
on the split, a full-width band above the copy when stacked. `useElementBox`
measures it and `OwlScene` fits the reticle-to-chin box inside whatever
rectangle comes back. So the composition lives in one place, in the same media
queries as everything else, and adding a breakpoint needs no camera maths.

**The owl is placed by shifting the lens, not by moving the owl.** `OwlScene`
keeps the group on the camera's axis and calls `camera.setViewOffset` to slide
the whole frustum. Translating the group sideways instead puts it off-axis,
which opens perspective parallax between the head and the reticle behind it.
The ring visibly drifts off-centre, and the face turns three-quarter. The
reticle's own depth is kept shallow (`Reticle.tsx`, `DEPTH`) for the same
reason: set further back it shrinks against the face in front of it and
disappears behind the head once the owl is scaled up.

**The head must stay the widest mass, and the body must stay behind it.** The
first pass had a body wider than the head and read as an egg with a face on it.
Every radius in `owlGeometry.ts` keeps the body's widest point inside the head
radius. The chest is also flattened in z (`BODY_DEPTH_SCALE`) and seated below
the head (`BODY_DROP`): the skull's front curves away sharply at its rim, so
where the two overlap without the drop the chest wins the depth test and lays a
bib across the lower face.

**The body dissolves in its own shader, not under a CSS scrim.** `withHeightFade`
in `ProceduralOwl.tsx` patches the body material to mix toward `--nyx` as it
descends, and again at grazing angles so the sides melt rather than ending on a
cut-out edge. The band closes above the torso's widest point: the body is
already close to the background in value, so what reads is the sheen along its
shoulders, and half-fading a sheen still leaves a sheen. A scrim over the canvas
cannot do this job either. The copy moves with the viewport and the owl does
not, so a scrim tuned on a 16:9 desktop leaves a hard silhouette on a tablet.

### Dropping in an authored model

Export a Meshopt-compressed `.glb`, put it in `public/models/`, and
set `VITE_OWL_MODEL_URL=/models/owl.glb`. The loader recentres and rescales it
to the procedural owl's height, so the framing holds. Full constraints are in
[`public/models/README.md`](public/models/README.md).

## Performance

### What the hero actually does

```
First paint          wordmark, headline, CTAs, HeroPoster  (no JS needed for layout)
  ↓ requestIdleCallback
Probe                WebGL available?  reduced motion?  device tier?
  ↓ any check fails                    ↓ all pass
Keep the poster                        React.lazy(Hero3D) → Canvas
                                         ↓
                                       PerformanceMonitor: drop DPR, then
                                       freeze the rim sweep, on decline
```

The poster is markup and CSS, so it costs nothing beyond the HTML, scales
perfectly, and is the LCP element on every single load. The canvas fades in
over it once two real frames have rendered.

### Checklist

- [x] **3D never blocks FCP**: `React.lazy` behind `requestIdleCallback`.
- [x] **three is out of the initial payload**: it lands in its own `three`
      chunk, reachable only through the lazy hero. Initial JS is
      `home` + `react-vendor` + shared runtime ≈ 93 kB gzipped.
- [x] **The glTF path costs nothing when unused**: `@react-three` and
      `three-stdlib` are deliberately not pinned to a manual chunk, so the
      Meshopt/GLTF loaders land in the `OwlModel`
      chunk, which is never requested unless `VITE_OWL_MODEL_URL` is set.
- [x] **Framer Motion is loaded through `LazyMotion` + `m`**, not the full
      `motion` bundle.
- [x] **DPR is capped** at 1.75 on desktop and 1.25 on mid devices, and never
      exceeds the display's own ratio.
- [x] **Offscreen and hidden pause the loop**: `frameloop="never"` driven by
      an `IntersectionObserver` on the hero plus `visibilitychange`.
- [x] **Phones get the poster**: coarse pointer under 768px, plus anything
      reporting ≤2 cores or ≤2 GB.
- [x] **`prefers-reduced-motion` gets the poster** and no reveal animations.
- [x] **No WebGL gets the poster**, with full content parity.
- [x] **No post-processing.** The gleam is emissive irises and additive
      sprites; there is no bloom pass and no particle field.
- [x] **No HDRI fetch**: reflections come from inline drei `<Lightformer>`
      shapes rendered once (`frames={1}`).
- [x] **No shadow maps.** Depth reads from the rim sweep and the fog.
- [x] **Scroll and pointer never re-render React**: both write to refs that
      the frame loop reads.
- [x] **Two generated textures**, 128px and 512px, drawn to a canvas at
      runtime. No image requests for the hero.

### Rough budget

| Chunk                                     | Raw     | Gzip   | When                                |
| ----------------------------------------- | ------- | ------ | ----------------------------------- |
| Home, React, shared runtime, and app CSS  | ~304 kB | ~98 kB | Initial                             |
| `three`                                   | 725 kB  | 185 kB | After idle, if the hero qualifies   |
| `Hero3D` + procedural geometry/fiber/drei | 224 kB  | 74 kB  | With the above                      |
| `OwlModel`                                | 72 kB   | 21 kB  | Only if `VITE_OWL_MODEL_URL` is set |

## Accessibility

Semantic `header`/`main`/`section`/`footer`, one `h1` carrying both the
wordmark and the headline, no skipped heading levels, a skip link, gold
`:focus-visible` outlines from the design tokens, and a `prefers-contrast:
more` branch that firms up hairlines and lifts secondary text. The canvas is
decorative and `pointer-events: none`; every word on the page is present and
readable with it absent.

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

- `src/styles/tokens.css`: the Nyx palette (`--nyx #070b12`, `--gleam
#e9b45c`, `--verdigris #45b98e`, `--ember #d85f55`), type scale, motion
  curves, radii, elevation. Trading-specific tokens, glass and status tints
  are omitted.
- `src/styles/base.css`: reset, the body radial-gradient atmosphere,
  typography, skip link, reduced-motion branch.
- `src/styles/app.css`: the shell and its spine, section rhythm, actions, the
  product catalogue, hero composition.

Type: Marcellus (display) · Schibsted Grotesk (body) · Spline Sans Mono
(labels). Exact weights are bundled from `@fontsource`, fingerprinted by Vite,
and served from the same origin.

### One measure, and what happens past it

`--shell-max` is the page's only measure. The nav, the hero and every section
share it, so the spine the copy starts on is one unbroken vertical from the
wordmark to the footer. The hero and the nav used to run to a wider stage,
which on anything past 1920px left them hugging the screen edge above a column
floating in the middle of the display.

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
`npm run build` regenerates `public/og-image.png`, `og-akuru.png`,
`brand-icon-512.png`, and `apple-touch-icon.png` before Vite runs. Commit the
generated files so previews and non-build consumers have the same assets.
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
