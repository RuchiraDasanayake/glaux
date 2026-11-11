import Reveal from "./Reveal";

/**
 * A product that cannot be opened yet: the same facts as a row, set smaller
 * and quieter, and never a link. There is nothing to click because there is
 * nothing to open, and the entry says so in its own status line rather than
 * leaving it to be inferred from a missing button.
 */
export default function ProductNote({
  index,
  name,
  status,
  tagline,
  body,
  facets = [],
  future = false,
  delay = 0,
}: {
  index: number;
  name: string;
  status: string;
  tagline?: string;
  body: string;
  facets?: readonly string[];
  /** The open slot at the end of the list, which is not a product at all. */
  future?: boolean;
  delay?: number;
}) {
  return (
    <Reveal
      as="li"
      className={`product product--note ${future ? "product--future" : "product--pending"}`}
      delay={delay}
    >
      <div className="product__meta">
        <span className="product__index">{String(index + 1).padStart(2, "0")}</span>
        <span className="product__status">{status}</span>
      </div>

      <div className="product__head">
        <h3 className="product__name">{name}</h3>
        {tagline && <p className="product__tagline">{tagline}</p>}
      </div>

      <p className="product__text">{body}</p>

      {facets.length > 0 && (
        <ul className="product__facets">
          {facets.map((facet) => (
            <li key={facet}>{facet}</li>
          ))}
        </ul>
      )}
    </Reveal>
  );
}
