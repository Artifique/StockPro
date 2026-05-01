import type { Metadata } from "next";
import "./globals.css";

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
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
