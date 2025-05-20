import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import ToasterProvider from "@/context/ToasterProvider";
import { cn } from "@/lib/utils";
import { SpeedInsights } from "@vercel/speed-insights/next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BD Ship Mart",
  description: "E-commerce store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-background text-foreground`,
        )}
      >
        <ToasterProvider />
        <AuthProvider>{children}</AuthProvider>
        <SpeedInsights /> 
      </body>
    </html>
  );
}
