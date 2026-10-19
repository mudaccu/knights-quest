import type { Metadata, Viewport } from "next";
import { Alegreya, Alegreya_SC, Cinzel } from "next/font/google";
import "./globals.css";
import "./world.css";

// One book family for reading (Alegreya) and its true small caps for headings and labels;
// Cinzel's Roman capitals are kept only for the wordmark.
const alegreya = Alegreya({ variable: "--font-alegreya", subsets: ["latin"], weight: ["400", "500", "700"], style: ["normal", "italic"], display: "swap" });
const alegreyaSC = Alegreya_SC({ variable: "--font-alegreya-sc", subsets: ["latin"], weight: ["500", "700"], display: "swap" });
const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["600"], display: "swap" });

export const metadata: Metadata = {
  title: "Knights Quest — A Living Journal",
  description: "Manage your real-life quests, notes and reflections through the journey of a wandering knight.",
  icons: { icon: "/crest.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0e14",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${alegreya.variable} ${alegreyaSC.variable} ${cinzel.variable}`}>
      <body>{children}</body>
    </html>
  );
}
