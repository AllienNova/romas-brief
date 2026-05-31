import "./globals.css";
import type { Metadata } from "next";

// T-101 stub: cascade force-dynamic to all routes. CMS will be fully
// dynamic in production (Cloudflare Access-gated editorial console).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "ROMAS Wire CMS", template: "%s · ROMAS Wire CMS" },
  description: "Internal editorial CMS for ROMAS Wire. Cloudflare Access-gated.",
  robots: { index: false, follow: false },
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
