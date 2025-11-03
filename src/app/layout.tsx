import type { Metadata } from "next";
import { Nunito, Geist_Mono, Quicksand } from "next/font/google";
import "./globals.css";
import ModalProvider from "@/providers/modal-provider";
import CartProvider from "@/providers/cart-provider";
import Navbar from "@/components/navbar";
import PageLoading from "@/components/page-loading";
import Footer from "@/components/footer";
import { LoadingProvider } from "@/providers/loading-provider";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jajanan Subuh",
  description: "Jajanan Subuh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${nunito.variable} ${geistMono.variable} ${quicksand.variable} antialiased min-h-svh flex flex-col`}
      >
        <LoadingProvider>
          <CartProvider>
            <ModalProvider />
            <Navbar />
            <PageLoading />
            <Toaster position="top-center" />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
