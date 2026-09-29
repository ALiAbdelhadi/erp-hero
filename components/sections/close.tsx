"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);

const copy = {
  eyebrow: "Month-end",
  title: "Close the month while it's still the month.",
  body: "Every sale, receipt and shipment already posted when it happened, so month-end is a review — not a reconstruction.",
  debits: "Debits",
  credits: "Credits",
  difference: "Difference",
  balanced: "Balanced",
};

const tasks = [
  { label: "Bank accounts reconciled", at: "Mar 31 · 17:02" },
  { label: "Stock valued at FIFO", at: "Mar 31 · 17:38" },
  { label: "Accruals posted", at: "Mar 31 · 18:15" },
  { label: "Intercompany eliminated", at: "Mar 31 · 19:04" },
  { label: "VAT return drafted", at: "Apr 1 · 08:51" },
  { label: "P&L and balance sheet locked", at: "Apr 1 · 09:40" },
];

const DEBITS = 1_284_920;
const GAP = 12_480; // credits start at DEBITS − GAP
const START_CLIP = 10; // % of the credit column hidden at the start (90% height)

// Ledger lines, top to bottom: each row is an account cell (width below) + an amount cell.
const ROWS = ["w-1/3", "w-1/5", "w-2/5", "w-1/4", "w-1/3", "w-1/6", "w-2/5", "w-1/4", "w-1/3", "w-2/5", "w-1/5", "w-2/5", "w-1/4", "w-1/5", "w-1/3", "w-1/3", "w-1/4", "w-2/5", "w-1/5", "w-1/3"];
const CLOSING_ROWS = 2; // the top credit rows that the close posts — the ones that level the columns

const money = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function Close() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const checks = q<SVGPathElement>("[data-check]");
      const fills = q<HTMLElement>("[data-box-fill]");
      const texts = q<HTMLElement>("[data-task-text]");
      const stamps = q<HTMLElement>("[data-stamp]");
      const creditClip = q<HTMLElement>("[data-credit-clip]")[0];
      const creditTotal = q<HTMLElement>("[data-credit-total]")[0];
      const diff = q<HTMLElement>("[data-diff]")[0];
      const chip = q<HTMLElement>("[data-balanced]")[0];

      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023.98px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
          if (reduce) return; // SSR markup is already the closed, balanced state.

          SplitText.create(q("[data-title]"), {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => {
              gsap.set(self.masks, { paddingBottom: "0.12em", marginBottom: "-0.12em" });
              return gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.1,
                ease: "expo.out",
                stagger: 0.08,
                scrollTrigger: { trigger: root.current, start: "top 75%", toggleActions: "play none none none" },
              });
            },
          });

          // One reading drives the whole instrument: the remaining difference.
          const state = { d: GAP };
          const render = () => {
            creditClip.style.clipPath = `inset(${(state.d / GAP) * START_CLIP}% 0 0 0)`;
            creditTotal.textContent = money(DEBITS - state.d);
            diff.textContent = money(state.d);
          };

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: desktop
              ? {
                  trigger: root.current,
                  start: "top top",
                  end: "+=120%",
                  pin: true,
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                }
              : { trigger: root.current, start: "top 60%", toggleActions: "play none none none" },
          });

          // Checklist: one task ticks per timeline second.
          tasks.forEach((_, i) => {
            tl.fromTo(checks[i], { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.5, ease: "power2.out" }, i)
              .fromTo(fills[i], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, i)
              .fromTo(texts[i], { color: "var(--muted)" }, { color: "var(--ink)", duration: 0.4, ease: "none" }, i)
              .fromTo(stamps[i], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" }, i + 0.15);
          });

          // Credits rise and the difference counts down across the same span, landing with the last tick.
          tl.fromTo(
            state,
            { d: GAP },
            { d: 0, duration: tasks.length - 0.5, ease: "power1.inOut", onUpdate: render, onStart: render },
            0,
          )
            .fromTo(chip, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2.5)" })
            .to({}, { duration: desktop ? 0.6 : 0 }); // hold the balanced state before the pin releases

          render();

          return () => {
            creditClip.style.clipPath = "";
            creditTotal.textContent = money(DEBITS);
            diff.textContent = money(0);
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="finance"
      className="relative overflow-hidden bg-surface px-5 py-28 text-ink sm:px-8 lg:flex lg:min-h-svh lg:items-center lg:px-12 lg:py-16"
    >
      <div className="w-full gap-x-10 lg:grid lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.14em] text-muted">{copy.eyebrow}</p>
          <h2
            data-title
            className="font-stretchable font-display text-5xl font-semibold leading-[0.92] tracking-[-0.035em] [--wdth:84] sm:text-6xl lg:text-7xl"
          >
            {copy.title}
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted text-pretty">{copy.body}</p>

          <ol className="mt-10 border-t border-rule">
            {tasks.map((t) => (
              <li key={t.label} className="flex min-h-11 items-center gap-4 border-b border-rule py-2.5">
                <span aria-hidden className="relative size-5 shrink-0 border border-ink/40">
                  <span data-box-fill className="absolute inset-0 bg-signal" />
                  <svg viewBox="0 0 20 20" className="absolute inset-0 size-full text-on-signal">
                    <path
                      data-check
                      d="M4.5 10.5 8.5 14.5 15.5 5.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="square"
                    />
                  </svg>
                </span>
                <span data-task-text className="flex-1 text-base text-ink">
                  {t.label}
                </span>
                <span data-stamp className="shrink-0 font-mono text-xs tabular-nums text-muted">
                  {t.at}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20 lg:col-span-6 lg:col-start-7 lg:mt-0">
          <Instrument />
        </div>
      </div>
    </section>
  );
}

function Instrument() {
  return (
    <figure>
      <div className="grid grid-cols-2 gap-6 font-mono text-xs uppercase tracking-[0.14em] text-muted sm:gap-10">
        <p>{copy.debits}</p>
        <p>{copy.credits}</p>
      </div>

      {/* The level: a hairline at the top of the debit column. */}
      <div aria-hidden className="relative mt-4 h-64 sm:h-80 lg:h-[min(26rem,46svh)]">
        <div className="grid h-full grid-cols-2 gap-6 sm:gap-10">
          <Column />
          <div data-credit-clip className="h-full">
            <Column credit />
          </div>
        </div>
        <span className="absolute -inset-x-2 top-0 border-t border-ink" />
        <span className="absolute -top-5 right-0 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
          level
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-6 sm:gap-10">
        <p className="font-stretchable font-display text-2xl font-semibold tabular-nums tracking-tight [--wdth:84] sm:text-3xl xl:text-4xl">
          {money(DEBITS)}
        </p>
        <p className="font-stretchable font-display text-2xl font-semibold tabular-nums tracking-tight [--wdth:84] sm:text-3xl xl:text-4xl">
          <span data-credit-total>{money(DEBITS)}</span>
        </p>
      </div>

      <figcaption className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-5">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{copy.difference}</span>
        <span className="flex items-center gap-4">
          <span
            data-balanced
            className="bg-signal px-2 py-1 font-mono text-xs uppercase tracking-[0.14em] text-on-signal"
          >
            {copy.balanced}
          </span>
          <span className="font-stretchable font-display text-3xl font-semibold tabular-nums tracking-tight [--wdth:84] sm:text-4xl">
            <span data-diff>{money(0)}</span>
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

// A column of ledger lines, 1px apart — tesserae stacked into a total.
function Column({ credit = false }: { credit?: boolean }) {
  return (
    <div className="flex h-full flex-col gap-px">
      {ROWS.map((w, i) => {
        const closing = credit && i < CLOSING_ROWS;
        return (
          <div key={i} className="flex flex-1 gap-px">
            <span className={`${w} ${closing ? "bg-signal" : "bg-ink/80"}`} />
            <span className={`flex-1 ${closing ? "bg-signal" : "bg-ink"}`} />
          </div>
        );
      })}
    </div>
  );
}
