import type { Product } from "../lib/brand";
import ArrowUpRight from "./ArrowUpRight";
import Reveal from "./Reveal";

/**
 * A product you can open today: a mono rail carrying its number and status,
 * the name, the description, the specification, and the way in.
 *
 * The parts are siblings rather than nested blocks because the row
 * re-columns as the screen widens: stacked on a phone, three columns on a
 * laptop, and on a wide display the spec moves out to the right edge so
 * the row uses the full measure its hairline draws.
 *
 * Deliberately not a card. Filled panels are how the Markets dashboard
 * presents data; borrowing them here made the company page look like a
 * screenshot of the product rather than the place it comes from.
 */
export default function ProductRow({
  product,
  index,
  delay = 0,
}: {
  product: Product;
  index: number;
  delay?: number;
}) {
  const linked = Boolean(product.href && product.cta);

  return (
    <Reveal
      as="li"
      className={`product product--row product--live${linked ? " product--linked" : ""}`}
      delay={delay}
    >
      <div className="product__meta">
        <span className="product__index">{String(index + 1).padStart(2, "0")}</span>
        <span className="product__status product__status--live">{product.statusLabel}</span>
      </div>

      <div className="product__head">
        <h3 className="product__name">{product.name}</h3>
        <p className="product__tagline">{product.tagline}</p>
      </div>

      <p className="product__text">{product.body}</p>

      <ul className="product__facets">
        {product.chips.map((chip) => (
          <li key={chip}>{chip}</li>
        ))}
      </ul>

      {product.href && product.cta && (
        <div className="product__action">
          <a className="link-arrow link-arrow--lead" href={product.href}>
            {product.cta}
            <ArrowUpRight size={15} />
          </a>
        </div>
      )}
    </Reveal>
  );
}
