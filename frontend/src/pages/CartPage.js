// src/pages/CartPage.js

import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
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
  FaMoneyBillWave
} from "react-icons/fa";

export default function CartPage() {
  const { user } = useUser();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Refund Modal State
  const [refundModalOrder, setRefundModalOrder] = useState(null); 
  const [processingRefund, setProcessingRefund] = useState(false);

  // --- FIX: Wrapped loadData in useCallback ---
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
  }, [user]); // Re-create this function only if 'user' changes

  // --- FIX: Added loadData to dependency array ---
  useEffect(() => {
    loadData();
  }, [loadData]); 

  // --- 1. OPEN MODAL ---
  const initiateRefund = (order) => {
     setRefundModalOrder(order);
  };

  // --- 2. EXECUTE REFUND ---
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
      
      setRefundModalOrder(null); // Close modal
      loadData(); // Refresh list using the memoized function
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingRefund(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
       <FaSpinner className="animate-spin text-3xl mb-4 text-blue-900" />
       <span className="font-mono text-xs uppercase tracking-widest">Loading Asset Portfolio...</span>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200 pb-6">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <FaBoxOpen className="text-blue-900" />
              Active Allocations
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              ACCOUNT: {user?.username?.toUpperCase() || "AGENT"} <span className="text-slate-300 mx-2">|</span> PORTFOLIO STATUS: <span className="text-emerald-600 font-bold">LIVE</span>
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

      {/* 2. TABLE */}
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
                     <th className="px-6 py-4 text-right">Action</th>
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
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                           <td className="px-6 py-4">
                              <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 overflow-hidden relative">
                                 <img src={getProductImage(order.product)} alt="thumb" className="w-full h-full object-cover mix-blend-multiply"/>
                              </div>
                           </td>
                           <td className="px-6 py-4 font-mono text-blue-600 font-bold text-xs">CN-SZ-{shortId}</td>
                           <td className="px-6 py-4 font-bold text-slate-700">
                              <div className="flex items-center gap-2">
                                 {order.product?.title || "Allocated Inventory Lot"}
                                 <Link to={`/products/${order.product_id}`} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600"><FaExternalLinkAlt size={10} /></Link>
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal mt-0.5 font-mono">
                                 {new Date(order.created_at).toLocaleDateString()}
                              </div>
                           </td>
                           <td className="px-6 py-4 text-center font-mono text-slate-600">{qty} Units</td>
                           <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">${cost.toFixed(2)}</td>
                           <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">${marketValue.toFixed(2)}</td>
                           <td className="px-6 py-4 text-right">
                              {isSold ? <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center justify-end gap-1 ml-auto w-fit"><FaCheckCircle /> LIQUIDATED</span> : 
                               isRefundPending ? <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center justify-end gap-1 ml-auto w-fit"><FaExclamationCircle /> REFUND PENDING</span> : 
                               <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center justify-end gap-1 ml-auto w-fit animate-pulse"><FaClock /> AWAITING RESALE</span>}
                           </td>
                           <td className="px-6 py-4 text-right">
                              {!isSold && !isRefundPending && (
                                <button 
                                  onClick={() => initiateRefund(order)}
                                  className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1 rounded transition-colors flex items-center gap-1 ml-auto"
                                >
                                  <FaUndoAlt /> Unwind
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

      {/* 3. CUSTOM UNWIND MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
           <div className="bg-white rounded w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
              
              {/* Modal Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FaShieldAlt className="text-red-600"/> Liquidity Unwind Protocol
                 </h3>
                 <button onClick={() => setRefundModalOrder(null)} disabled={processingRefund}>
                    <FaTimes className="text-slate-400 hover:text-slate-600"/>
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                 <div className="bg-red-50 border border-red-100 rounded p-4 mb-6">
                    <div className="flex gap-3">
                       <FaExclamationCircle className="text-red-600 mt-1 shrink-0" size={16} />
                       <div>
                          <h4 className="text-sm font-bold text-red-800 mb-1">Early Withdrawal Penalty</h4>
                          <p className="text-xs text-red-700 leading-relaxed">
                             Unwinding an active allocation triggers a contract breakage event. 
                             A <strong>1.0% Fee</strong> will be deducted from the principal before funds are returned to your Treasury Wallet.
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Calculation Breakdown */}
                 <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between text-slate-500">
                       <span>Principal Amount</span>
                       <span className="font-mono">${Number(refundModalOrder.amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                       <span>Breakage Fee (1.0%)</span>
                       <span className="font-mono">-${(Number(refundModalOrder.amount) * 0.01).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
                       <span>Net Refund</span>
                       <span className="font-mono">${(Number(refundModalOrder.amount) * 0.99).toFixed(2)}</span>
                    </div>
                 </div>

                 <button 
                    onClick={confirmRefund}
                    disabled={processingRefund}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50"
                 >
                    {processingRefund ? (
                       <>Processing Ledger...</>
                    ) : (
                       <><FaMoneyBillWave /> Authorize Unwind</>
                    )}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-slate-50 p-4 border border-slate-200 rounded text-[10px] text-slate-400 flex items-start gap-2">
         <FaFileContract className="text-slate-500 mt-0.5" />
         <div>
            <strong>Automated Liquidation Protocol:</strong> Assets held in this portfolio are automatically listed on secondary markets. 
            Refunds ("Liquidity Unwind") are subject to a 1.0% Breakage Fee as per the Operational Manual.
         </div>
      </div>

    </div>
  );
}