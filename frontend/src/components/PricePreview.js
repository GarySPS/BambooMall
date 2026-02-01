//src>components>PricePreview.js

import React from "react";

export default function PricePreview({ product, quantity, priceTiers, membershipDiscount = 0 }) {
  // Basic calc (kept simple as DetailPage handles the heavy lifting now)
  const unitPrice = Number(product.price || 0);
  const total = unitPrice * quantity;
  const market = total * 1.8;
  const profit = market - total;

  return (
    <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3 rounded border border-slate-200 my-4 text-xs">
       <div>
          <span className="block text-slate-400 uppercase font-bold text-[10px]">Total Cost</span>
          <span className="font-mono font-bold text-slate-800">${total.toLocaleString()}</span>
       </div>
       <div>
          <span className="block text-slate-400 uppercase font-bold text-[10px]">Est. Resale Value</span>
          <span className="font-mono font-bold text-blue-700">${market.toLocaleString()}</span>
       </div>
       <div className="col-span-2 border-t border-slate-200 pt-2 flex justify-between items-center">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Net Profit Potential</span>
          <span className="font-mono font-bold text-emerald-600 text-sm">+${profit.toLocaleString()}</span>
       </div>
    </div>
  );
}