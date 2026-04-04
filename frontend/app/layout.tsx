import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
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
      <body className="bg-[#f4f4f0] min-h-screen flex flex-col font-sans selection:bg-[#FF5E00] selection:text-white">
        <Navbar />
        <main className="grow pt-0 pb-0">{children}</main>
      </body>
    </html>
  );
}
