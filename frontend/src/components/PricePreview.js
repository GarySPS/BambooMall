//src>components>PricePreview.js

import React from "react";

export default function PricePreview({ product, quantity, priceTiers, membershipDiscount = 0 }) {
  // 1. Market Value (The "Anchor" Price)
  const unitPrice = Number(product.price || 0);
  const marketTotal = unitPrice * quantity;

  // 2. Volume Pricing Logic (Matches Order Logic)
  // Check if we hit a bulk tier
  const tiers = Array.isArray(priceTiers) ? priceTiers : [];
  const activeTier = tiers.slice().sort((a,b) => b.min - a.min).find(t => quantity >= t.min);
  
  // If tier hit, use tier price. Else use standard price.
  const baseBuyPrice = activeTier ? Number(activeTier.price) : unitPrice;
  const grossCost = baseBuyPrice * quantity;

  // 3. Discount Logic
  // Combine Product Discount + User VIP Discount
  const productDiscount = Number(product.discount || 0);
  const totalDiscountPercent = productDiscount + membershipDiscount;
  
  const discountAmount = grossCost * (totalDiscountPercent / 100);
  const netCost = grossCost - discountAmount;

  // 4. Profit Calculation (Market Value - What You Pay)
  const profit = marketTotal - netCost;
  const margin = netCost > 0 ? ((profit / netCost) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3 rounded border border-slate-200 my-4 text-xs font-mono">
       
       {/* Row 1: Costs */}
       <div>
          <span className="block text-slate-400 uppercase font-bold text-[10px]">Net Cost</span>
          <span className="font-bold text-slate-800">${netCost.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
       </div>
       <div>
          <span className="block text-slate-400 uppercase font-bold text-[10px]">Est. Resale Value</span>
          <span className="font-bold text-blue-700">${marketTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
       </div>

       {/* Row 2: Profit */}
       <div className="col-span-2 border-t border-slate-200 pt-2 flex justify-between items-center mt-1">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Net Profit ({margin}%)</span>
          <span className="font-bold text-emerald-600 text-sm">
            +${profit.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </span>
       </div>
    </div>
  );
}