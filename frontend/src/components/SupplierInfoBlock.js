// src/components/SupplierInfoBlock.js
import React from "react";
import { FaIndustry, FaGlobeAsia, FaExternalLinkAlt, FaCheckCircle } from "react-icons/fa";

export default function SupplierInfoBlock({ supplier, minOrder, factoryWebsite, factoryUrl }) {
  const website = factoryWebsite || factoryUrl || "#";
  const displayUrl = website.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="bg-slate-50 border border-slate-200 rounded p-4 my-4">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 border-b border-slate-200 pb-3">
        <div>
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Vendor Identity
           </div>
           <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FaIndustry className="text-slate-400" />
              {supplier || "Unknown Entity"}
           </div>
        </div>
        <div className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
           <FaCheckCircle /> VERIFIED EXPORTER
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-2 gap-4 text-xs">
         
         {/* Origin */}
         <div>
            <span className="block text-slate-400 font-bold mb-1">Origin / Jurisdiction</span>
            <div className="flex items-center gap-2 text-slate-700 font-mono">
               <FaGlobeAsia /> China (Mainland)
            </div>
         </div>

         {/* MOQ */}
         <div>
            <span className="block text-slate-400 font-bold mb-1">MOQ Requirement</span>
            <div className="text-slate-700 font-mono">
               {minOrder || 1} Units
            </div>
         </div>

         {/* Website */}
         <div className="col-span-2 border-t border-slate-200 pt-3 mt-1">
            <span className="block text-slate-400 font-bold mb-1">Corporate Portal</span>
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline font-mono truncate"
            >
               <FaExternalLinkAlt size={10} />
               {displayUrl || "N/A"}
            </a>
         </div>

      </div>
    </div>
  );
}