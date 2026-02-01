// src/components/PriceTiersCard.js
import React from "react";

export default function PriceTiersCard({ priceTiers = [] }) {
  if (!Array.isArray(priceTiers) || priceTiers.length === 0) return null;

  return (
    <div className="mt-4 bg-slate-50 border border-slate-200 rounded overflow-hidden">
       <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Volume Schedule (FOB)
       </div>
       <div className="flex divide-x divide-slate-200">
        {priceTiers.map((tier, idx) => (
          <div key={idx} className="flex-1 p-2 text-center hover:bg-white transition-colors">
            <div className="text-xs text-slate-500 mb-1 font-mono">
               {tier.label || `>= ${tier.min} Units`}
            </div>
            <div className="text-sm font-bold text-slate-800 font-mono">
               ${Number(tier.price).toFixed(2)}
            </div>
          </div>
        ))}
       </div>
    </div>
  );
}