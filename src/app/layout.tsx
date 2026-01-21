import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GreenSpaceMap | Discover Your Local Urban Oases",
  description:
    "Explore, navigate, and enjoy the urban green spaces around you. GreenSpaceMap provides real-time data and routing to parks, forests, and gardens in your city.",
  keywords: [
    "green spaces",
    "parks",
    "urban nature",
    "city map",
    "environment",
    "navigation",
  ],
  authors: [{ name: "Gabriel Nathanael" }],
  openGraph: {
    title: "GreenSpaceMap - Urban Green Space Explorer",
    description: "Navigate and discover urban green spaces in your city.",
    url: "https://greenspacemap.gabrielnathanael.site",
    siteName: "GreenSpaceMap",
    images: [
      {
        url: "/graph.png",
        width: 1200,
        height: 630,
        alt: "GreenSpaceMap Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenSpaceMap - Urban Green Space Explorer",
    description: "Navigate and discover urban green spaces in your city.",
    images: ["/graph.png"],
  },
  icons: {
    icon: "/graph.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="font-inter antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
