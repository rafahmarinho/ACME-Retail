import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { Suspense } from "react";
import { StoreShell } from "@/components/shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "ACME Retail", template: "%s · ACME Retail" },
  description: "Everyday goods with search, checkout, orders, and a staff back office.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<p style={{ padding: 24 }}>Loading ACME Retail…</p>}>
          <StoreShell>{children}</StoreShell>
        </Suspense>
      </body>
    </html>
  );
}
