// src/pages/CartPage.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { fetchCartOrders } from "../utils/api";
import { getProductImage } from "../utils/image"; 
import { API_BASE_URL } from "../config"; 
import { 
  FaBoxOpen, 
  FaChartLine, 
  FaSpinner, 
  FaClock,
  FaCheckCircle,
  FaFileContract,
  FaExternalLinkAlt,
  FaUndoAlt,
  FaExclamationCircle,
  FaTimes,
  FaShieldAlt,
  FaMoneyBillWave,
  FaWallet,
  FaChartPie
} from "react-icons/fa";

export default function CartPage() {
  const { user } = useUser();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Refund Modal State
  const [refundModalOrder, setRefundModalOrder] = useState(null); 
  const [processingRefund, setProcessingRefund] = useState(false);

  // --- 1. LOAD DATA ---
  const loadData = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchCartOrders(user.id)
      .then((data) => {
        // Filter: Show active, sold, or refund pending items
        const active = data.filter(o => o.status !== 'cancelled'); 
        setOrders(active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]); 

  // --- 2. CALCULATE PORTFOLIO METRICS (New) ---
  const portfolioStats = useMemo(() => {
    return orders.reduce((acc, order) => {
      const qty = Number(order.qty || order.quantity || 0);
      const cost = Number(order.amount);
      const unitPrice = Number(order.product?.price || 0);
      // Logic: If unit price exists, use it, else estimate 1.5x cost
      const marketVal = unitPrice > 0 ? (unitPrice * qty) : (cost * 1.5);
      
      return {
        totalCost: acc.totalCost + cost,
        totalValue: acc.totalValue + marketVal,
        activeCount: acc.activeCount + 1
      };
    }, { totalCost: 0, totalValue: 0, activeCount: 0 });
  }, [orders]);

  // --- 3. ACTIONS ---
  const initiateRefund = (order) => setRefundModalOrder(order);

  const confirmRefund = async () => {
    if (!refundModalOrder) return;

    setProcessingRefund(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: refundModalOrder.id })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refund failed");
      
      setRefundModalOrder(null);
      loadData(); 
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingRefund(false);
    }
  };

  // --- RENDER ---
  if (loading) return (
    <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-slate-400 bg-slate-50">
       <div className="relative">
         <FaSpinner className="animate-spin text-4xl text-blue-900 mb-4" />
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-900 rounded-full animate-ping"></div>
         </div>
       </div>
       <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Syncing Asset Ledger...</span>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20 p-6 animate-fade-in bg-slate-50/50 min-h-screen">
      
      {/* 1. EXECUTIVE DASHBOARD HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Portfolio v2.4</span>
              <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Live Connection</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-sans">
              Active Allocations
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-2 uppercase tracking-wide">
              Principal: {user?.username || "AGENT"} <span className="text-slate-300 mx-2">|</span> ID: <span className="text-slate-900">{(user?.id || "0000").substring(0,8)}</span>
            </p>
          </div>

          {/* Financial Summary Cards */}
          <div className="flex flex-wrap gap-4 w-full xl:w-auto">
             <div className="bg-white p-4 rounded shadow-sm border border-slate-200 flex-1 min-w-[200px]">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <FaWallet /> Capital Deployed
                </div>
                <div className="text-xl font-mono font-bold text-slate-800">
                    ${portfolioStats.totalCost.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
             </div>
             <div className="bg-white p-4 rounded shadow-sm border border-slate-200 flex-1 min-w-[200px]">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    <FaChartPie /> Projected NAV
                </div>
                <div className="text-xl font-mono font-bold text-blue-600">
                    ${portfolioStats.totalValue.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
             </div>
          </div>
      </div>

      {/* 2. ASSET TABLE */}
      {orders.length === 0 ? (
         <div className="text-center py-24 bg-white border border-dashed border-slate-300 rounded-lg">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBoxOpen className="text-slate-300 text-3xl"/>
            </div>
            <h3 className="text-slate-800 font-bold text-lg mb-2">Portfolio Empty</h3>
            <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                No active inventory lots found for this account. Access the Master Manifest to begin allocation.
            </p>
            <Link to="/products" className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded text-xs font-bold uppercase tracking-[0.1em] shadow-lg hover:shadow-xl transition-all">
               Acquire Assets
            </Link>
         </div>
      ) : (
         <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            {/* Table Header with Gradient */}
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-6 py-3 flex justify-between items-center">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FaFileContract /> Ledger: {orders.length} Entries
                 </span>
                 <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">
                    <FaChartLine /> Market Liquidity: High
                 </div>
            </div>

            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                     <th className="px-6 py-4 w-24">Asset Preview</th> 
                     <th className="px-6 py-4">Batch Reference</th>
                     <th className="px-6 py-4">Inventory Details</th>
                     <th className="px-6 py-4 text-center">Vol</th>
                     <th className="px-6 py-4 text-right">Cost Basis</th>
                     <th className="px-6 py-4 text-right">Est. Market Val</th>
                     <th className="px-6 py-4 text-right">Status</th>
                     <th className="px-6 py-4 text-right">Protocol</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                     const qty = Number(order.qty || order.quantity || 0);
                     const cost = Number(order.amount);
                     const unitPrice = Number(order.product?.price || 0);
                     const marketValue = unitPrice > 0 ? (unitPrice * qty) : (cost * 1.5);
                     const isSold = order.status === 'sold';
                     const isRefundPending = order.status === 'refund_pending' || order.status === 'refunded';
                     const shortId = order.id.toString().substring(0, 8).toUpperCase();

                     return (
                        <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                           {/* Image */}
                           <td className="px-6 py-4">
                              <div className="w-12 h-12 bg-slate-100 rounded border border-slate-200 overflow-hidden relative shadow-sm">
                                 <img src={getProductImage(order.product)} alt="asset" className="w-full h-full object-cover"/>
                              </div>
                           </td>
                           
                           {/* Batch ID */}
                           <td className="px-6 py-4">
                               <div className="font-mono text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded w-fit border border-blue-100">
                                   CN-SZ-{shortId}
                               </div>
                           </td>

                           {/* Description */}
                           <td className="px-6 py-4">
                              <div className="flex flex-col">
                                 <span className="font-bold text-slate-700 text-sm line-clamp-1 group-hover:text-blue-900 transition-colors">
                                    {order.product?.title || "Allocated Inventory Lot"}
                                 </span>
                                 <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] text-slate-400 font-mono">
                                         Allocated: {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                    <Link to={`/products/${order.product_id}`} className="text-[10px] text-blue-400 hover:text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <FaExternalLinkAlt /> View Manifest
                                    </Link>
                                 </div>
                              </div>
                           </td>

                           {/* Volume */}
                           <td className="px-6 py-4 text-center font-mono text-slate-500 font-bold text-xs">{qty}</td>

                           {/* Cost Basis */}
                           <td className="px-6 py-4 text-right font-mono text-slate-600 text-xs">
                               ${cost.toFixed(2)}
                           </td>

                           {/* Market Value */}
                           <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600 text-sm">
                               ${marketValue.toFixed(2)}
                           </td>

                           {/* Status Badge */}
                           <td className="px-6 py-4 text-right">
                              {isSold ? 
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider border border-emerald-200">
                                    <FaCheckCircle /> Liquidated
                                </span> : 
                               isRefundPending ? 
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-wider border border-slate-200">
                                    <FaExclamationCircle /> Audit Pending
                                </span> : 
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-wider border border-amber-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/> Active Hold
                                </span>
                              }
                           </td>

                           {/* Action Button */}
                           <td className="px-6 py-4 text-right">
                              {!isSold && !isRefundPending && (
                                 <button 
                                    onClick={() => initiateRefund(order)}
                                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 px-3 py-1.5 rounded transition-all flex items-center gap-2 ml-auto"
                                 >
                                    <FaUndoAlt className="text-xs" /> Unwind
                                 </button>
                              )}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      )}

      {/* 3. LIQUIDITY UNWIND MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
           <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
              
              {/* Header */}
              <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                 <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                       <FaShieldAlt className="text-red-600"/> Protocol Warning
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">REF: UNWIND-REQ-{refundModalOrder.id}</p>
                 </div>
                 <button onClick={() => setRefundModalOrder(null)} disabled={processingRefund} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <FaTimes className="text-slate-400 hover:text-slate-600"/>
                 </button>
              </div>

              {/* Body */}
              <div className="p-6">
                 <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex gap-3">
                       <FaExclamationCircle className="text-red-600 mt-0.5 shrink-0" size={16} />
                       <div>
                          <h4 className="text-sm font-bold text-red-900 mb-1">Breakage Fee Applied</h4>
                          <p className="text-xs text-red-800 leading-relaxed">
                             Initiating a manual unwind removes this asset from the sales queue immediately. A <strong>1.0% Operational Fee</strong> will be deducted from your principal.
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Financial Breakdown */}
                 <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-100 mb-6">
                    <div className="flex justify-between text-xs text-slate-500">
                       <span>Gross Principal</span>
                       <span className="font-mono font-medium">${Number(refundModalOrder.amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-red-600">
                       <span>Breakage Fee (1.0%)</span>
                       <span className="font-mono">-${(Number(refundModalOrder.amount) * 0.01).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-bold text-slate-900">
                       <span>Net Return to Treasury</span>
                       <span className="font-mono">${(Number(refundModalOrder.amount) * 0.99).toFixed(2)}</span>
                    </div>
                 </div>

                 <button 
                    onClick={confirmRefund}
                    disabled={processingRefund}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    {processingRefund ? (
                       <FaSpinner className="animate-spin" />
                    ) : (
                       <><FaMoneyBillWave /> Execute Unwind Protocol</>
                    )}
                 </button>
                 
                 <div className="text-center mt-4">
                     <button onClick={() => setRefundModalOrder(null)} className="text-[10px] text-slate-400 hover:text-slate-600 underline decoration-dotted">Cancel Request</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 4. FOOTER DISCLAIMER */}
      <div className="border-t border-slate-200 pt-6 mt-12 flex items-start gap-4 text-slate-400 max-w-4xl">
         <FaFileContract className="mt-1 shrink-0 opacity-50" />
         <div className="text-[10px] leading-relaxed">
            <strong>System Notice:</strong> Assets held in this portfolio are automatically syndicated to secondary markets in the Shenzhen and Hong Kong regions. 
            "Est. Market Value" is a projection based on current batch performance and is not guaranteed. 
            Liquidity events (sales) typically settle within T+2 days.
         </div>
      </div>

    </div>
  );
}