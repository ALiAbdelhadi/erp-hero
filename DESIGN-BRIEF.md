# Design Brief — Tessera ERP landing page

Deliverable   : full landing page (Next.js 16 · GSAP 3.15 · Tailwind v4 · TS)
Brand owner   : none yet — "Tessera" is a placeholder name (a tessera is one tile of a mosaic)
Subject       : ERP for manufacturers & distributors. Audience: COO / CFO of a mid-size company.
Page job      : make "one live record for the whole company" felt in 5 seconds, then "Book a demo".
Direction     : frontend-design — one-off page that must not look like a templated SaaS/ERP site.
Risk taken    : no dashboard screenshot. The hero IS the product argument: six department tiles
                start scattered ("six systems that don't talk"), assemble into one mosaic on
                scroll, then a single sales order travels through all six and updates each one.
Palette       : warehouse floor — concrete #D8D9D3, paper #F3F3EF, graphite #15171A,
                steel #676C71, rule #BDBFB8, signal yellow #FFD60A (floor-marking tape, the only accent).
                Dark: bg #111314, surface #1B1E20, ink #ECEDE8, muted #8E9398, rule #2E3235, signal #F5CD12.
                ui-ux-pro-max suggested indigo/violet + Plus Jakarta Sans — rejected on purpose:
                that is exactly the traditional ERP look the brief rules out.
Type          : display Archivo (variable width 62–125 — width itself is animated),
                body Instrument Sans, utility IBM Plex Mono (SKU / doc numbers / log). Latin only.
Tokens        : app/globals.css (:root semantic vars → @theme inline)
Motion        : GSAP for all choreography (CSS transitions for hover colour only). One orchestrated moment: pinned scroll story (assemble → order flows).
                Load: headline lines rise from a mask while width expands 62 → 84.
                Reduced motion / < 1024px: no pin, final state shown.
Sections      : one signature device each — never repeated (device ledger):
                0 Hero (concrete)        pinned scrub: tiles assemble, an order travels the mosaic
                1 Problem (concrete)     scroll-scrubbed word reveal + "entry N" re-typing chips
                2 Modules (graphite)     pinned horizontal track, six live mini-UIs (containerAnimation)
                3 Close (paper)          debit/credit columns converge to Balanced, checklist draws
                4 Integrations (concrete) cursor-reactive tesserae field (quickTo)
                5 Rollout (paper)        drawn rail + travelling token + odometer numerals
                6 CTA (signal) + footer  pointer-driven width axis, magnetic button, giant wordmark
                Page: ScrollSmoother (pointer: fine, no reduced motion only). hazard stripe: ticker + CTA/footer seam only.
Out of scope  : real product copy (all placeholder), Arabic, pricing/customers (no real data to show).
Trend refs    : Linear (product is the demo), Jeton (scroll-scrubbed morph), Mat Voyce (kinetic type),
                Attio (mono + one accent, live ticker).
