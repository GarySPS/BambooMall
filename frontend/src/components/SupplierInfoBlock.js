//src>components>SupplierInfoBlock.js

import React from "react";
import { FaIndustry, FaGlobeAsia, FaExternalLinkAlt, FaCheckCircle, FaShieldAlt, FaBuilding } from "react-icons/fa";

export default function SupplierInfoBlock({ supplier, minOrder, factoryWebsite, factoryUrl }) {
  // Logic to clean up the URL for display purposes
  const website = factoryWebsite || factoryUrl || "#";
  const displayUrl = website
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split('/')[0]; // Keep it short (e.g. "alibaba.com")

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden my-6 shadow-sm">
      
      {/* Header - Corporate Identity */}
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded flex items-center justify-center">
              <FaIndustry />
           </div>
           <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                 Manufacturer
              </div>
              <div className="text-sm font-bold text-slate-900 leading-none">
                 {supplier || "Direct Factory Outlet"}
              </div>
           </div>
        </div>
        
        {/* Verification Badge */}
        <div className="flex flex-col items-end">
           <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-1 rounded-full border border-emerald-200 mb-1">
              <FaCheckCircle size={10} /> KYC VERIFIED
           </span>
           <span className="text-[9px] text-slate-400 font-mono">LIC: 9942-CN</span>
        </div>
      </div>

      {/* Data Grid */}
      <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-8">
         
         {/* Field 1: Origin */}
         <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jurisdiction</span>
            <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
               <FaGlobeAsia className="text-slate-400" /> China (Mainland)
            </div>
         </div>

         {/* Field 2: Business Type */}
         <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Entity Type</span>
            <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
               <FaBuilding className="text-slate-400" /> LTD. Liability Co.
            </div>
         </div>

         {/* Field 3: MOQ */}
         <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Production MOQ</span>
            <div className="text-slate-700 text-xs font-mono bg-slate-100 inline-block px-2 py-1 rounded">
               {minOrder || 1} Units / Batch
            </div>
         </div>

         {/* Field 4: Website (Secure Link style) */}
         <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Corporate Link</span>
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
            >
               <span className="truncate max-w-[120px] decoration-dotted underline underline-offset-2">
                 {displayUrl || "View Profile"}
               </span>
               <FaExternalLinkAlt size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
         </div>

      </div>
      
      {/* Footer / Trust Signal */}
      <div className="bg-slate-50/50 px-5 py-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400">
         <FaShieldAlt className="text-emerald-500" />
         <span>Escrow Protection Active for this Vendor</span>
      </div>

    </div>
  );
}