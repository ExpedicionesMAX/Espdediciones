import type { Metadata } from "next";
import { Inter, Fraunces, Oswald, Anton, Montserrat } from "next/font/google";
import { getBaseUrl } from "@/lib/base-url";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Tipografías de títulos elegibles desde el panel (ver src/lib/fonts.ts)
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "Cumbre — Expediciones y montañismo",
    template: "%s · Cumbre",
  },
  description:
    "Expediciones fotográficas, montañismo, trekking y travesías de naturaleza.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${fraunces.variable} ${oswald.variable} ${anton.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
