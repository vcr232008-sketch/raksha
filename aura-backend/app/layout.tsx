import "./globals.css";
import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-serif" });
const sans = Jost({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Aura Boutique | Luxury Fashion Design",
  description: "Handcrafted dresses, sarees and tailored sets by Aura Boutique.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
