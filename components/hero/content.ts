// Placeholder copy for the Tessera hero. Every string the hero renders lives here.

export type Step = {
  dept: string;
  doc: string;
  /** Status before / after the order passes through. */
  before: string;
  after: string;
  /** When set, the value counts between these numbers instead of swapping text. */
  count?: { from: number; to: number; prefix?: string };
  /** Grid cell on desktop — the order snakes left→right, then right→left. */
  cell: string;
  /** Where the tile sits before the mosaic assembles (percent of its own size, degrees). */
  scatter: { x: number; y: number; r: number };
};

export const nav = {
  links: [
    { label: "Product", href: "#product" },
    { label: "Finance", href: "#finance" },
    { label: "Integrations", href: "#integrations" },
    { label: "Rollout", href: "#rollout" },
  ],
  signIn: "Sign in",
  demo: "Book a demo",
};

export const hero = {
  eyebrow: "ERP for manufacturers & distributors",
  lines: ["Every order,", "every pallet,", "one ledger."],
  body: "Tessera runs sales, stock, production and finance on one live record. When a pallet leaves Dock 3, the stock count, the invoice and the books already know.",
  primary: "Book a demo",
  secondary: "Follow an order",
  captionBefore: "Today — six tools, six versions of the truth",
  captionAfter: "Tessera — one record, every department",
  order: "SO-4821",
};

export const steps: Step[] = [
  {
    dept: "Sales",
    doc: "SO-4821 · Halden Foods",
    before: "Draft",
    after: "Confirmed",
    cell: "lg:col-start-1 lg:row-start-1",
    scatter: { x: -30, y: 55, r: -9 },
  },
  {
    dept: "Inventory",
    doc: "SKU TX-88 · on hand",
    before: "",
    after: "",
    count: { from: 1180, to: 940 },
    cell: "lg:col-start-2 lg:row-start-1",
    scatter: { x: 25, y: -35, r: 7 },
  },
  {
    dept: "Production",
    doc: "Line 2 · batch B-117",
    before: "Queued",
    after: "Completed",
    cell: "lg:col-start-3 lg:row-start-1",
    scatter: { x: 40, y: 70, r: 12 },
  },
  {
    dept: "Shipping",
    doc: "Dock 3 · truck 14",
    before: "Waiting",
    after: "Loaded",
    cell: "lg:col-start-3 lg:row-start-2",
    scatter: { x: 15, y: 30, r: -6 },
  },
  {
    dept: "Invoicing",
    doc: "INV-0931 · net 30",
    before: "",
    after: "",
    count: { from: 0, to: 18400, prefix: "$" },
    cell: "lg:col-start-2 lg:row-start-2",
    scatter: { x: -20, y: -60, r: -14 },
  },
  {
    dept: "Ledger",
    doc: "Accounts receivable",
    before: "Unposted",
    after: "Balanced",
    cell: "lg:col-start-1 lg:row-start-2",
    scatter: { x: -45, y: 10, r: 5 },
  },
];

export const log = [
  "06:02:14  B-117 started on Line 2",
  "07:48:30  SO-4821 confirmed · Halden Foods · 240 cases",
  "08:15:02  TX-88 stock −240 · 940 on hand",
  "09:41:07  Truck 14 loaded at Dock 3",
  "09:41:08  INV-0931 issued · $18,400",
  "09:41:08  AR posted · ledger balanced",
  "10:02:51  PO-2210 raised · reorder TX-88",
];
