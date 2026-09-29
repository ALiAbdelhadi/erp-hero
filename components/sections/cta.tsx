"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const cta = {
  eyebrow: "Book a demo",
  lines: ["See your own", "order move."],
  body: "Bring one real order. We'll run it through Tessera with your items and your warehouses, live on the call.",
  primary: "Book a demo",
  email: "sales@tessera.example",
};

const footer = {
  tagline: "One record for the whole company.",
  columns: [
    {
      heading: "Product",
      links: ["Sales", "Inventory", "Production", "Shipping", "Invoicing", "Ledger"].map((label) => ({ label, href: "#product" })),
    },
    { heading: "Company", links: ["About", "Careers", "Contact"].map((label) => ({ label, href: "#" })) },
    { heading: "Legal", links: ["Privacy", "Terms"].map((label) => ({ label, href: "#" })) },
  ],
  wordmark: "Tessera",
  copyright: "© 2026 Tessera",
  signoff: "Made for the floor, not the boardroom.",
};

const WDTH_MIN = 62;
const WDTH_MAX = 125;
const WDTH_REST = 84;
const MAGNET_RADIUS = 80; // px beyond the button's edges
const MAGNET_PULL = 0.35;

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";
const focusRingInverted = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bg";

/** Rendered width of an element's content (ignores its own box, so it works on full-width blocks). */
function contentWidth(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
}

/** Widest --wdth (≤ 125) at which `el`'s text still fits in `avail` px. Width grows ~linearly with the axis. */
function maxFittingWdth(el: HTMLElement, avail: number) {
  const current = el.style.getPropertyValue("--wdth");
  el.style.setProperty("--wdth", String(WDTH_MIN));
  const narrow = contentWidth(el);
  el.style.setProperty("--wdth", String(WDTH_MAX));
  const wide = contentWidth(el);
  if (current) el.style.setProperty("--wdth", current);
  else el.style.removeProperty("--wdth");
  if (wide <= avail) return WDTH_MAX;
  if (narrow >= avail || wide === narrow) return WDTH_MIN;
  return Math.max(WDTH_MIN, WDTH_MIN + ((WDTH_MAX - WDTH_MIN) * (avail - narrow)) / (wide - narrow) - 1);
}

export function Cta() {
  return (
    <>
      <CtaSection />
      <div aria-hidden className="hazard h-2" />
      <Footer />
    </>
  );
}

function CtaSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const section = root.current!;
      const headline = q<HTMLElement>("[data-headline]")[0];
      const lines = q<HTMLElement>("[data-line]");
      const magnet = q<HTMLElement>("[data-magnet]")[0];
      const label = q<HTMLElement>("[data-magnet-label]")[0];

      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023.98px)",
          reduce: "(prefers-reduced-motion: reduce)",
          fine: "(pointer: fine)",
        },
        (ctx) => {
          const { desktop, reduce, fine } = ctx.conditions as { desktop: boolean; reduce: boolean; fine: boolean };
          if (reduce) return; // SSR markup is the final state

          // Entrance: each word rises out of its own mask (one word per line on mobile, two lines on desktop).
          gsap.from(q("[data-word]"), {
            yPercent: 110,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.07,
            scrollTrigger: { trigger: headline, start: "top 80%", once: true },
          });
          gsap.from(q("[data-intro]"), {
            autoAlpha: 0,
            y: 16,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: headline, start: "top 70%", once: true },
          });

          if (!desktop || !fine) return;

          // Headline width follows the pointer. Each line has its own ceiling so it never overflows.
          let ceilings = lines.map(() => WDTH_MAX);
          const measure = () => {
            const avail = headline.clientWidth;
            ceilings = lines.map((line) => maxFittingWdth(line, avail));
          };
          measure();
          ScrollTrigger.addEventListener("refresh", measure);

          const wdthTo = lines.map((line, i) =>
            gsap.quickTo(line, "--wdth", { duration: i === 0 ? 0.8 : 1.15, ease: "power3" }),
          );

          // Magnetic button: the label trails at 1/1.5 of the button's travel.
          const btnX = gsap.quickTo(magnet, "x", { duration: 0.4, ease: "power3" });
          const btnY = gsap.quickTo(magnet, "y", { duration: 0.4, ease: "power3" });
          const lblX = gsap.quickTo(label, "x", { duration: 0.4, ease: "power3" });
          const lblY = gsap.quickTo(label, "y", { duration: 0.4, ease: "power3" });
          const lag = 1 / 1.5 - 1;
          const follow = [btnX, btnY, lblX, lblY];
          let magnetised = false;
          let settle: gsap.core.Tween | null = null;

          const release = () => {
            if (!magnetised) return;
            magnetised = false;
            // Hand x/y from the quickTo tweens to one elastic settle (paused, not killed, so quickTo can resume).
            follow.forEach((to) => to.tween.pause());
            settle = gsap.to([magnet, label], { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1,0.4)", overwrite: false });
          };

          const onMove = ctx.add("onMove", (e: PointerEvent) => {
            const r = section.getBoundingClientRect();
            const t = gsap.utils.clamp(0, 1, (e.clientX - r.left) / r.width);
            const target = WDTH_MIN + t * (WDTH_MAX - WDTH_MIN);
            wdthTo.forEach((to, i) => to(Math.min(target, ceilings[i])));

            // Zone is measured on the wrapper, which never moves.
            const zone = magnet.parentElement!.getBoundingClientRect();
            const dx = e.clientX - (zone.left + zone.width / 2);
            const dy = e.clientY - (zone.top + zone.height / 2);
            const inside = Math.abs(dx) < zone.width / 2 + MAGNET_RADIUS && Math.abs(dy) < zone.height / 2 + MAGNET_RADIUS;
            if (inside) {
              if (!magnetised) {
                magnetised = true;
                settle?.kill();
                settle = null;
                // Re-seed the quickTo tweens from wherever the elastic settle left them.
                const at = (el: HTMLElement, p: "x" | "y") => Number(gsap.getProperty(el, p));
                btnX(at(magnet, "x"), at(magnet, "x"));
                btnY(at(magnet, "y"), at(magnet, "y"));
                lblX(at(label, "x"), at(label, "x"));
                lblY(at(label, "y"), at(label, "y"));
              }
              btnX(dx * MAGNET_PULL);
              btnY(dy * MAGNET_PULL);
              lblX(dx * MAGNET_PULL * lag);
              lblY(dy * MAGNET_PULL * lag);
            } else {
              release();
            }
          }) as (e: PointerEvent) => void;

          const onLeave = ctx.add("onLeave", () => {
            wdthTo.forEach((to, i) => to(Math.min(WDTH_REST, ceilings[i])));
            release();
          }) as () => void;

          section.addEventListener("pointermove", onMove);
          section.addEventListener("pointerleave", onLeave);
          return () => {
            ScrollTrigger.removeEventListener("refresh", measure);
            section.removeEventListener("pointermove", onMove);
            section.removeEventListener("pointerleave", onLeave);
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="demo"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-signal px-5 py-28 text-on-signal sm:px-8 lg:px-12 lg:py-40"
    >
      <p data-intro className="mb-6 font-mono text-xs uppercase tracking-[0.14em] text-on-signal/60">
        {cta.eyebrow}
      </p>

      <h2
        data-headline
        className="font-display text-[clamp(3.5rem,11vw,12rem)] font-semibold leading-[0.86] tracking-[-0.04em]"
      >
        {cta.lines.map((line, li) => (
          <span
            key={line}
            data-line
            className="font-stretchable block [--wdth:84] lg:w-max lg:max-w-full lg:whitespace-nowrap"
          >
            {line.split(" ").map((word, wi) => (
              <Fragment key={word}>
                {wi > 0 && " "}
                <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em] lg:inline-block lg:align-top">
                  <span data-word data-row={li} className="block">
                    {word}
                  </span>
                </span>
              </Fragment>
            ))}
          </span>
        ))}
      </h2>

      <div className="mt-14 gap-x-10 gap-y-10 lg:mt-20 lg:grid lg:grid-cols-12 lg:items-end">
        <p data-intro className="max-w-md text-lg leading-relaxed text-on-signal/75 text-pretty lg:col-span-5">
          {cta.body}
        </p>
        <div
          data-intro
          className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8 lg:col-span-6 lg:col-start-7 lg:mt-0 lg:justify-self-end"
        >
          <span className="inline-block">
            <a
              data-magnet
              href={`mailto:${cta.email}?subject=${encodeURIComponent(cta.primary)}`}
              className={`inline-flex h-14 items-center bg-ink px-8 font-medium text-bg will-change-transform ${focusRing}`}
            >
              <span data-magnet-label className="inline-block">
                {cta.primary}
              </span>
            </a>
          </span>
          <a
            href={`mailto:${cta.email}`}
            className={`inline-flex min-h-11 items-center underline decoration-1 underline-offset-4 transition-colors hover:text-on-signal/70 ${focusRing}`}
          >
            Or email {cta.email}
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const wordmark = q<HTMLElement>("[data-wordmark]")[0];

      // 22vw at wdth 125 can outgrow the gutters on some viewports — narrow the axis until it fits.
      const fit = () => {
        wordmark.style.removeProperty("--wdth");
        const max = maxFittingWdth(wordmark, wordmark.clientWidth);
        if (max < WDTH_MAX) wordmark.style.setProperty("--wdth", String(max));
      };
      fit();
      ScrollTrigger.addEventListener("refresh", fit);

      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023.98px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduce } = ctx.conditions as { reduce: boolean };
          if (reduce) return;
          SplitText.create(wordmark, {
            type: "chars",
            mask: "chars",
            onSplit: (self) => {
              gsap.set(self.masks, { paddingBlock: "0.08em", marginBlock: "-0.08em" });
              return gsap.from(self.chars, {
                yPercent: 115,
                duration: 1.2,
                ease: "expo.out",
                stagger: 0.06,
                scrollTrigger: { trigger: wordmark, start: "top 95%", once: true },
              });
            },
          });
        },
      );

      return () => ScrollTrigger.removeEventListener("refresh", fit);
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="relative overflow-hidden bg-ink px-5 pb-8 pt-20 text-bg sm:px-8 lg:px-12">
      <div className="gap-x-10 gap-y-14 lg:grid lg:grid-cols-12">
        <div className="lg:col-span-5">
          <a href="#" className={`inline-flex min-h-11 items-center gap-2.5 font-display text-lg font-semibold tracking-tight ${focusRingInverted}`}>
            <span aria-hidden className="grid grid-cols-2 gap-0.5">
              <span className="size-2 bg-bg" />
              <span className="size-2 bg-bg" />
              <span className="size-2 bg-bg" />
              <span className="size-2 bg-signal" />
            </span>
            Tessera
          </a>
          <p className="mt-3 max-w-xs text-bg/55">{footer.tagline}</p>
        </div>

        <nav aria-label="Footer" className="mt-14 grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7 lg:mt-0">
          {footer.columns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-bg/55">{col.heading}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className={`inline-flex min-h-11 items-center transition-colors hover:text-signal lg:min-h-9 ${focusRingInverted}`}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <p
        data-wordmark
        aria-hidden
        className="font-stretchable mt-20 whitespace-nowrap font-display text-[22vw] font-semibold leading-[0.8] tracking-[-0.04em] [--wdth:125] lg:mt-28"
      >
        {footer.wordmark}
      </p>

      <div className="mt-8 flex flex-col gap-2 border-t border-bg/15 pt-6 font-mono text-xs uppercase tracking-[0.14em] text-bg/55 sm:flex-row sm:justify-between">
        <p>{footer.copyright}</p>
        <p>{footer.signoff}</p>
      </div>
    </footer>
  );
}
