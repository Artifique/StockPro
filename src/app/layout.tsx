import type { Metadata } from "next";
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
  title: "StockPro Manager - Gestion de Stock",
  description: "Application de gestion de stock pour commerçants et boutiques. Gérez vos produits, clients, ventes et rapports avec efficacité.",
  keywords: ["StockPro", "Gestion de stock", "Commerce", "Boutique", "POS", "Inventaire"],
  authors: [{ name: "StockPro Team" }],
  icons: {
    icon: "/logo-stockpro.png",
  },
  openGraph: {
    title: "StockPro Manager",
    description: "Application de gestion de stock pour commerçants et boutiques",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
