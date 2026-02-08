// src/components/OrderPreviewModal.js

import React from "react";
import { 
  FaFileInvoiceDollar, 
  FaTimes, 
  FaUniversity, 
  FaArrowRight,
  FaTag,
  FaBox
} from "react-icons/fa";
import { useUser } from "../contexts/UserContext";

export default function OrderPreviewModal({
  product,
  quantity,
  onClose,
  onConfirm,
  isProcessing,
  successData,
  onFinish,
  selectedSize 
}) {
  const { user, wallet } = useUser();

  // =========================================================
  //  1. FINANCIAL LOGIC (Preserved Exactly)
  // =========================================================
  
  const marketUnitPrice = Number(product.price || 0);
  const marketTotal = marketUnitPrice * quantity; 

  // Bulk Logic
  const tiers = product?.priceTiers || product?.price_tiers || [];
  const parsedTiers = Array.isArray(tiers) ? tiers : []; 
  const activeTier = parsedTiers.slice().sort((a,b) => b.min - a.min).find(t => quantity >= t.min);
  
  const bulkUnitPrice = activeTier ? Number(activeTier.price) : marketUnitPrice;
  const bulkTotal = bulkUnitPrice * quantity;
  
  const volumeSavings = marketTotal - bulkTotal;

  // Discount Logic
  const adminDiscount = Number(product.discount || 0);
  
  const getVipBonus = (totalValue) => {
    if (totalValue >= 20000) return 10; 
    if (totalValue >= 13000) return 8;  
    if (totalValue >= 8000)  return 6;  
    if (totalValue >= 4000)  return 5;  
    if (totalValue >= 2000)  return 4;  
    return 0;
  };

  const totalAssetValue = Number(wallet?.net_worth || wallet?.balance || 0);
  const vipBonus = getVipBonus(totalAssetValue);
  
  const adminDiscountAmount = bulkTotal * (adminDiscount / 100);
  const vipBonusAmount = bulkTotal * (vipBonus / 100);
  const totalDiscountAmount = adminDiscountAmount + vipBonusAmount;

  // Final Settlement
  const settlementAmount = bulkTotal - totalDiscountAmount;
  
  // Profit
  const projectedProfit = marketTotal - settlementAmount;

  // Meta
  const docId = successData ? `REC-${successData.id.split('-')[0].toUpperCase()}` : `PI-${new Date().getFullYear()}-PENDING`;
  const today = new Date().toLocaleDateString("en-GB").toUpperCase();

  // --- RENDER ---
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm font-sans transition-all">
      
      {/* LAYOUT FIX: 
          1. max-h-[85vh] prevents it from touching screen edges.
          2. rounded-lg adds separation.
          3. flex-col allows internal scrolling.
      */}
      <div className="bg-white w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col rounded-lg overflow-hidden animate-slide-up relative">
        
        {/* SUCCESS OVERLAY */}
        {successData && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10 z-0">
              <FaCheckCircle size={300} className="text-emerald-500" />
           </div>
        )}

        {/* HEADER */}
        <div className={`p-5 flex justify-between items-start border-b shrink-0 ${successData ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
           <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${successData ? 'text-emerald-800' : 'text-slate-800'}`}>
                 {successData ? <FaCheckCircle /> : <FaFileInvoiceDollar className="text-blue-900" />}
                 {successData ? "OFFICIAL RECEIPT" : "PROFORMA INVOICE"}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-slate-500 mt-1">
                 <span>REF: {docId}</span>
                 <span>DATE: {today}</span>
                 <span className={`font-bold ${successData ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {successData ? "CLEARED" : "UNPAID"}
                 </span>
              </div>
           </div>
           {!successData && (
             <button onClick={onClose} className="text-slate-400 hover:text-red-600 transition-colors p-1">
                <FaTimes size={20} />
             </button>
           )}
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-5 md:p-8 overflow-y-auto flex-1 text-sm relative z-10 bg-white">
           
           {/* Entities */}
           <div className="flex flex-col md:flex-row gap-6 justify-between mb-8">
              <div>
                 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Beneficiary (Vendor)</span>
                 <div className="font-bold text-slate-900">BambooMall SCM Limited</div>
                 <div className="text-slate-500 text-xs">Shenzhen Logistics Hub, CN</div>
                 <div className="text-slate-500 text-xs font-mono">LIC: 9920-3382-CN</div>
              </div>
              <div className="md:text-right">
                 <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bill To (Buyer)</span>
                 <div className="font-bold text-slate-900">{user?.name || "Verified Partner"}</div>
                 <div className="text-slate-500 text-xs">{user?.email}</div>
                 <div className="text-slate-500 text-xs font-mono mt-1">
                    WALLET: <span className="text-emerald-600 bg-emerald-50 px-1 rounded border border-emerald-100">${wallet?.balance?.toFixed(2) || "0.00"}</span>
                 </div>
              </div>
           </div>

           {/* --- RESPONSIVE LINE ITEMS --- */}
           
           {/* A. Mobile Card View (< md) */}
           <div className="md:hidden space-y-4 mb-8">
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                 {/* Product Header */}
                 <div className="flex justify-between items-start mb-3 border-b border-slate-200 pb-3">
                    <div>
                       <div className="font-bold text-slate-900 text-base">{product.title}</div>
                       <div className="text-xs text-slate-500 mt-0.5">SKU: {product.id?.substring(0,8).toUpperCase()}</div>
                       {selectedSize && (
                          <span className="inline-block mt-1 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                             CONFIG: {selectedSize}
                          </span>
                       )}
                    </div>
                    <div className="text-right">
                       <div className="font-bold text-slate-900 text-base">${marketTotal.toFixed(2)}</div>
                       <div className="text-[10px] text-slate-400">Market Value</div>
                    </div>
                 </div>

                 {/* Calculation Details */}
                 <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                       <span className="text-slate-500">Rate ({quantity} units)</span>
                       <span className="font-mono text-slate-700">${marketUnitPrice.toFixed(2)} / unit</span>
                    </div>

                    {/* Breakdown Rows */}
                    {volumeSavings > 0 && (
                       <div className="flex justify-between text-blue-600 bg-blue-50/50 p-1.5 rounded">
                          <span className="flex items-center gap-1"><FaTag size={10}/> Vol Savings</span>
                          <span className="font-mono">-${volumeSavings.toFixed(2)}</span>
                       </div>
                    )}
                    {adminDiscount > 0 && (
                       <div className="flex justify-between text-emerald-600 bg-emerald-50/50 p-1.5 rounded">
                          <span>Batch Incentive ({adminDiscount}%)</span>
                          <span className="font-mono">-${adminDiscountAmount.toFixed(2)}</span>
                       </div>
                    )}
                    {vipBonus > 0 && (
                       <div className="flex justify-between text-emerald-600 bg-emerald-50/50 p-1.5 rounded">
                          <span>VIP Bonus ({vipBonus}%)</span>
                          <span className="font-mono">-${vipBonusAmount.toFixed(2)}</span>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* B. Desktop Table View (>= md) */}
           <div className="hidden md:block">
              <table className="w-full text-left border-collapse mb-8">
                 <thead>
                    <tr className="border-b-2 border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                       <th className="py-2">Description</th>
                       <th className="py-2 text-right">Qty</th>
                       <th className="py-2 text-right">Standard Rate</th>
                       <th className="py-2 text-right">Market Value</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200 font-mono text-slate-700 text-xs">
                    <tr>
                       <td className="py-4 pr-4">
                          <div className="font-bold text-slate-900 text-sm">{product.title}</div>
                          <div className="text-[10px] text-slate-400">SKU: {product.id?.substring(0,8).toUpperCase()}</div>
                          {selectedSize && (
                             <div className="text-[10px] text-blue-600 font-bold mt-1 bg-blue-50 inline-block px-1 rounded border border-blue-100">
                                CONFIG: {selectedSize}
                             </div>
                          )}
                       </td>
                       <td className="py-4 text-right">{quantity}</td>
                       <td className="py-4 text-right">${marketUnitPrice.toFixed(2)}</td>
                       <td className="py-4 text-right font-bold text-slate-900">${marketTotal.toFixed(2)}</td>
                    </tr>
                    
                    {volumeSavings > 0 && (
                        <tr className="text-blue-600 bg-blue-50/50">
                           <td className="py-2 italic pl-2 flex items-center gap-2">
                              <FaTag size={10} /> Volume Tier Savings ({activeTier.min}+ Units)
                           </td>
                           <td colSpan="2"></td>
                           <td className="py-2 text-right">-${volumeSavings.toFixed(2)}</td>
                        </tr>
                    )}
                    {adminDiscount > 0 && (
                        <tr className="text-emerald-600 bg-emerald-50/50">
                           <td className="py-2 italic pl-2">Less: Batch Incentive ({adminDiscount}%)</td>
                           <td colSpan="2"></td>
                           <td className="py-2 text-right">-${adminDiscountAmount.toFixed(2)}</td>
                        </tr>
                    )}
                    {vipBonus > 0 && (
                        <tr className="text-emerald-600 bg-emerald-50/50">
                           <td className="py-2 italic pl-2">Less: VIP Tier Bonus ({vipBonus}%)</td>
                           <td colSpan="2"></td>
                           <td className="py-2 text-right">-${vipBonusAmount.toFixed(2)}</td>
                        </tr>
                    )}
                 </tbody>
              </table>
           </div>

           {/* Financial Summary (Common) */}
           <div className="flex justify-end">
              <div className="w-full md:max-w-sm space-y-3">
                 <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                    <span className="font-bold text-slate-900 uppercase text-xs">Total Settlement</span>
                    <span className="font-bold text-3xl font-mono text-blue-900">${settlementAmount.toFixed(2)}</span>
                 </div>
                 
                 <div className="bg-emerald-50 border border-emerald-100 p-4 rounded mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-emerald-800 uppercase tracking-wide font-bold">Net Profit Margin</span>
                        <span className="text-[10px] text-emerald-600 font-mono">
                           {marketTotal > 0 ? ((projectedProfit / settlementAmount) * 100).toFixed(2) : 0}% ROI
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs text-emerald-700">Estimated Return</span>
                       <span className="font-bold text-xl text-emerald-600 font-mono">+${projectedProfit.toFixed(2)}</span>
                    </div>
                 </div>

                 {successData && (
                    <div className="bg-slate-100 border border-slate-200 p-2 rounded text-center text-[10px] text-slate-500 mt-2">
                       TXID: {successData.id} • Blockchain Verified
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-slate-50 p-4 md:p-6 border-t border-slate-200 shrink-0">
           {successData ? (
              <div className="flex gap-4">
                 <button onClick={onFinish} className="w-full py-3 md:py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded shadow-lg flex items-center justify-center gap-2 transition">
                    View Portfolio <FaArrowRight />
                 </button>
              </div>
           ) : (
              <div className="flex gap-4">
                 <button onClick={onClose} className="flex-1 py-3 md:py-4 border border-slate-300 bg-white text-slate-600 font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-100 transition">
                    Void Invoice
                 </button>
                 <button onClick={onConfirm} disabled={isProcessing} className="flex-[2] py-3 md:py-4 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-widest rounded shadow-lg flex items-center justify-center gap-2 transition transform active:scale-[0.98]">
                    {isProcessing ? "Verifying Funds..." : <><FaUniversity /> Authorize Settlement</>}
                 </button>
              </div>
           )}
        </div>

      </div>
    </div>
  );
}