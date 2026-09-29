"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const copy = {
  eyebrow: "Connections",
  title: "Plugs into the floor, the bank and the storefront.",
  body: "Scanners, carriers, bank feeds and web shops write straight into the same record — no nightly imports.",
};

// Each connection is one labelled tessera spanning 2–3 cells. Placement is fixed per breakpoint
// (8 × 10 below lg, 16 × 7 on lg) so the field reads as scattered but never reshuffles.
// Class strings are literal so Tailwind can see them.
const connections = [
  { label: "Barcode scanners", cls: "col-span-3 col-start-1 row-start-1 lg:col-start-2 lg:row-start-1" },
  { label: "REST API", cls: "col-span-2 col-start-6 row-start-1 lg:col-start-11 lg:row-start-1" },
  { label: "Bank feeds", cls: "col-span-2 col-start-4 row-start-2 lg:col-start-7 lg:row-start-2" },
  { label: "Webhooks", cls: "col-span-2 col-start-7 row-start-4 lg:col-start-14 lg:row-start-2" },
  { label: "EDI 850 / 856", cls: "col-span-3 col-start-5 row-start-3 lg:col-start-1 lg:row-start-3" },
  { label: "Tax engines", cls: "col-span-2 col-start-1 row-start-4 lg:col-start-10 lg:row-start-3" },
  { label: "Web storefronts", cls: "col-span-3 col-start-3 row-start-5 lg:col-start-5 lg:row-start-4" },
  { label: "SSO / SAML", cls: "col-span-2 col-start-6 row-start-6 lg:col-start-13 lg:row-start-4" },
  { label: "Parcel carriers", cls: "col-span-3 col-start-1 row-start-7 lg:col-start-9 lg:row-start-5" },
  { label: "Payroll", cls: "col-span-2 col-start-5 row-start-8 lg:col-start-3 lg:row-start-6" },
  { label: "BI & spreadsheets", cls: "col-span-3 col-start-2 row-start-9 lg:col-start-12 lg:row-start-6" },
  { label: "CSV import", cls: "col-span-2 col-start-6 row-start-10 lg:col-start-7 lg:row-start-7" },
] as const;

const SPANNED = connections.reduce((n, c) => n + (c.cls.startsWith("col-span-3") ? 3 : 2), 0);
const FILL_MOBILE = 8 * 10 - SPANNED; // plain cells visible below lg
const FILL_DESKTOP = 16 * 7 - SPANNED; // plain cells visible on lg

const RADIUS = 180; // px — cursor influence
const LIFT = 8; // px
const GROW = 0.06;

const cellCls = "relative border border-rule bg-surface";

export function Integrations() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const field = q<HTMLElement>("[data-field]")[0];
      const allCells = q<HTMLElement>("[data-cell]");

      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023.98px)",
          fine: "(pointer: fine)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, fine, reduce } = ctx.conditions as {
            desktop: boolean;
            fine: boolean;
            reduce: boolean;
          };
          if (reduce) return; // static field, fully visible

          // Heading: lines rise out of a mask, once.
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
                scrollTrigger: { trigger: q("[data-title]")[0], start: "top 85%", once: true },
              });
            },
          });
          gsap.from(q("[data-intro]"), {
            autoAlpha: 0,
            y: 16,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: q("[data-title]")[0], start: "top 85%", once: true },
          });

          // Only cells laid out at this breakpoint take part (the lg-only fillers are display:none below lg).
          const cells = allCells.filter((c) => c.offsetParent !== null);
          const fills = cells.map((c) => c.querySelector<HTMLElement>("[data-fill]")!);

          // Cell centres relative to the field (layout boxes — transforms don't move them).
          let centres: { x: number; y: number }[] = [];
          let maxDist = 1;
          const measure = () => {
            centres = cells.map((c) => ({ x: c.offsetLeft + c.offsetWidth / 2, y: c.offsetTop + c.offsetHeight / 2 }));
            const cx = field.offsetWidth / 2;
            const cy = field.offsetHeight / 2;
            maxDist = Math.max(1, ...centres.map((p) => Math.hypot(p.x - cx, p.y - cy)));
          };
          measure();
          ScrollTrigger.addEventListener("refresh", measure);

          // Grid stagger from the centre, by true distance (labelled cells span columns, so index maths would skew).
          const fromCentre = (i: number) => {
            const p = centres[i];
            return (Math.hypot(p.x - field.offsetWidth / 2, p.y - field.offsetHeight / 2) / maxDist) * 0.8;
          };

          const touchWave = !(desktop && fine);
          const tl = gsap.timeline({
            scrollTrigger: { trigger: field, start: "top 80%", once: true },
          });
          tl.from(cells, { autoAlpha: 0, yPercent: 35, duration: 0.7, ease: "power3.out", stagger: fromCentre }, 0);

          if (touchWave) {
            // No cursor here: one signal wave rolls out from the centre and fades.
            fills.forEach((fill, i) => {
              const at = 0.5 + fromCentre(i);
              tl.to(fill, { opacity: 1, duration: 0.22, ease: "power2.out" }, at).to(
                fill,
                { opacity: 0, duration: 0.7, ease: "power2.inOut" },
                at + 0.22,
              );
            });
            return () => ScrollTrigger.removeEventListener("refresh", measure);
          }

          // Desktop, fine pointer: cells near the cursor lift and the nearest fill with signal.
          const setY = cells.map((c) => gsap.quickTo(c, "y", { duration: 0.5, ease: "power3" }));
          const setS = cells.map((c) => gsap.quickTo(c, "scale", { duration: 0.5, ease: "power3" }));
          const setO = fills.map((f) => gsap.quickTo(f, "opacity", { duration: 0.35, ease: "power2" }));
          const last = new Float32Array(cells.length);

          const apply = (i: number, t: number) => {
            if (t === last[i]) return;
            last[i] = t;
            setY[i](-LIFT * t);
            setS[i](1 + GROW * t);
            setO[i](Math.pow(t, 2.4)); // fill falls off faster than lift: only the nearest go solid
          };

          const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
            const r = field.getBoundingClientRect();
            const px = e.clientX - r.left;
            const py = e.clientY - r.top;
            for (let i = 0; i < centres.length; i++) {
              const d = Math.hypot(centres[i].x - px, centres[i].y - py);
              const k = Math.max(0, 1 - d / RADIUS);
              apply(i, k * k * (3 - 2 * k)); // smoothstep
            }
          };
          const onLeave = () => {
            for (let i = 0; i < cells.length; i++) apply(i, 0);
          };

          field.addEventListener("pointermove", onMove);
          field.addEventListener("pointerleave", onLeave);
          return () => {
            field.removeEventListener("pointermove", onMove);
            field.removeEventListener("pointerleave", onLeave);
            ScrollTrigger.removeEventListener("refresh", measure);
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="integrations"
      className="relative overflow-hidden bg-bg px-5 py-28 text-ink sm:px-8 lg:px-12 lg:py-40"
    >
      <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-10">
        <div className="lg:col-span-7">
          <p data-intro className="mb-6 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            {copy.eyebrow}
          </p>
          <h2
            data-title
            className="font-stretchable font-display text-5xl font-semibold leading-[0.92] tracking-[-0.035em] text-balance [--wdth:84] sm:text-6xl lg:text-7xl"
          >
            {copy.title}
          </h2>
        </div>
        <p
          data-intro
          className="mt-8 max-w-md text-lg leading-relaxed text-muted text-pretty lg:col-span-4 lg:col-start-9 lg:mt-0"
        >
          {copy.body}
        </p>
      </div>

      <ul className="sr-only">
        {connections.map((c) => (
          <li key={c.label}>{c.label}</li>
        ))}
      </ul>

      <div
        data-field
        aria-hidden
        className="relative mt-16 grid grid-flow-dense grid-cols-8 gap-1 lg:grid-cols-16 lg:gap-1.5"
      >
        {connections.map((c) => (
          <div key={c.label} data-cell className={`${cellCls} flex items-end p-1.5 lg:p-2 ${c.cls}`}>
            <span className={labelCls}>{c.label}</span>
            <span data-fill className="absolute inset-0 flex items-end bg-signal p-1.5 opacity-0 lg:p-2">
              <span className={`${labelCls} text-on-signal`}>{c.label}</span>
            </span>
          </div>
        ))}
        {Array.from({ length: FILL_DESKTOP }, (_, i) => (
          <div
            key={i}
            data-cell
            className={`${cellCls} aspect-square ${i >= FILL_MOBILE ? "hidden lg:block" : ""}`}
          >
            <span data-fill className="absolute inset-0 bg-signal opacity-0" />
          </div>
        ))}
      </div>
    </section>
  );
}

const labelCls = "font-mono text-[10px] uppercase leading-tight tracking-[0.08em]";
