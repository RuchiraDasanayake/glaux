import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * React gets a named chunk of its own. All four pages share it, so it is
 * fetched once and then served from cache as a visitor moves between them.
 */
const chunkFor = (id: string): string | undefined => {
  if (!id.includes("node_modules")) return undefined;
  if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react-vendor";
  return undefined;
};

/**
 * Preloads fonts the first screen of every page is set in.
 *
 * A font is otherwise only discovered once the stylesheet has arrived and
 * the first layout has asked for it, which on a slow connection is when the
 * wordmark and the headline visibly swap typeface. Naming the file in the
 * HTML starts it downloading alongside the stylesheet instead.
 *
 * Vite fingerprints the files, so the names are read from the finished
 * bundle. A pattern that matches nothing fails the build: silently losing a
 * preload is exactly the kind of regression nobody notices.
 */
function preloadFonts(fonts: readonly RegExp[]): Plugin {
  return {
    name: "glaux:preload-fonts",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, context) {
        const files = Object.keys(context.bundle ?? {});
        return fonts.map((font) => {
          const file = files.find((name) => font.test(name));
          if (!file) throw new Error(`preloadFonts: no bundled font matches ${font}`);
          return {
            tag: "link",
            attrs: {
              rel: "preload",
              as: "font",
              type: "font/woff2",
              href: `/${file}`,
              crossorigin: true,
            },
            // After the charset declaration, which has to stay first.
            injectTo: "head" as const,
          };
        });
      },
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    // Marcellus only: it sets the wordmark and every heading, where a late
    // swap is a visible jolt. A preload competes with the scripts for
    // bandwidth, so the body and label fonts are left to arrive on their
    // own. Measured on a throttled phone, preloading the body font as well
    // held first paint back by another 60 ms and its swap still came after.
    preloadFonts([/marcellus-latin-400-normal.*\.woff2$/]),
  ],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        terms: resolve(import.meta.dirname, "terms/index.html"),
        privacy: resolve(import.meta.dirname, "privacy/index.html"),
        akuru: resolve(import.meta.dirname, "akuru/index.html"),
      },
      output: { manualChunks: chunkFor },
    },
  },
});
