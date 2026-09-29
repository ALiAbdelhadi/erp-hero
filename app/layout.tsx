import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Tessera — one ledger for the whole company",
  description:
    "ERP for manufacturers and distributors. Sales, stock, production and finance on one live record.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrument.variable} ${plexMono.variable} antialiased`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
