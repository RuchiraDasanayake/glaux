import { WHAT } from "../lib/brand";
import Reveal from "./Reveal";

export default function WhatWeDo() {
  return (
    <section className="section" id="what">
      <div className="shell what">
        <Reveal className="what__head">
          <div className="section__head">
            <span className="eyebrow">
              <span className="dot" />
              {WHAT.eyebrow}
            </span>
            <h2 className="section__title">{WHAT.title}</h2>
          </div>
        </Reveal>

        <Reveal className="what__body" delay={0.08}>
          {WHAT.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
