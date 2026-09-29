"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { hero, log, nav, steps } from "./content";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const fmt = (n: number, prefix = "") => prefix + Math.round(n).toLocaleString("en-US");
const FLOW = 3; // timeline length of the order's trip, in timeline seconds

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const flowTrigger = useRef<ScrollTrigger | null>(null);

  useGSAP(
    (_, contextSafe) => {
      const q = gsap.utils.selector(root);
      const tiles = q<HTMLElement>("[data-tile]");
      const mosaic = q<HTMLElement>("[data-mosaic]")[0];
      const svg = q<SVGSVGElement>("[data-path-svg]")[0];
      const path = q<SVGPathElement>("[data-path]")[0];
      const token = q<HTMLElement>("[data-token]")[0];
      const stepLabel = q<HTMLElement>("[data-step]")[0];

      // Every tile's "after" state, for layouts that skip the scroll story.
      const showFinal = () => {
        tiles.forEach((tile, i) => {
          const s = steps[i];
          gsap.set(tile.querySelector("[data-bar]"), { scaleX: 1 });
          gsap.set(tile.querySelector("[data-dot]"), { backgroundColor: "var(--signal)" });
          const swap = tile.querySelectorAll("[data-before], [data-after]");
          if (swap.length) gsap.set(swap, { yPercent: -100 });
          const counter = tile.querySelector("[data-count]");
          if (counter && s.count) counter.textContent = fmt(s.count.to, s.count.prefix);
        });
        gsap.set(q("[data-caption-before], [data-caption-after]"), { yPercent: -100 });
        stepLabel.textContent = `6/6 · ${steps[5].dept}`;
      };

      // The order's route: straight runs between tile centres (layout boxes, not transforms).
      const measure = () => {
        const w = mosaic.offsetWidth;
        const h = mosaic.offsetHeight;
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        const pts = tiles.map((t) => [t.offsetLeft + t.offsetWidth / 2, t.offsetTop + t.offsetHeight / 2]);
        path.setAttribute("d", pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" "));
      };

      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023.98px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };

          if (reduce) {
            showFinal();
            return;
          }

          // Load: headline lines rise out of a mask while the face widens.
          SplitText.create(q("[data-headline]"), {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => {
              // Masks clip at the line box; give descenders room without shifting the layout.
              gsap.set(self.masks, { paddingBottom: "0.12em", marginBottom: "-0.12em" });
              return gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.09, delay: 0.1 });
            },
          });
          gsap.fromTo(q("[data-headline]"), { "--wdth": 62 }, { "--wdth": 84, duration: 1.8, ease: "expo.out", delay: 0.1 });
          gsap.from(q("[data-intro]"), { autoAlpha: 0, y: 16, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.45 });
          gsap.from(q("[data-mosaic-wrap]"), { autoAlpha: 0, duration: 1, ease: "power2.out", delay: 0.3 });

          // Event log drifts past like a shift report.
          gsap.to(q("[data-log]"), { xPercent: -50, duration: 60, ease: "none", repeat: -1 });

          if (!desktop) {
            showFinal();
            return;
          }

          measure();
          const onResize = () => measure();
          window.addEventListener("resize", onResize);

          const pos = { p: 0 };
          const placeToken = () => {
            const len = path.getTotalLength();
            const pt = path.getPointAtLength(pos.p * len);
            gsap.set(token, { x: pt.x, y: pt.y });
            const i = Math.min(5, Math.floor(pos.p * 6));
            stepLabel.textContent = pos.p > 0 ? `${i + 1}/6 · ${steps[i].dept}` : `0/6`;
          };

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=240%",
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              onRefresh: () => {
                measure();
                placeToken();
              },
            },
          });
          flowTrigger.current = tl.scrollTrigger ?? null;

          // 1 — six scattered tools snap into one mosaic.
          tl.from(tiles, {
            xPercent: (i) => steps[i].scatter.x,
            yPercent: (i) => steps[i].scatter.y,
            rotation: (i) => steps[i].scatter.r,
            duration: 1,
            stagger: 0.05,
          })
            .to(q("[data-caption-before], [data-caption-after]"), { yPercent: -100, duration: 0.4, stagger: 0.1 }, 0.5)
            .fromTo(q("[data-emph]"), { "--wdth": 84 }, { "--wdth": 104, duration: 0.8, immediateRender: false }, 0.4)
            .addLabel("flow", "+=0.15");

          // 2 — one order travels through every department.
          tl.set(token, { autoAlpha: 1 }, "flow")
            .fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: FLOW, ease: "none" }, "flow")
            .to(pos, { p: 1, duration: FLOW, ease: "none", onUpdate: placeToken }, "flow");

          tiles.forEach((tile, i) => {
            const at = `flow+=${(i / 5) * FLOW * 0.96}`;
            const s = steps[i];
            tl.to(tile.querySelector("[data-bar]"), { scaleX: 1, duration: 0.35 }, at)
              .to(tile.querySelector("[data-dot]"), { backgroundColor: "var(--signal)", duration: 0.1 }, at);
            const swap = tile.querySelectorAll("[data-before], [data-after]");
            if (swap.length) tl.to(swap, { yPercent: -100, duration: 0.3 }, at);
            const counter = tile.querySelector("[data-count]");
            if (counter && s.count) {
              const n = { v: s.count.from };
              tl.to(n, {
                v: s.count.to,
                duration: 0.45,
                ease: "power1.out",
                onUpdate: () => (counter.textContent = fmt(n.v, s.count!.prefix)),
              }, at);
            }
          });
          tl.to({}, { duration: 0.4 }); // hold the finished mosaic before the pin releases

          return () => {
            window.removeEventListener("resize", onResize);
            flowTrigger.current = null;
          };
        },
      );

      // "Follow an order" jumps to the start of the trip (desktop) or the mosaic (mobile).
      const follow = contextSafe!(() => {
        const st = flowTrigger.current;
        const top = st ? st.labelToScroll("flow") + 2 : (mosaic.getBoundingClientRect().top + window.scrollY - 24);
        const smoother = ScrollSmoother.get();
        if (smoother) smoother.scrollTo(top, true);
        else window.scrollTo({ top, behavior: "smooth" });
      });
      const btn = q<HTMLButtonElement>("[data-follow]")[0];
      btn.addEventListener("click", follow);
      return () => btn.removeEventListener("click", follow);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative flex flex-col overflow-hidden bg-bg text-ink lg:h-svh">
      <Nav />

      <div className="grid flex-1 items-center gap-x-10 gap-y-14 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-12 lg:px-12 lg:pb-8 lg:pt-0">
        <div className="lg:col-span-5">
          <p data-intro className="mb-6 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            {hero.eyebrow}
          </p>
          <h1
            data-headline
            className="font-stretchable font-display text-hero font-semibold [--wdth:84]"
          >
            {hero.lines.map((line, i) => (
              <span key={line} data-emph={i === hero.lines.length - 1 || undefined} className="font-stretchable block">
                {line}
              </span>
            ))}
          </h1>
          <p data-intro className="mt-8 max-w-md text-lg leading-relaxed text-muted text-pretty">
            {hero.body}
          </p>
          <div data-intro className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#demo"
              className="group inline-flex h-12 items-center gap-3 bg-signal px-6 font-medium text-on-signal outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink"
            >
              {hero.primary}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
            <button
              data-follow
              type="button"
              className="inline-flex h-12 items-center gap-3 border border-ink/25 px-6 font-medium transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {hero.secondary}
              <span className="font-mono text-xs text-muted">{hero.order}</span>
            </button>
          </div>
        </div>

        <div data-mosaic-wrap className="lg:col-span-7 lg:col-start-6">
          <div className="mb-4 flex items-end justify-between gap-4 font-mono text-xs uppercase tracking-[0.12em]">
            <p className="relative h-4 flex-1 overflow-hidden">
              <span data-caption-before className="absolute inset-0 truncate text-muted">
                {hero.captionBefore}
              </span>
              <span data-caption-after className="absolute inset-x-0 top-full truncate">
                {hero.captionAfter}
              </span>
            </p>
            <p className="hidden shrink-0 text-muted lg:block" aria-hidden>
              {hero.order} · step <span data-step className="text-ink">0/6</span>
            </p>
          </div>

          <div data-mosaic id="order-flow" className="relative lg:h-[min(30rem,56svh)]">
            <svg data-path-svg aria-hidden className="pointer-events-none absolute inset-0 hidden size-full lg:block">
              <path
                data-path
                pathLength={1}
                fill="none"
                stroke="var(--signal)"
                strokeWidth={4}
                strokeDasharray="1 1"
                strokeDashoffset={1}
                strokeLinejoin="round"
              />
            </svg>
            <ol
              aria-label={`Order ${hero.order} moving through the company`}
              className="relative grid grid-cols-2 gap-2 sm:gap-3 lg:h-full lg:grid-cols-3 lg:grid-rows-2 lg:gap-5"
            >
              {steps.map((s, i) => (
                <Tile key={s.dept} step={s} index={i} />
              ))}
            </ol>

            <span
              data-token
              aria-hidden
              className="pointer-events-none invisible absolute left-0 top-0 z-10 -ml-2.5 -mt-2.5 hidden size-5 border-2 border-ink bg-signal lg:block"
            />
          </div>
        </div>
      </div>

      <Ticker />
    </section>
  );
}

function Tile({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const value = step.count ? (
    <span data-count>{fmt(step.count.from, step.count.prefix)}</span>
  ) : (
    <span className="relative block overflow-hidden">
      <span data-before className="block">
        {step.before}
      </span>
      <span data-after aria-hidden className="absolute inset-x-0 top-full block">
        {step.after}
      </span>
    </span>
  );

  return (
    <li
      data-tile
      className={`relative flex min-h-36 flex-col justify-between overflow-hidden border border-rule bg-surface p-4 will-change-transform sm:p-5 lg:min-h-0 ${step.cell}`}
    >
      <div className="flex items-center justify-between font-mono text-[0.6875rem] uppercase tracking-[0.12em]">
        <span>
          <span className="text-muted">{String(index + 1).padStart(2, "0")}</span> {step.dept}
        </span>
        <span data-dot aria-hidden className="size-2.5 border border-ink/40 bg-transparent" />
      </div>
      <div>
        <p className="mb-1 font-mono text-xs text-muted">{step.doc}</p>
        <p className="font-stretchable font-display text-2xl font-semibold tracking-tight [--wdth:92] sm:text-3xl xl:text-4xl">
          {value}
        </p>
      </div>
      <span data-bar aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-signal" />
    </li>
  );
}

function Nav() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-5 sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
        <span aria-hidden className="grid grid-cols-2 gap-0.5">
          <span className="size-2 bg-ink" />
          <span className="size-2 bg-ink" />
          <span className="size-2 bg-ink" />
          <span className="size-2 bg-signal" />
        </span>
        Tessera
      </Link>
      <nav aria-label="Main" className="hidden md:block">
        <ul className="flex gap-8 text-sm">
          {nav.links.map(({ label: l, href }) => (
            <li key={l}>
              <a href={href} className="text-muted transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-none">
                {l}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-5 text-sm">
        <a href="#sign-in" className="hidden text-muted hover:text-ink sm:inline">
          {nav.signIn}
        </a>
        <a href="#demo" className="bg-ink px-4 py-2 font-medium text-bg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
          {nav.demo}
        </a>
      </div>
    </header>
  );
}

function Ticker() {
  const items = [...log, ...log];
  return (
    <div className="shrink-0">
      <div aria-hidden className="hazard h-1.5" />
      <div className="overflow-hidden bg-ink py-3 text-bg">
        <p className="sr-only">Live activity log</p>
        <ul data-log aria-hidden className="flex w-max gap-12 pr-12 whitespace-pre font-mono text-xs">
          {items.map((line, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="size-1.5 bg-signal" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
