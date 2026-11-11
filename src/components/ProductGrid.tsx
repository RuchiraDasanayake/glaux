import { PRODUCTS } from "../lib/brand";
import ProductNote from "./ProductNote";
import ProductRow from "./ProductRow";
import Reveal from "./Reveal";

const available = PRODUCTS.filter((product) => product.status === "live");
const unreleased = PRODUCTS.filter((product) => product.status !== "live");

/**
 * The catalogue, in two parts that cannot be mistaken for each other: what
 * can be opened today, as full rows with a way in, and what is still being
 * built, as a quieter set of notes with no links at all. The numbering runs
 * straight through both, because it is still one list.
 */
export default function ProductGrid() {
  return (
    <section className="section" id="products">
      <div className="shell">
        <Reveal>
          <div className="section__head section__head--split">
            <span className="eyebrow">
              <span className="dot" />
              Products
            </span>
            <div className="section__intro">
              <h2 className="section__title">One instrument per domain.</h2>
              <p className="section__lead">
                Each Glaux product is a separate application with its own data and its own users.
                Two already serve Sri Lankan shops: one keeps the record the business runs on, the
                other gets its Sinhala typed right. The rest measure the risk that record cannot see
                by itself.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="product-group">
          <Reveal>
            <p className="product-group__label" id="products-available">
              Available now
            </p>
          </Reveal>
          <ol className="products" aria-labelledby="products-available">
            {available.map((product, index) => (
              <ProductRow key={product.id} product={product} index={index} delay={index * 0.08} />
            ))}
          </ol>
        </div>

        <div className="product-group">
          <Reveal>
            <p className="product-group__label" id="products-unreleased">
              Not yet released
            </p>
          </Reveal>
          <ol
            className="products products--notes"
            aria-labelledby="products-unreleased"
            start={available.length + 1}
          >
            {unreleased.map((product, index) => (
              <ProductNote
                key={product.id}
                index={available.length + index}
                name={product.name}
                status={product.statusLabel}
                tagline={product.tagline}
                body={product.body}
                facets={product.chips}
                delay={index * 0.08}
              />
            ))}
            <ProductNote
              future
              index={PRODUCTS.length}
              name="More to come"
              status="Open"
              body="A domain is added once its risk model earns the place. Nothing ships to look busy."
              delay={unreleased.length * 0.08}
            />
          </ol>
        </div>
      </div>
    </section>
  );
}
