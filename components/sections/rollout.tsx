"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);

const rollout = {
  eyebrow: "Rollout",
  title: "Switch over without stopping the floor.",
  body: "A fixed path from your current tools to one record, run with your team.",
};

const steps = [
  { title: "Map", text: "We map your items, customers, bills of materials and chart of accounts with your team." },
  { title: "Import", text: "Opening stock, open orders and balances come across from your current tools." },
  { title: "Run in parallel", text: "Tessera runs next to your old system until the numbers match." },
  { title: "Go live", text: "One cut-over weekend. Monday starts on one record." },
];

const TRIP = 4; // timeline length of the token's run along the rail, in timeline seconds

export function Rollout() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023.98px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };

          // SSR markup is the final state: line drawn, token at the end, every step shown.
          if (reduce) return;

          // Header: h2 lines rise from a mask, the rest follows. Once.
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
                stagger: 0.09,
                scrollTrigger: { trigger: self.elements[0], start: "top 85%", once: true },
              });
            },
          });
          gsap.from(q("[data-intro]"), {
            autoAlpha: 0,
            y: 16,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: q("[data-header]")[0], start: "top 85%", once: true },
          });

          // Rail: horizontal on desktop, vertical on the left below lg.
          const axis = desktop ? "h" : "v";
          const rail = q<HTMLElement>(`[data-rail="${axis}"]`)[0];
          const line = q<SVGLineElement>(`[data-rail="${axis}"] [data-line]`)[0];
          const token = q<HTMLElement>(`[data-token="${axis}"]`)[0];
          const items = q<HTMLElement>("[data-step]");

          // Where each stop sits along the rail, 0–1 (layout boxes; the steps themselves never transform).
          const railBox = rail.getBoundingClientRect();
          const stops = items.map((item) => {
            const s = item.querySelector<HTMLElement>("[data-stop]")!.getBoundingClientRect();
            const f = desktop
              ? (s.left + s.width / 2 - railBox.left) / railBox.width
              : (s.top + s.height / 2 - railBox.top) / railBox.height;
            return gsap.utils.clamp(0, 1, f);
          });

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: q("[data-steps]")[0],
              start: "top 70%",
              end: "bottom 60%",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          // The token sits at the rail's end in the markup; it runs in from the start.
          tl.fromTo(line, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: TRIP, ease: "none" }, 0).fromTo(
            token,
            desktop ? { x: () => -rail.offsetWidth } : { y: () => -rail.offsetHeight },
            { x: 0, y: 0, duration: TRIP, ease: "none" },
            0,
          );

          items.forEach((item, i) => {
            const at = stops[i] * TRIP;
            const num = item.querySelector("[data-num]");
            tl.fromTo(item.querySelector("[data-stop-fill]"), { scale: 0 }, { scale: 1, duration: 0.15, ease: "power2.out" }, at)
              // Odometer: the muted 0 rolls out as the real digit rolls in.
              .fromTo(item.querySelectorAll("[data-zero], [data-digit]"), { yPercent: 100 }, { yPercent: 0, duration: 0.35 }, at)
              .fromTo(num, { "--wdth": 62 }, { "--wdth": 110, duration: 0.6, ease: "power3.out" }, at)
              .fromTo(
                item.querySelectorAll("[data-reveal]"),
                { autoAlpha: 0, y: 16 },
                { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.08 },
                at + 0.1,
              );
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="rollout"
      className="relative overflow-hidden bg-surface px-5 py-28 text-ink sm:px-8 lg:px-12 lg:py-40"
    >
      <div data-header className="gap-x-10 lg:grid lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p data-intro className="mb-6 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            {rollout.eyebrow}
          </p>
          <h2
            data-title
            className="font-stretchable font-display text-5xl font-semibold leading-[0.92] tracking-[-0.035em] text-balance [--wdth:84] sm:text-6xl lg:text-7xl"
          >
            {rollout.title}
          </h2>
        </div>
        <p
          data-intro
          className="mt-8 max-w-md text-lg leading-relaxed text-muted text-pretty lg:col-span-4 lg:mt-0"
        >
          {rollout.body}
        </p>
      </div>

      <div data-steps className="relative mt-20 lg:mt-28">
        {/* Rails sit under the stops; the tokens ride above them. */}
        <Rail axis="h" />
        <Rail axis="v" />

        <ol className="relative lg:grid lg:grid-cols-4 lg:gap-x-10">
          {steps.map((s, i) => (
            <li key={s.title} data-step className="relative pb-16 ps-14 last:pb-0 lg:pb-0 lg:ps-0 lg:pe-4">
              <div
                data-num
                aria-hidden
                className="font-stretchable relative h-[1em] overflow-hidden font-display text-8xl font-semibold leading-none tracking-[-0.04em] tabular-nums [--wdth:110] lg:text-[9rem]"
              >
                <span data-zero className="absolute inset-x-0 bottom-full block text-muted">
                  0
                </span>
                <span data-digit className="block">
                  {i + 1}
                </span>
              </div>

              {/* Stop on the rail: absolute beside the numeral below lg, its own row on lg. */}
              <span
                data-stop
                aria-hidden
                className="absolute start-0 top-[2.375rem] grid size-5 place-items-center lg:static lg:my-8"
              >
                <span className="relative size-3 border border-ink/40 bg-surface">
                  <span data-stop-fill className="absolute inset-0 bg-signal" />
                </span>
              </span>

              <h3
                data-reveal
                className="font-stretchable mt-4 font-display text-3xl font-semibold tracking-[-0.02em] [--wdth:84] lg:mt-0"
              >
                {s.title}
              </h3>
              <p data-reveal className="mt-3 max-w-xs leading-relaxed text-muted text-pretty">
                {s.text}
              </p>
            </li>
          ))}
        </ol>

        <Token axis="h" />
        <Token axis="v" />
      </div>
    </section>
  );
}

// lg: numeral (9rem) + stop margin (2rem) puts the stop row, and so the rail, at top-44 (11rem), h-5.
const railBox = {
  h: "absolute inset-x-0 top-44 hidden h-5 lg:block",
  v: "absolute inset-y-0 start-0 w-5 lg:hidden",
} as const;

function Rail({ axis }: { axis: "h" | "v" }) {
  const h = axis === "h";
  return (
    <div data-rail={axis} aria-hidden className={railBox[axis]}>
      <svg
        viewBox={h ? "0 0 100 2" : "0 0 2 100"}
        preserveAspectRatio="none"
        className={h ? "absolute inset-x-0 top-1/2 -mt-px h-0.5 w-full" : "absolute inset-y-0 left-1/2 -ml-px h-full w-0.5"}
      >
        {/* Stroke width 2 on the 2-unit axis = exactly 2px; the long axis only stretches length. */}
        <line x1={h ? 0 : 1} y1={h ? 1 : 0} x2={h ? 100 : 1} y2={h ? 1 : 100} className="stroke-ink/20" strokeWidth={2} />
        <line data-line x1={h ? 0 : 1} y1={h ? 1 : 0} x2={h ? 100 : 1} y2={h ? 1 : 100} className="stroke-signal" strokeWidth={2} />
      </svg>
    </div>
  );
}

function Token({ axis }: { axis: "h" | "v" }) {
  // Rendered at the end of the rail (final state); GSAP runs it in from the start.
  return (
    <div aria-hidden className={`pointer-events-none z-10 ${railBox[axis]}`}>
      <span
        data-token={axis}
        className={`absolute size-5 border-2 border-ink bg-signal will-change-transform ${
          axis === "h" ? "left-full top-0 -ml-2.5" : "left-0 top-full -mt-2.5"
        }`}
      />
    </div>
  );
}
