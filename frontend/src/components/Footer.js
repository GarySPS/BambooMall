// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaEnvelope, FaLock, FaCheckCircle, FaCreditCard } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900 font-sans text-sm">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Column 1: Brand & Contact (CRITICAL FOR TRUST SCORE) */}
        <div className="col-span-1">
          <div className="flex items-center gap-2 mb-4 text-white">
            <span className="text-lg font-bold tracking-tight">BambooMall</span>
          </div>
          <p className="text-slate-500 leading-relaxed mb-6 text-sm">
            Premium ex-factory surplus goods directly from top manufacturers. 
            Authentic quality without the retail markup.
          </p>
          
          {/* Trust Signal: Physical Address */}
          <div className="space-y-3 text-xs text-slate-400">
             <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-emerald-500" />
                <span>
                  2666 Keyuan South Road<br/>
                  Nanshan District, Shenzhen, 518052
                </span>
             </div>
             <div className="flex items-center gap-3">
                <FaEnvelope className="text-emerald-500" />
                <a href="mailto:support@bamboomall.store" className="hover:text-white transition">
                  support@bamboomall.store
                </a>
             </div>
          </div>
        </div>

        {/* Column 2: Customer Care */}
        <div>
          <h3 className="text-slate-100 font-semibold mb-4 text-xs uppercase tracking-wider">Customer Care</h3>
          <ul className="space-y-3 text-slate-500">
            <li><Link to="/track-order" className="hover:text-emerald-400 transition">Track My Order</Link></li>
            <li><Link to="/shipping" className="hover:text-emerald-400 transition">Shipping & Delivery</Link></li>
            <li><Link to="/returns" className="hover:text-emerald-400 transition">Returns Policy</Link></li>
            <li><Link to="/faq" className="hover:text-emerald-400 transition">Help Center</Link></li>
          </ul>
        </div>

        {/* Column 3: Legal & Corporate */}
        <div>
          <h3 className="text-slate-100 font-semibold mb-4 text-xs uppercase tracking-wider">Company</h3>
          <ul className="space-y-3 text-slate-500">
            <li><Link to="/about" className="hover:text-emerald-400 transition">About BambooMall</Link></li>
            <li><Link to="/terms" className="hover:text-emerald-400 transition">Terms of Sale</Link></li>
            <li><Link to="/privacy" className="hover:text-emerald-400 transition">Privacy Policy</Link></li>
            <li><Link to="/intellectual-property" className="hover:text-emerald-400 transition">IP Disclaimer</Link></li>
          </ul>
        </div>

        {/* Column 4: Trust Badges */}
        <div>
           <h3 className="text-slate-100 font-semibold mb-4 text-xs uppercase tracking-wider">Shopping Security</h3>
           
           <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2 font-medium text-xs">
                 <FaLock /> SSL SECURE CHECKOUT
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                 Your data is protected by 256-bit encryption. We do not sell your personal information.
              </p>
           </div>

           <div className="flex gap-3 text-2xl text-slate-600">
              <FaCreditCard title="Visa/Mastercard" />
              <FaCheckCircle title="Verified Merchant" />
           </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1400px] mx-auto px-6 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
        <p>© 2026 BambooMall. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
           <span>Ex-Factory Resale</span>
           <span>Global Shipping</span>
        </div>
      </div>
    </footer>
  );
}