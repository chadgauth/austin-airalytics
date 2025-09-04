import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { TRPCProvider } from "@/lib/trpc/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rental Insight Pro - Airbnb Analytics Dashboard",
  description: "Advanced analytics and insights for Airbnb rental properties",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <React.StrictMode>
          <TRPCProvider>
            <main className="flex-1">{children}</main>
          </TRPCProvider>
        </React.StrictMode>
      </body>
    </html>
  );
}
