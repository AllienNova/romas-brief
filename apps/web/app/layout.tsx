import "./globals.css";
import type { Metadata } from "next";

// T-101 stub: cascade force-dynamic to all routes (incl. auto 404/500)
// to bypass Next 14 + Node 24 + Windows static-prerender bug.
// M3 (T-301..) re-enables ISR per route on real Cloudflare Pages build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "ROMAS Brief", template: "%s · ROMAS Brief" },
  description: "Radiation oncology, decoded daily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
