import type { Metadata } from "next";
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
      <body className="bg-gray-50 min-h-screen">
        {/* Navbar sederhana untuk navigasi testing */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-bold text-lg text-gray-900">
              OnlineShop
            </a>
            <div className="flex gap-4">
              <a href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </a>
              <a href="/register" className="text-gray-600 hover:text-gray-900">
                Register
              </a>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
