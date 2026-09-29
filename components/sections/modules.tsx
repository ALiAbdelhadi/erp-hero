"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/* ------------------------------------------------------------------ copy -- */

const intro = {
  eyebrow: "The product",
  title: "One record. Six desks.",
  body: "Every department works in its own view of the same data. Nothing is exported, nothing is re-typed.",
};

type Mini = "sales" | "inventory" | "production" | "shipping" | "invoicing" | "ledger";

const modules: { name: string; job: string; caps: [string, string, string]; mini: Mini }[] = [
  {
    name: "Sales",
    job: "Quote to confirmed order in one screen.",
    caps: ["Price lists per customer", "Available-to-promise from live stock", "Credit limit checked on save"],
    mini: "sales",
  },
  {
    name: "Inventory",
    job: "Every bin, every lot, counted once.",
    caps: ["Multi-warehouse and bin locations", "Lot and expiry tracking", "Reorder points that raise POs"],
    mini: "inventory",
  },
  {
    name: "Production",
    job: "Plans that know what's on the shelf.",
    caps: ["Bills of materials with versions", "Capacity by line and shift", "Shortages flagged before the run"],
    mini: "production",
  },
  {
    name: "Shipping",
    job: "Pick, pack, load — scanned, not typed.",
    caps: ["Pick lists by route", "Carrier labels and ASNs", "Proof of delivery on the driver's phone"],
    mini: "shipping",
  },
  {
    name: "Invoicing",
    job: "The invoice leaves with the truck.",
    caps: ["Invoices raised on dispatch", "Partial and consolidated billing", "Payment reminders on schedule"],
    mini: "invoicing",
  },
  {
    name: "Ledger",
    job: "Books that close themselves.",
    caps: ["Every movement posts to the ledger", "Bank feeds matched automatically", "Multi-entity and multi-currency"],
    mini: "ledger",
  },
];

const orderLines = [
  { sku: "TX-88", qty: "240 cs", atp: "✓" },
  { sku: "TX-12", qty: "60 cs", atp: "✓" },
  { sku: "BR-04", qty: "30 cs", atp: "18", short: "short 12" },
];

// 6 × 4 bin grid, fill level per bin (deterministic). Index 8 is the highlighted bin.
const binLevels = [
  "h-[82%]", "h-[40%]", "h-[64%]", "h-[18%]", "h-[92%]", "h-[55%]",
  "h-[30%]", "h-[74%]", "h-[96%]", "h-[46%]", "h-[12%]", "h-[68%]",
  "h-[58%]", "h-[22%]", "h-[86%]", "h-[36%]", "h-[70%]", "h-[50%]",
  "h-[14%]", "h-[62%]", "h-[44%]", "h-[88%]", "h-[26%]", "h-[78%]",
];
const binHighlight = 8;
const binLabel = "A-03-2 · TX-88 · 940";

const ganttHours = ["06:00", "09:00", "12:00", "15:00", "18:00"];
// Positions on a 06:00–18:00 axis (12 h → 100%).
const gantt: { line: string; bars: { at: string; tone: "plain" | "signal" | "short"; label?: string }[] }[] = [
  { line: "Line 1", bars: [{ at: "left-0 w-[33%]", tone: "plain" }, { at: "left-[42%] w-[42%]", tone: "plain" }] },
  { line: "Line 2", bars: [{ at: "left-[8%] w-[50%]", tone: "signal", label: "B-117" }] },
  {
    line: "Line 3",
    bars: [{ at: "left-[4%] w-[25%]", tone: "plain" }, { at: "left-[50%] w-[42%]", tone: "short", label: "short: BR-04" }],
  },
];

const stops = [
  { name: "Halden Foods", done: true },
  { name: "Norvik Market", done: true },
  { name: "Oda Wholesale", done: false },
  { name: "Brenner & Sons", done: false },
];

// Invoice lines = the order's shipped quantities; they sum to the subtotal.
const invoice = {
  number: "INV-0931",
  lines: [
    { sku: "TX-88", qty: "240 cs", amount: "12,480.00" },
    { sku: "TX-12", qty: "60 cs", amount: "3,480.00" },
    { sku: "BR-04", qty: "18 cs", amount: "1,080.00" },
  ],
  subtotal: "$17,040.00",
  tax: "$1,360.00",
  total: 18400,
};

const journal = [
  { side: "Dr", account: "Accounts receivable", debit: "18,400.00", credit: "" },
  { side: "Cr", account: "Revenue", debit: "", credit: "17,040.00" },
  { side: "Cr", account: "Tax payable", debit: "", credit: "1,360.00" },
];

/* -------------------------------------------------------------- helpers -- */

const money = (n: number, decimals: number, prefix = "") =>
  prefix + n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const pad = (i: number) => String(i + 1).padStart(2, "0");

/** The mini-UI entrance for one panel. Built paused; a ScrollTrigger plays it. */
function panelTimeline(panel: HTMLElement) {
  const q = gsap.utils.selector(panel);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out", duration: 0.8 } });

  const rows = q("[data-in]");
  if (rows.length) tl.from(rows, { autoAlpha: 0, x: -14, stagger: 0.06 }, 0);
  const growX = q("[data-grow-x]");
  if (growX.length) tl.from(growX, { scaleX: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, 0.1);
  const growY = q("[data-grow-y]");
  if (growY.length) tl.from(growY, { scaleY: 0, duration: 1, ease: "expo.out", stagger: { each: 0.02, from: "random" } }, 0);
  const pops = q("[data-pop]");
  if (pops.length) tl.from(pops, { scale: 0, autoAlpha: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.12 }, 0.45);

  q<HTMLElement>("[data-count]").forEach((el) => {
    const to = Number(el.dataset.count);
    const dec = Number(el.dataset.decimals ?? 0);
    const prefix = el.dataset.prefix ?? "";
    const n = { v: 0 };
    el.textContent = money(0, dec, prefix);
    tl.to(n, { v: to, duration: 1.2, ease: "power2.out", onUpdate: () => (el.textContent = money(n.v, dec, prefix)) }, 0.3);
  });

  return tl;
}

/** Put every counter back to its real value (markup's final state). */
function restoreCounts(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    el.textContent = money(Number(el.dataset.count), Number(el.dataset.decimals ?? 0), el.dataset.prefix ?? "");
  });
}

/* ------------------------------------------------------------ component -- */

export function Modules() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const pinWrap = q<HTMLElement>("[data-pin]")[0];
      const viewport = q<HTMLElement>("[data-viewport]")[0];
      const row = q<HTMLElement>("[data-row]")[0];
      const panels = q<HTMLElement>("[data-panel]");
      const segs = q<HTMLElement>("[data-seg]");
      const railLabel = q<HTMLElement>("[data-rail-label]")[0];

      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023.98px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
          if (reduce) return; // markup is the final state; the row is stacked by motion-safe classes

          // Intro: heading lines rise from a mask, body follows.
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
                scrollTrigger: { trigger: self.elements[0], start: "top 85%", toggleActions: "play none none none" },
              });
            },
          });
          gsap.from(q("[data-intro]"), {
            autoAlpha: 0,
            y: 16,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: q("[data-intro-block]")[0], start: "top 80%", toggleActions: "play none none none" },
          });

          if (!desktop) {
            // Stacked panels: each mini-UI plays once as it comes in.
            panels.forEach((panel) => {
              const tl = panelTimeline(panel);
              ScrollTrigger.create({ trigger: panel, start: "top 75%", once: true, onEnter: () => tl.play() });
            });
            return () => restoreCounts(root.current!);
          }

          // Desktop: pin the track, slide the row by exactly its overflow.
          gsap.set(viewport, { overflow: "hidden" }); // no-JS fallback is a native horizontal scroller
          const distance = () => Math.max(0, row.scrollWidth - viewport.clientWidth);

          const setRail = (p: number) => {
            segs.forEach((seg, i) => gsap.set(seg, { scaleX: gsap.utils.clamp(0, 1, p * segs.length - i) }));
            const i = Math.min(modules.length - 1, Math.floor(p * modules.length));
            railLabel.textContent = `${pad(i)} · ${modules[i].name}`;
          };

          const track = gsap.to(row, {
            x: () => -distance(),
            ease: "none",
            onUpdate() {
              setRail(this.progress());
            },
            scrollTrigger: {
              trigger: pinWrap,
              start: "top top",
              end: () => "+=" + distance(),
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });
          setRail(0);

          panels.forEach((panel, i) => {
            const tl = panelTimeline(panel);
            if (i === 0) {
              // Already on screen when the pin starts: play on approach instead.
              ScrollTrigger.create({ trigger: pinWrap, start: "top 60%", once: true, onEnter: () => tl.play() });
            } else {
              ScrollTrigger.create({
                trigger: panel,
                containerAnimation: track,
                start: "left 70%",
                once: true,
                onEnter: () => tl.play(),
              });
            }
          });

          return () => restoreCounts(root.current!);
        },
      );
    },
    { scope: root },
  );

  return (
    <section id="product" ref={root} className="relative overflow-hidden bg-ink text-bg">
      <div data-intro-block className="px-5 pb-16 pt-28 sm:px-8 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:px-12 lg:pt-40">
        <div className="lg:col-span-7">
          <p data-intro className="mb-6 font-mono text-xs uppercase tracking-[0.14em] text-bg/55">
            {intro.eyebrow}
          </p>
          <h2
            data-title
            className="font-stretchable font-display text-5xl font-semibold leading-[0.92] tracking-[-0.035em] [--wdth:84] sm:text-6xl lg:text-7xl"
          >
            {intro.title}
          </h2>
        </div>
        <p
          data-intro
          className="mt-8 max-w-md text-lg leading-relaxed text-bg/55 text-pretty lg:col-span-4 lg:col-start-9 lg:mt-0 lg:self-end"
        >
          {intro.body}
        </p>
      </div>

      <div
        data-pin
        className="lg:motion-safe:flex lg:motion-safe:h-svh lg:motion-safe:flex-col lg:motion-safe:justify-center"
      >
        <div data-viewport className="lg:motion-safe:overflow-x-auto">
          <ol
            data-row
            className="flex flex-col px-5 pb-20 will-change-transform sm:px-8 lg:px-12 lg:motion-safe:w-max lg:motion-safe:flex-row lg:motion-safe:pb-0"
          >
            {modules.map((m, i) => (
              <Panel key={m.name} index={i} module={m} />
            ))}
          </ol>
        </div>

        <div
          aria-hidden
          className="hidden items-center gap-6 px-12 pt-8 font-mono text-xs uppercase tracking-[0.14em] lg:motion-safe:flex"
        >
          <span data-rail-label className="w-40 shrink-0">
            01 · Sales
          </span>
          <span className="grid flex-1 grid-cols-6 gap-1.5">
            {modules.map((m) => (
              <span key={m.name} className="relative h-1 overflow-hidden bg-bg/15">
                <span data-seg className="absolute inset-0 origin-left bg-signal" />
              </span>
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}

function Panel({ module: m, index }: { module: (typeof modules)[number]; index: number }) {
  return (
    <li
      data-panel
      className="flex flex-col border-t border-bg/15 py-14 lg:motion-safe:h-[72svh] lg:motion-safe:w-[64vw] lg:motion-safe:shrink-0 lg:motion-safe:border-l lg:motion-safe:border-t-0 lg:motion-safe:px-10 lg:motion-safe:py-2 lg:motion-safe:last:border-r"
    >
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-bg/55">{pad(index)}</p>
      <h3 className="font-stretchable mt-3 font-display text-5xl font-semibold leading-[0.9] tracking-[-0.035em] [--wdth:84] sm:text-6xl lg:text-7xl lg:[--wdth:110] xl:text-8xl">
        {m.name}
      </h3>

      <div className="mt-10 grid flex-1 gap-10 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="font-stretchable font-display text-2xl font-semibold leading-tight tracking-tight [--wdth:84]">
            {m.job}
          </p>
          <ul className="mt-6 space-y-3 text-bg/70">
            {m.caps.map((c) => (
              <li key={c} className="flex items-baseline gap-3">
                <span aria-hidden className="size-2 shrink-0 translate-y-[-0.1em] bg-signal" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div aria-hidden className="border border-bg/15 bg-bg/5 p-5 font-mono text-xs">
          <MiniUI kind={m.mini} />
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------- mini UIs -- */

function Head({ children }: { children: ReactNode }) {
  return <div className="mb-3 flex justify-between border-b border-bg/15 pb-2 uppercase tracking-[0.12em] text-bg/55">{children}</div>;
}

function MiniUI({ kind }: { kind: Mini }) {
  switch (kind) {
    case "sales":
      return (
        <>
          <Head>
            <span className="w-16">SKU</span>
            <span className="flex-1 text-right">Qty</span>
            <span className="w-28 text-right">ATP</span>
          </Head>
          <ul className="space-y-1">
            {orderLines.map((l) => (
              <li data-in key={l.sku} className="flex items-center border-b border-bg/10 py-2 tabular-nums">
                <span className="w-16">{l.sku}</span>
                <span className="flex-1 text-right">{l.qty}</span>
                <span className="flex w-28 items-center justify-end gap-2">
                  {l.short && (
                    <span data-pop className="bg-signal px-1.5 py-0.5 text-on-signal">
                      {l.short}
                    </span>
                  )}
                  {l.atp}
                </span>
              </li>
            ))}
          </ul>
        </>
      );

    case "inventory":
      return (
        <>
          <div className="grid grid-cols-6 gap-1">
            {binLevels.map((h, i) => (
              <span
                key={i}
                className={`relative h-9 border ${i === binHighlight ? "border-signal outline-1 outline-signal" : "border-bg/15"}`}
              >
                <span
                  data-grow-y
                  className={`absolute inset-x-0 bottom-0 origin-bottom ${h} ${i === binHighlight ? "bg-signal" : "bg-bg/25"}`}
                />
              </span>
            ))}
          </div>
          <p data-in className="mt-4 flex items-center gap-2 tabular-nums">
            <span className="size-2 bg-signal" />
            {binLabel}
          </p>
        </>
      );

    case "production":
      return (
        <>
          <div className="mb-3 flex justify-between ps-16 text-bg/55 tabular-nums">
            {ganttHours.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          <ul className="space-y-2">
            {gantt.map((r) => (
              <li key={r.line} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-bg/55">{r.line}</span>
                <span className="relative h-7 flex-1 border-y border-bg/10">
                  {r.bars.map((b, j) => (
                    <span
                      key={j}
                      data-grow-x
                      className={`absolute inset-y-1 flex origin-left items-center overflow-hidden whitespace-nowrap px-1.5 ${b.at} ${
                        b.tone === "signal"
                          ? "bg-signal text-on-signal"
                          : b.tone === "short"
                            ? "border border-dashed border-signal"
                            : "bg-bg/20"
                      }`}
                    >
                      {b.label}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </>
      );

    case "shipping":
      return (
        <ol className="space-y-1">
          {stops.map((s, i) => (
            <li data-in key={s.name} className="flex items-center gap-3 border-b border-bg/10 py-2.5">
              <span className="w-5 text-bg/55 tabular-nums">{pad(i)}</span>
              <span className="flex-1">{s.name}</span>
              {s.done ? (
                <span data-pop className="grid size-5 place-items-center bg-signal text-on-signal">
                  ✓
                </span>
              ) : (
                <span className="size-5 border border-bg/30" />
              )}
            </li>
          ))}
        </ol>
      );

    case "invoicing":
      return (
        <>
          <Head>
            <span>{invoice.number}</span>
            <span>USD</span>
          </Head>
          <ul>
            {invoice.lines.map((l) => (
              <li data-in key={l.sku} className="flex gap-3 py-1.5 tabular-nums">
                <span className="w-14">{l.sku}</span>
                <span className="flex-1 text-bg/55">{l.qty}</span>
                <span>{l.amount}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-bg/15 pt-3 tabular-nums">
            <div className="flex justify-between text-bg/55">
              <dt>Subtotal</dt>
              <dd>{invoice.subtotal}</dd>
            </div>
            <div className="flex justify-between text-bg/55">
              <dt>Tax</dt>
              <dd>{invoice.tax}</dd>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <dt>Total</dt>
              <dd
                data-count={invoice.total}
                data-decimals={2}
                data-prefix="$"
                className="font-stretchable font-display text-2xl font-semibold tabular-nums [--wdth:84]"
              >
                {money(invoice.total, 2, "$")}
              </dd>
            </div>
          </dl>
        </>
      );

    case "ledger":
      return (
        <>
          <Head>
            <span className="flex-1">Account</span>
            <span className="w-20 text-right sm:w-24">Debit</span>
            <span className="w-20 text-right sm:w-24">Credit</span>
          </Head>
          <ul>
            {journal.map((j) => (
              <li data-in key={j.account} className="flex border-b border-bg/10 py-2 tabular-nums">
                <span className={`flex-1 ${j.side === "Cr" ? "ps-4" : ""}`}>
                  <span className="text-bg/55">{j.side}</span> {j.account}
                </span>
                <span className="w-20 text-right sm:w-24">{j.debit}</span>
                <span className="w-20 text-right sm:w-24">{j.credit}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <span data-pop className="bg-signal px-2 py-1 uppercase tracking-[0.12em] text-on-signal">
              Balanced
            </span>
          </div>
        </>
      );
  }
}
