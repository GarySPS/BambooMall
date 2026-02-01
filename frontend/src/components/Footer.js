// src/components/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import { FaGlobeAsia, FaLock, FaShieldAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900 font-sans text-xs">
      <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Column 1: Corporate Identity */}
        <div className="col-span-1">
          <div className="flex items-center gap-2 mb-4 text-slate-200">
            <FaGlobeAsia />
            <span className="text-sm font-bold uppercase tracking-widest">BambooMall SCM</span>
          </div>
          <p className="text-slate-500 leading-relaxed mb-4">
            Authorized liquidation clearinghouse for Tier-1 manufacturing assets. 
            Regulated by the Shenzhen Municipal Bureau of Commerce.
          </p>
          <div className="text-[10px] font-mono text-slate-600">
             <div>ICP License: 粤B2-20240091</div>
             <div>Export Permit: SZ-EX-9920</div>
          </div>
        </div>

        {/* Column 2: Operations */}
        <div>
          <h3 className="text-slate-200 font-bold mb-4 uppercase tracking-widest text-[10px]">Operations</h3>
          <ul className="space-y-2 font-mono text-[11px]">
            <li><Link to="/products" className="hover:text-blue-400 transition">Master Manifest</Link></li>
            <li><Link to="/compliance" className="hover:text-blue-400 transition">Shipping Tariffs (2026)</Link></li>
            <li><Link to="/membership" className="hover:text-blue-400 transition">Partner Tiers</Link></li>
          </ul>
        </div>

        {/* Column 3: Compliance */}
        <div>
          <h3 className="text-slate-200 font-bold mb-4 uppercase tracking-widest text-[10px]">Compliance</h3>
          <ul className="space-y-2 font-mono text-[11px]">
            <li><Link to="/terms" className="hover:text-blue-400 transition">Master Service Agreement</Link></li>
            <li><Link to="/privacy" className="hover:text-blue-400 transition">Data Sovereignty Policy</Link></li>
            <li><Link to="/faq" className="hover:text-blue-400 transition">Settlement Protocols</Link></li>
          </ul>
        </div>

        {/* Column 4: Secure Status */}
        <div>
           <div className="bg-slate-900 p-4 border border-slate-800 rounded">
              <div className="flex items-center gap-2 text-emerald-500 mb-2 font-bold">
                 <FaLock size={12} /> SSL ENCRYPTED
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                 All connections are secured via TLS 1.3. 
                 Transaction data is stored in Hong Kong SAR compliant data centers.
              </p>
           </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1600px] mx-auto px-6 pt-8 border-t border-slate-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-600 font-mono">
        <p>© 2026 BambooMall Supply Chain Management (Shenzhen) Co., Ltd.</p>
        <div className="flex gap-4 mt-4 md:mt-0 items-center">
           <FaShieldAlt />
           <span>ANTI-FRAUD MONITORING ACTIVE</span>
        </div>
      </div>
    </footer>
  );
}