// src/pages/CartPage.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { fetchCartOrders } from "../utils/api";
import { getProductImage } from "../utils/image"; 
import { 
  FaBoxOpen, 
  FaChartLine, 
  FaSpinner, 
  FaClock,
  FaCheckCircle,
  FaFileContract,
  FaExternalLinkAlt
} from "react-icons/fa";

export default function CartPage() {
  const { user } = useUser();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load "Active Allocations"
  useEffect(() => {
    if (!user?.id) return;
    
    setLoading(true);
    fetchCartOrders(user.id)
      .then((data) => {
        // Filter: Show active or sold items (exclude cancelled)
        const active = data.filter(o => o.status !== 'cancelled'); 
        setOrders(active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
       <FaSpinner className="animate-spin text-3xl mb-4 text-blue-900" />
       <span className="font-mono text-xs uppercase tracking-widest">Loading Asset Portfolio...</span>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* 1. HEADER: Portfolio Context */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200 pb-6">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <FaBoxOpen className="text-blue-900" />
              Active Allocations
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              ACCOUNT: {user?.username?.toUpperCase() || "AGENT"} // PORTFOLIO STATUS: <span className="text-emerald-600 font-bold">LIVE</span>
            </p>
         </div>
         <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 border border-blue-200 rounded flex items-start gap-2 max-w-md">
            <FaChartLine className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
               <strong>Market Update:</strong> Resale liquidity in Shenzhen region is high. 
               Assets typically clear within 24-48 hours of allocation.
            </div>
         </div>
      </div>

      {/* 2. THE TABLE: Asset Ledger */}
      {orders.length === 0 ? (
         <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded">
            <div className="text-slate-300 text-6xl mb-4"><FaBoxOpen className="mx-auto"/></div>
            <h3 className="text-slate-800 font-bold mb-2">No Active Allocations</h3>
            <p className="text-slate-500 text-sm mb-6">Your portfolio is currently empty.</p>
            <Link to="/products" className="bg-blue-900 text-white px-6 py-3 rounded text-sm font-bold uppercase tracking-wide">
               Access Master Manifest
            </Link>
         </div>
      ) : (
         <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-mono text-xs uppercase border-b border-slate-200">
                  <tr>
                     <th className="px-6 py-4 w-20">Asset</th> 
                     <th className="px-6 py-4">Batch ID</th>
                     <th className="px-6 py-4">Description</th>
                     <th className="px-6 py-4 text-center">Volume</th>
                     <th className="px-6 py-4 text-right">Cost Basis</th>
                     <th className="px-6 py-4 text-right">Est. Market Value</th>
                     <th className="px-6 py-4 text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                     // --- REAL MATH FIX ---
                     const qty = Number(order.qty || order.quantity || 0);
                     const cost = Number(order.amount); // What they paid
                     
                     // Use the REAL product price for Market Value
                     // If product data is missing, fallback to cost * 1.5 safely
                     const unitPrice = Number(order.product?.price || 0);
                     const marketValue = unitPrice > 0 ? (unitPrice * qty) : (cost * 1.5);

                     const isSold = order.status === 'sold';
                     const shortId = order.id.toString().substring(0, 8).toUpperCase();

                     return (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                           
                           {/* Asset Image */}
                           <td className="px-6 py-4">
                              <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 overflow-hidden relative">
                                 <img 
                                    src={getProductImage(order.product)} 
                                    alt="thumb" 
                                    className="w-full h-full object-cover mix-blend-multiply"
                                 />
                              </div>
                           </td>

                           {/* Batch ID */}
                           <td className="px-6 py-4 font-mono text-blue-600 font-bold text-xs">
                              CN-SZ-{shortId}
                           </td>

                           {/* Description */}
                           <td className="px-6 py-4 font-bold text-slate-700">
                              <div className="flex items-center gap-2">
                                 {order.product?.title || "Allocated Inventory Lot"}
                                 <Link to={`/products/${order.product_id}`} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600">
                                    <FaExternalLinkAlt size={10} />
                                 </Link>
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal mt-0.5 font-mono">
                                 {new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString()}
                              </div>
                           </td>

                           {/* Volume */}
                           <td className="px-6 py-4 text-center font-mono text-slate-600">
                              {qty} Units
                           </td>

                           {/* Cost Basis (What User Paid) */}
                           <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                              ${cost.toFixed(2)}
                           </td>

                           {/* Market Value (Real List Price) */}
                           <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">
                              ${marketValue.toFixed(2)}
                           </td>

                           {/* Status Badge */}
                           <td className="px-6 py-4 text-right">
                              {isSold ? (
                                 <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center justify-end gap-1 ml-auto w-fit">
                                    <FaCheckCircle /> LIQUIDATED
                                 </span>
                              ) : (
                                 <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center justify-end gap-1 ml-auto w-fit animate-pulse">
                                    <FaClock /> AWAITING RESALE
                                 </span>
                              )}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      )}

      {/* Footer Disclaimer */}
      <div className="bg-slate-50 p-4 border border-slate-200 rounded text-[10px] text-slate-400 flex items-start gap-2">
         <FaFileContract className="text-slate-500 mt-0.5" />
         <div>
            <strong>Automated Liquidation Protocol:</strong> Assets held in this portfolio are automatically listed on secondary markets (eBay/Amazon/Walmart) via our API. 
            Settlement of profits typically occurs within 24-48 hours. No action is required from the agent.
         </div>
      </div>

    </div>
  );
}