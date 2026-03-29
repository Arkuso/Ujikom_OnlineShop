import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnlineShop",
  description: "Online Shop Testing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen flex flex-col font-sans selection:bg-[#FF5E00] selection:text-white">
        <Navbar />
        <main className="grow pt-24 pb-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
