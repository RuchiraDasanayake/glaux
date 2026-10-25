import { PRODUCTS } from "../lib/brand";
import ProductRow from "./ProductRow";
import Reveal from "./Reveal";

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

        <ol className="products">
          {PRODUCTS.map((product, index) => (
            <ProductRow key={product.id} product={product} index={index} delay={index * 0.08} />
          ))}

          <Reveal as="li" className="product product--future" delay={PRODUCTS.length * 0.08}>
            <div className="product__meta">
              <span className="product__index">{String(PRODUCTS.length + 1).padStart(2, "0")}</span>
              <span className="product__status">Open</span>
            </div>
            <div className="product__head">
              <h3 className="product__name">More to come</h3>
            </div>
            <p className="product__text">
              A domain is added once its risk model earns the place. Nothing ships to look busy.
            </p>
          </Reveal>
        </ol>
      </div>
    </section>
  );
}
