"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const EYEBROW = "Before Tessera";

// Statement as segments: plain text, and `{ chip }` markers rendered as inline signal chips.
const STATEMENT: (string | { chip: string })[] = [
  "An order gets typed into the CRM,",
  { chip: "entry 1" },
  "again into the warehouse sheet,",
  { chip: "entry 2" },
  "again into accounting.",
  { chip: "entry 3" },
  "By Friday, sales promises stock the floor doesn't have, and finance closes the month on numbers nobody trusts.",
];

const BODY = "Every hand-off between tools is a place for a number to go wrong. Tessera removes the hand-offs.";

const WORD_STEP = 0.35; // timeline seconds between one word and the next

export function Problem() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const statement = q<HTMLElement>("[data-statement]")[0];
      // Words and chips in reading order.
      const items = q<HTMLElement>("[data-word], [data-chip]");
      const words = items.filter((el) => el.hasAttribute("data-word"));
      const chips = items.filter((el) => el.hasAttribute("data-chip"));

      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023.98px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };

          if (reduce) {
            gsap.set(words, { opacity: 1 });
            gsap.set(chips, { scale: 1 });
            return;
          }

          // Same scrub on every width: it is only opacity and scale.
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: statement,
              start: "top 80%",
              end: "bottom 45%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });

          let w = 0;
          items.forEach((el) => {
            if (el.hasAttribute("data-word")) {
              tl.fromTo(el, { opacity: 0.12 }, { opacity: 1, duration: 1 }, w * WORD_STEP);
              w += 1;
            } else {
              // Pops as the word before it finishes lighting up.
              tl.fromTo(
                el,
                { scale: 0 },
                { scale: 1, duration: 0.6, ease: "back.out(2)" },
                (w - 1) * WORD_STEP + 0.6,
              );
            }
          });

          gsap.from(q("[data-body]"), {
            autoAlpha: 0,
            y: 16,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: q("[data-body]")[0], start: "top 85%", toggleActions: "play none none none" },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      id="problem"
      ref={root}
      className="relative overflow-hidden bg-bg px-5 py-28 text-ink sm:px-8 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:px-12 lg:py-40"
    >
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.14em] text-muted lg:col-span-3 lg:pt-4">{EYEBROW}</p>

      <p
        data-statement
        className="font-display font-stretchable text-4xl leading-[1.02] font-semibold tracking-[-0.03em] text-pretty [--wdth:84] sm:text-5xl lg:col-span-9 lg:text-6xl"
      >
        {STATEMENT.map((seg, i) =>
          typeof seg === "string" ? (
            <Fragment key={i}>
              {seg.split(" ").map((word, j, arr) => (
                <Fragment key={j}>
                  <span data-word>{word}</span>
                  {j < arr.length - 1 ? " " : null}
                </Fragment>
              ))}{" "}
            </Fragment>
          ) : (
            <Fragment key={i}>
              <span
                data-chip
                aria-hidden="true"
                className="inline-block bg-signal px-2 py-1 align-middle font-mono text-xs leading-none font-normal tracking-normal text-on-signal"
              >
                {seg.chip}
              </span>{" "}
            </Fragment>
          ),
        )}
      </p>

      <p
        data-body
        className="mt-16 max-w-md font-sans text-lg leading-relaxed text-pretty text-muted lg:col-span-5 lg:col-start-4"
      >
        {BODY}
      </p>
    </section>
  );
}
