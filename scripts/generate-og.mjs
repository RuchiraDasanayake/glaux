/**
 * Renders the favicon, the app icons and the social cards from the logo
 * artwork in `logo/`.
 *
 * The logo files are the source of truth and are read, never redrawn: every
 * icon and card below is that artwork recomposed for a different frame. Its
 * lettering is outlined to paths, so the brand renders identically on any
 * machine with no font installed. Only the Glaux Akuru card still sets live
 * text, in generic stacks that resolve wherever it is built.
 *
 * The output is committed, so it only has to render correctly once.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(HERE, "../public");
const LOGO = resolve(HERE, "../logo");

const WIDTH = 1200;
const HEIGHT = 630;

/* ----------------------------------------------------------------------
   Reading the artwork. Each helper fails loudly: if the logo files are ever
   re-exported with a different structure, the build should stop here rather
   than ship an icon with a piece missing.
   ---------------------------------------------------------------------- */

function fail(message) {
  throw new Error(`generate-og: ${message}`);
}

function indexOfOrFail(source, needle, label, from = 0) {
  const index = source.indexOf(needle, from);
  if (index < 0) fail(`could not find ${label} in the logo artwork`);
  return index;
}

/** `source` with exactly `count` occurrences of `pattern` replaced. */
function replaceExactly(source, pattern, replacement, count, label) {
  const found = source.match(pattern)?.length ?? 0;
  if (found !== count) fail(`expected ${count} × ${label}, found ${found}`);
  return source.replace(pattern, replacement);
}

/** The gradient definitions every variant of the logo shares. */
function defsOf(svg) {
  const start = indexOfOrFail(svg, "<defs>", "<defs>");
  const end = indexOfOrFail(svg, "</defs>", "</defs>", start);
  return svg.slice(start, end + "</defs>".length);
}

/**
 * The owl without its astrolabe ring: everything from the shield backing to
 * the beak, in the artwork's own coordinates (the owl spans x 176–824 and
 * y 214–802, with its eyes on y 410).
 */
function owlHeadOf(markSvg) {
  const backing = indexOfOrFail(markSvg, "DARK ARMORED SHIELD BACKING", "the owl's shield backing");
  const start = markSvg.lastIndexOf("<!--", backing);
  const beak = indexOfOrFail(markSvg, 'id="faceted-diamond-beak"', "the owl's beak", backing);
  const end = indexOfOrFail(markSvg, "</g>", "the end of the beak group", beak);
  if (start < 0) fail("could not find the start of the owl in the logo artwork");
  return markSvg.slice(start, end + "</g>".length);
}

/**
 * Drops the sensor ticks and hairline rings inside the eyes. Below about
 * 64px they cannot be resolved and only grey the gold of the iris.
 */
function withoutEyeReticles(owlHead) {
  return replaceExactly(
    owlHead,
    /<!-- Concentric Gold Sensor Reticle Rings -->[\s\S]*?(?=<!-- Intense Glowing Amber-Gold Iris -->)/g,
    "",
    2,
    "eye reticle",
  );
}

/** Comments and layout whitespace out, for the one SVG that ships as a file. */
function minify(svg) {
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/> </g, "><")
    .replace(/" \/>/g, '"/>')
    .replace(/d=" /g, 'd="')
    .replace(/ "/g, '"')
    .trim();
}

/** Bounding box of an outlined-text path (absolute M/L/H/V/Q/C/Z only). */
function pathBox(d) {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let command = "";
  let x = 0;
  let y = 0;
  let i = 0;
  const next = () => Number(tokens[i++]);
  const mark = (px, py) => {
    minX = Math.min(minX, px);
    maxX = Math.max(maxX, px);
    minY = Math.min(minY, py);
    maxY = Math.max(maxY, py);
  };

  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) command = tokens[i++];
    if (command === "Z" || command === "z") continue;
    const points = { M: 1, L: 1, Q: 2, C: 3 }[command];
    if (points) {
      for (let p = 0; p < points; p += 1) {
        x = next();
        y = next();
        mark(x, y);
      }
    } else if (command === "H") {
      x = next();
      mark(x, y);
    } else if (command === "V") {
      y = next();
      mark(x, y);
    } else {
      fail(`unsupported path command "${command}" in the logo lettering`);
    }
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

const [markSvg, horizontalSvg] = await Promise.all([
  readFile(resolve(LOGO, "glaux-mark.svg"), "utf8"),
  readFile(resolve(LOGO, "glaux-logo-horizontal.svg"), "utf8"),
]);

const defs = defsOf(markSvg);
const owlHead = owlHeadOf(markSvg);

/* ----------------------------------------------------------------------
   The horizontal lockup, taken apart: spine, emblem and divider as drawn,
   then its three lines of lettering.
   ---------------------------------------------------------------------- */

const lockupStart = indexOfOrFail(
  horizontalSvg,
  "<!-- Left Spine Accent -->",
  "the lockup's spine",
);
const copyStart = indexOfOrFail(
  horizontalSvg,
  "<!-- Wordmark & Mission Copy -->",
  "the lockup's lettering",
  lockupStart,
);
const lockupArt = horizontalSvg.slice(lockupStart, copyStart);
const lettering = [...horizontalSvg.slice(copyStart).matchAll(/<path d="([^"]+)"([^>]*?)\/>/g)].map(
  (match) => ({ d: match[1], paint: match[2].trim(), box: pathBox(match[1]) }),
);
if (lettering.length !== 3) {
  fail(`expected the lockup to carry 3 lines of lettering, found ${lettering.length}`);
}
const [wordmark, mission] = lettering;

/* ----------------------------------------------------------------------
   Favicon. At tab size the ring is thinner than a pixel, so the tab icon is
   the owl alone on the logo's dark tile, as large as the tile allows. The
   owl is nudged below centre: it is all brow at the top and a single point
   at the bottom, so its weight sits higher than its bounding box does.
   ---------------------------------------------------------------------- */

const faviconSvg = minify(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  ${defs}
  <rect width="1000" height="1000" rx="220" fill="url(#nyxCanvas)"/>
  <rect width="1000" height="1000" rx="220" fill="url(#goldBackGlow)"/>
  <g transform="translate(500 512) scale(1.22) translate(-500 -508)">
    ${withoutEyeReticles(owlHead)}
  </g>
</svg>`);

/* ----------------------------------------------------------------------
   Home-screen icon. iOS rounds the corners itself, so the tile goes out
   square and without its inner keyline, which would otherwise sit inside
   the system's mask as a second, mismatched corner.
   ---------------------------------------------------------------------- */

const appleSvg = replaceExactly(
  replaceExactly(markSvg, / rx="210"/g, "", 2, "tile background"),
  /<rect x="12" y="12"[^>]*\/>/g,
  "",
  1,
  "tile keyline",
);

/* ----------------------------------------------------------------------
   Social card: the horizontal lockup on the page's own sky.

   The lockup's third line lists every product name, shipped or not. A share
   card is read as a statement of what exists, so the card carries the
   emblem, the wordmark and the mission line, and leaves the product list
   out. The two remaining lines are re-centred on the divider's diamond so
   the lockup stays balanced without it.
   ---------------------------------------------------------------------- */

const LOCKUP_SCALE = WIDTH / 1600;
const DIVIDER_DIAMOND_Y = 320;
const copyTop = wordmark.box.y;
const copyBottom = mission.box.y + mission.box.height;
const copyShift = DIVIDER_DIAMOND_Y - (copyTop + copyBottom) / 2;

const socialSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  ${defs}
  <radialGradient id="cardGlow" cx="22.5%" cy="50%" r="46%">
    <stop offset="0%" stop-color="#E9B45C" stop-opacity="0.22"/>
    <stop offset="100%" stop-color="#E9B45C" stop-opacity="0"/>
  </radialGradient>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#nyxCanvas)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#cardGlow)"/>
  <g transform="translate(0 ${(HEIGHT - 640 * LOCKUP_SCALE) / 2}) scale(${LOCKUP_SCALE})">
    ${lockupArt}
    <g transform="translate(0 ${copyShift.toFixed(2)})">
      <path d="${wordmark.d}" ${wordmark.paint}/>
      <path d="${mission.d}" ${mission.paint}/>
    </g>
  </g>
</svg>`;

/* ----------------------------------------------------------------------
   Glaux Akuru card. Latin text only: the build machine may have no Sinhala
   font, and a card of empty boxes is worse than none. The app icon and the
   Glaux signature in the corner are paths, so they render anywhere.
   ---------------------------------------------------------------------- */

const akuruIcon = (await readFile(resolve(PUBLIC, "akuru/icon.svg"), "utf8"))
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "");

// "By Glaux", signed bottom right: the owl, then the wordmark, both from the logo.
const SIGN_RIGHT = 1104;
const SIGN_Y = 560;
const SIGN_WORD_HEIGHT = 21;
const SIGN_OWL_HEIGHT = 50;
const wordScale = SIGN_WORD_HEIGHT / wordmark.box.height;
const wordWidth = wordmark.box.width * wordScale;
const owlScale = SIGN_OWL_HEIGHT / 588;
const owlWidth = 648 * owlScale;
const wordLeft = SIGN_RIGHT - wordWidth;
const owlLeft = wordLeft - 16 - owlWidth;

const akuruSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  ${defs}
  <defs>
    <radialGradient id="core" cx="30%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#0d1626"/>
      <stop offset="100%" stop-color="#070b12"/>
    </radialGradient>
    <radialGradient id="gleam" cx="92%" cy="-10%" r="70%">
      <stop offset="0%" stop-color="#e9b45c" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#e9b45c" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#core)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#gleam)"/>

  <svg x="96" y="104" width="128" height="128" viewBox="0 0 512 512">${akuruIcon}</svg>

  <text x="252" y="158" fill="#dce6f4"
        font-family="Marcellus, Georgia, 'Times New Roman', serif"
        font-size="44" letter-spacing="1">Glaux Akuru</text>
  <text x="254" y="206" fill="#7a8faf"
        font-family="'Spline Sans Mono', Consolas, monospace"
        font-size="18" letter-spacing="3.6">FREE WINDOWS APP</text>

  <text x="92" y="388" fill="#f4f8ff"
        font-family="Marcellus, Georgia, 'Times New Roman', serif"
        font-size="96">Sinhala, typed right.</text>

  <text x="96" y="458" fill="#8da0bc"
        font-family="'Schibsted Grotesk', 'Segoe UI', Helvetica, Arial, sans-serif"
        font-size="27">Singlish and Wijesekara typing, FM Abhaya to Unicode, whole Word files.</text>

  <line x1="96" y1="520" x2="1104" y2="520" stroke="#8da0bc" stroke-opacity="0.28"/>
  <text x="96" y="566" fill="#e9b45c"
        font-family="'Spline Sans Mono', Consolas, monospace"
        font-size="17" letter-spacing="4.6">USEGLAUX.COM/AKURU</text>

  <g transform="translate(${owlLeft.toFixed(2)} ${(SIGN_Y - SIGN_OWL_HEIGHT / 2).toFixed(2)}) scale(${owlScale.toFixed(5)}) translate(-176 -214)">
    ${withoutEyeReticles(owlHead)}
  </g>
  <g transform="translate(${wordLeft.toFixed(2)} ${(SIGN_Y - SIGN_WORD_HEIGHT / 2).toFixed(2)}) scale(${wordScale.toFixed(5)}) translate(${-wordmark.box.x} ${-wordmark.box.y})">
    <path d="${wordmark.d}" ${wordmark.paint}/>
  </g>
</svg>`;

await mkdir(PUBLIC, { recursive: true });

async function write(name, body, note) {
  const output = resolve(PUBLIC, name);
  await writeFile(output, body);
  console.log(`Wrote ${output} (${note}, ${(body.length / 1024).toFixed(1)} kB)`);
}

await write("favicon.svg", Buffer.from(`${faviconSvg}\n`), "vector");

const rasters = [
  ["og-image.png", socialSvg, WIDTH, HEIGHT],
  ["og-akuru.png", akuruSvg, WIDTH, HEIGHT],
  // The logo's own app tile, ring and all, where there is room to read it.
  ["brand-icon-512.png", markSvg, 512, 512],
  ["apple-touch-icon.png", appleSvg, 180, 180],
  // For browsers that do not take an SVG favicon.
  ["favicon-32.png", faviconSvg, 32, 32],
];

for (const [name, source, width, height] of rasters) {
  // Rendered at twice the target and scaled down, which keeps the hairlines
  // of the ring from breaking up at icon sizes.
  const density = Math.min(600, Math.max(72, Math.ceil((144 * width) / 1000)));
  const png = await sharp(Buffer.from(source), { density })
    .resize(width, height)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await write(name, png, `${width}x${height}`);
}
