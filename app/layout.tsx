import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ORA — The Self-Sustaining Floating Haven", template: "%s · ORA" },
  description: "Explore ORA, an immersive cinematic architectural visualization by Mohannad Haikal: a self-sustaining floating haven shaped by water, ecology and light.",
  keywords: ["ORA floating haven", "Mohannad Haikal", "architectural visualization", "floating architecture", "sustainable architecture", "cinematic archviz", "biophilic design", "self-sustaining home"],
  authors: [{ name: "Mohannad Haikal" }],
  creator: "Mohannad Haikal",
  category: "architecture",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "ORA — The Self-Sustaining Floating Haven",
    description: "A cinematic architectural experience by Mohannad Haikal, shaped by water, ecology and light.",
    siteName: "ORA",
  },
  twitter: {
    card: "summary",
    title: "ORA — The Self-Sustaining Floating Haven",
    description: "A cinematic architectural experience by Mohannad Haikal.",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#06110e" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
