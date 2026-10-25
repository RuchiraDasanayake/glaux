/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LEDGER_URL?: string;
  /** When set, the hero loads this glTF/GLB instead of the procedural owl. */
  readonly VITE_OWL_MODEL_URL?: string;
  /** Where the Glaux Akuru installers are served from (the R2 bucket's public origin and prefix). */
  readonly VITE_AKURU_DOWNLOADS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
