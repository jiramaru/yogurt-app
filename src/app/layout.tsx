import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Délices d'Isy - Yogurt Artisanal",
  description: "Découvrez nos yogurts artisanaux préparés avec passion pour éveiller vos papilles",
  keywords: ["yogurt", "shop", "dessert", "healthy", "food"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <Header />
            <main className="flex-grow pt-[60px] md:pt-0">{children}</main>
            <Footer />
            <Toaster position="bottom-right" richColors />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
