// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { ReactComponent as Logo } from "./logo.svg"; // Assuming you have this from your Navbar

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t-4 border-emerald-600">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Column 1: Brand Info */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Logo className="w-8 h-8 text-emerald-500" />
            <span className="text-xl font-bold text-white">BambooMall</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            The official China factory direct resale market. Connecting global buyers with verified manufacturers for the lowest wholesale prices.
          </p>
          <div className="flex gap-4">
            <FaFacebook className="hover:text-emerald-500 cursor-pointer transition" size={20} />
            <FaInstagram className="hover:text-emerald-500 cursor-pointer transition" size={20} />
            <FaTwitter className="hover:text-emerald-500 cursor-pointer transition" size={20} />
            <FaLinkedin className="hover:text-emerald-500 cursor-pointer transition" size={20} />
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-emerald-500 transition">All Products</Link></li>
            <li><Link to="/news" className="hover:text-emerald-500 transition">New Arrivals</Link></li>
            <li><Link to="/membership" className="hover:text-emerald-500 transition">Membership Tiers</Link></li>
            <li><Link to="/balance" className="hover:text-emerald-500 transition">My Balance</Link></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/faq" className="hover:text-emerald-500 transition">Help Center</Link></li>
            <li><Link to="/about-us" className="hover:text-emerald-500 transition">About BambooMall</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-500 transition">Contact Support</Link></li>
            <li><a href="mailto:support@bamboomall.store" className="hover:text-emerald-500 transition">Report Abuse</a></li>
          </ul>
        </div>

        {/* Column 4: Legal (THE IMPORTANT PART) */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/terms" className="hover:text-emerald-500 transition">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-emerald-500 transition">Privacy Policy</Link></li>
            <li><Link to="/cookies" className="hover:text-emerald-500 transition">Cookie Policy</Link></li>
            <li className="text-gray-500 pt-2 text-xs">HK Business Reg: 59382-A</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-gray-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p>© 2026 BambooMall International Ltd. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <span>Secure Payment:</span>
          <span className="text-gray-400">USDT / KPay / Visa</span>
        </div>
      </div>
    </footer>
  );
}