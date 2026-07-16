import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stay & Dine — Find People, PGs, Flats & Tiffin Near You",
  description: "Live proximity radar to find students, verified PGs, flats & tiffin centers across Patna, Ranchi & Delhi.",
  applicationName: "Stay&Dine",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stay&Dine",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
