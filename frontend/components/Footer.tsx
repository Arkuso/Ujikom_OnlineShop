"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0E0E12] border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF5E00] flex items-center justify-center rounded-sm rotate-45">
                <span className="text-white font-black text-xl -rotate-45">G</span>
              </div>
              <span className="text-white font-black text-2xl tracking-tighter uppercase italic">
                GRAVITY<span className="text-[#FF5E00] not-italic">SHOP</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Providing premium products and high-quality gadgets for the tech-savvy generation. Experience the gravity of quality.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Sitemap</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="text-gray-500 hover:text-[#FF5E00] transition-colors text-sm uppercase font-bold tracking-widest">Products</Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-500 hover:text-[#FF5E00] transition-colors text-sm uppercase font-bold tracking-widest">Profile</Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-500 hover:text-[#FF5E00] transition-colors text-sm uppercase font-bold tracking-widest">Cart</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Support</h4>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-gray-500 hover:text-[#FF5E00] transition-colors text-sm uppercase font-bold tracking-widest">Help Center</Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-[#FF5E00] transition-colors text-sm uppercase font-bold tracking-widest">Shipping Policy</Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-[#FF5E00] transition-colors text-sm uppercase font-bold tracking-widest">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Newsletter</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              Stay updated with the latest drops and exclusive offers.
            </p>
            <div className="flex bg-white/5 border border-white/10 p-1">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="bg-transparent border-none focus:outline-none text-xs text-white px-3 py-2 w-full font-bold tracking-widest placeholder:text-gray-600"
              />
              <button className="bg-[#FF5E00] text-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-[#e65500] transition-colors">
                SUBMIT
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 text-[10px] uppercase font-black tracking-[0.3em]">
            &copy; {currentYear} GRAVITYSHOP. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-gray-600 hover:text-white transition-colors text-[10px] uppercase font-black tracking-[0.3em]">Instagram</Link>
            <Link href="#" className="text-gray-600 hover:text-white transition-colors text-[10px] uppercase font-black tracking-[0.3em]">Twitter</Link>
            <Link href="#" className="text-gray-600 hover:text-white transition-colors text-[10px] uppercase font-black tracking-[0.3em]">Facebook</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
