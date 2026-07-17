import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PeopleMeet — Live People & Proximity Radar",
  description: "Live proximity radar to find people, verified PGs, flats & tiffins across your city.",
  applicationName: "PeopleMeet",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PeopleMeet",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#07090f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${outfit.className} ${geistSans.variable} ${geistMono.variable} antialiased dark`}
      suppressHydrationWarning
    >
      <body className={`min-h-[100dvh] overscroll-none overflow-x-hidden w-full ${outfit.className}`}>
        {children}
      </body>
    </html>
  );
}
