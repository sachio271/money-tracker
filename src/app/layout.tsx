import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/bottom-nav";
import NextTopLoader from "nextjs-toploader";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#111827",
};

export const metadata: Metadata = {
  title: "Money Tracker",
  description: "Personal money management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Money Tracker",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans">
        <NextTopLoader color="#111827" height={3} showSpinner={false} />
        <div className="pb-20">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
