import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * three gets a named chunk of its own so the build output is legible; it is
 * still fetched only via the lazily imported hero canvas.
 *
 * @react-three and three-stdlib are deliberately NOT pinned. Left to
 * automatic splitting, the glTF/Draco/Meshopt loaders land in the OwlModel
 * chunk, which is dormant unless VITE_OWL_MODEL_URL is set. Pinning them by
 * name drags roughly 70 kB of decoder machinery into the chunk that every
 * visitor with WebGL downloads, and pinning fiber specifically also pulls
 * three back out of its own chunk and into the combined one.
 *
 * The consequence is that the shared fiber/drei chunk takes its name from
 * owlGeometry, the first-party module both hero entry points import. The name
 * is cosmetic; the split is the point.
 */
const chunkFor = (id: string): string | undefined => {
  if (!id.includes("node_modules")) return undefined;
  if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) return "three";
  if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react-vendor";
  return undefined;
};

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
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
