import { useId } from "react";

/**
 * A document-unique prefix for the gradients inside one drawing of the mark.
 *
 * The header, the footer and the hero can each draw the owl on the same page.
 * SVG paints reference their gradients by id, and an id must be unique in the
 * document, so every instance carries its own set under its own prefix.
 */
export function useArtId(): string {
  return `glaux${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}
