//src>pages>CartPage.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { fetchCartOrders } from "../utils/api";
import { getProductImage } from "../utils/image"; 
import { API_BASE_URL } from "../config"; 
import { 
  FaBoxOpen, FaChartLine, FaSpinner, FaFileContract,
  FaUndoAlt, FaExclamationCircle,
  FaTimes, FaShieldAlt, FaMoneyBillWave, FaWallet,
  FaChartPie, FaCheckCircle, FaShip,
  FaLayerGroup
} from "react-icons/fa";

// --- HELPER: Random Channel Generator (Deterministic) ---
const CHANNEL_POOL = [
  { name: "Alibaba (CN)", color: "bg-orange-500" },
  { name: "Amazon FBA (US)", color: "bg-slate-800" },
  { name: "JD.com (Logistics)", color: "bg-red-600" },
  { name: "Shopee (SEA)", color: "bg-orange-400" },
  { name: "Lazada Group", color: "bg-blue-600" },
  { name: "Rakuten (JP)", color: "bg-red-700" },
  { name: "eBay Enterprise", color: "bg-blue-500" },
  { name: "Walmart Marketplace", color: "bg-blue-800" }
];

const getActiveChannels = (seedId) => {
  if (!seedId) return [CHANNEL_POOL[0], CHANNEL_POOL[1]];
  let hash = 0;
  for (let i = 0; i < seedId.length; i++) hash = seedId.charCodeAt(i) + ((hash << 5) - hash);
  const idx1 = Math.abs(hash) % CHANNEL_POOL.length;
  const idx2 = Math.abs(hash >> 3) % CHANNEL_POOL.length;
  const safeIdx2 = idx1 === idx2 ? (idx2 + 1) % CHANNEL_POOL.length : idx2;
  return [CHANNEL_POOL[idx1], CHANNEL_POOL[safeIdx2]];
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export default function CartPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundModalOrder, setRefundModalOrder] = useState(null); 
  const [processingRefund, setProcessingRefund] = useState(false);

  // --- LOAD DATA ---
  const loadData = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchCartOrders(user.id)
      .then((data) => {
        const active = data.filter(o => o.status !== 'cancelled'); 
        setOrders(active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]); 

  // --- METRICS ---
  const portfolioStats = useMemo(() => {
  return orders.reduce((acc, order) => {
    // ONLY count active stock towards "Capital Deployed"
    if (order.status !== 'selling') return acc;

      const qty = Number(order.qty || order.quantity || 0);
      const cost = Number(order.amount);
      const unitPrice = Number(order.product?.price || 0);
      const marketVal = unitPrice > 0 ? (unitPrice * qty) : (cost * 1.5);
      
      return {
        totalCost: acc.totalCost + cost,
        totalValue: acc.totalValue + marketVal,
        activeCount: acc.activeCount + 1
      };
    }, { totalCost: 0, totalValue: 0, activeCount: 0 });
  }, [orders]);

  // --- ACTIONS ---
  const initiateRefund = (order) => setRefundModalOrder(order);
  
  const confirmRefund = async () => {
    if (!refundModalOrder) return;
    setProcessingRefund(true);
    try {
      // 1. SECURITY FIX: Get the token
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/orders/refund`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // 2. SECURITY FIX: Attach token
        },
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

  // --- RENDER HELPERS ---
  const StatusBadge = ({ isSold, isRefundPending }) => {
    if (isSold) return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border bg-emerald-100 text-emerald-800 border-emerald-200">
         <FaCheckCircle /> Liquidated
      </span>
    );
    if (isRefundPending) return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border bg-slate-100 text-slate-500 border-slate-300">
         <FaExclamationCircle /> Audit Pending
      </span>
    );
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-100">
         <FaChartLine /> Live Market
      </span>
    );
  };

  const DynamicChannelList = ({ orderId }) => {
    const channels = getActiveChannels(orderId);
    return (
      <div className="flex flex-col gap-1.5">
         {channels.map((ch, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
               <span className={`w-2 h-2 rounded-full ${ch.color} ${i === 0 ? 'animate-pulse' : ''}`}></span>
               {ch.name}
               {i === 1 && <span className="text-[9px] text-slate-400 italic font-normal ml-auto opacity-70">Scaling...</span>}
            </div>
         ))}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
       <FaSpinner className="animate-spin text-4xl mb-4 text-blue-900" />
       <span className="font-mono text-sm uppercase tracking-widest font-bold">Syncing Ledger...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-[1600px] mx-auto pt-4 px-1">
      
      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-4">
              <span className="bg-slate-900 text-white p-3 rounded-xl shadow-md">
                <FaFileContract size={24} />
              </span>
              Active Allocations
            </h2>
            <div className="flex items-center gap-4 mt-3 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> 
                NETWORK ACTIVE
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-mono uppercase">PRINCIPAL: {(user?.id || "0000").substring(0,8)}</span>
            </div>
         </div>

         {/* Metrics */}
         <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
            <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm min-w-[180px] flex-shrink-0">
               <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-2">
                 <FaWallet /> Active Inventory
               </div>
               <div className="text-2xl font-mono font-bold text-slate-800">
                   {formatCurrency(portfolioStats.totalCost)}
               </div>
            </div>
            <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm min-w-[180px] flex-shrink-0">
               <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1 flex items-center gap-2">
                 <FaChartPie /> Projected NAV
               </div>
               <div className="text-2xl font-mono font-bold text-blue-600">
                   {formatCurrency(portfolioStats.totalValue)}
               </div>
            </div>
         </div>
      </div>

      {/* 2. DATA DISPLAY */}
      {orders.length === 0 ? (
         <div className="text-center py-24 bg-white border border-dashed border-slate-300 rounded-xl">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBoxOpen className="text-slate-300 text-3xl"/>
            </div>
            <h3 className="text-slate-800 font-bold text-lg mb-2">Portfolio Empty</h3>
            <p className="text-slate-500 text-sm mb-8 px-4">No active inventory found. Access the Manifest to begin.</p>
            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-all shadow-md">
               <FaLayerGroup /> Acquire Assets
            </Link>
         </div>
      ) : (
         <>
            {/* === A. MOBILE CARD VIEW === */}
            <div className="md:hidden grid gap-4">
              {orders.map((order) => {
                 const qty = Number(order.qty || order.quantity || 0);
                 const cost = Number(order.amount);
                 const unitPrice = Number(order.product?.price || 0);
                 const marketValue = unitPrice > 0 ? (unitPrice * qty) : (cost * 1.5);
                 const isSold = order.status === 'sold';
                 const isRefundPending = order.status === 'refund_pending' || order.status === 'refunded';
                 const shortId = order.id.toString().substring(0, 8).toUpperCase();

                 return (
                    <div key={order.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                           <span className="font-mono text-[10px] text-slate-400 font-bold tracking-wider bg-slate-50 px-2 py-1 rounded">
                              BATCH-CN-{shortId}
                           </span>
                           <StatusBadge isSold={isSold} isRefundPending={isRefundPending} />
                        </div>

                        <div className="flex gap-4">
                           <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 p-1 flex-shrink-0">
                              <img src={getProductImage(order.product)} alt="asset" className="w-full h-full object-cover mix-blend-multiply"/>
                           </div>
<div className="flex flex-col gap-1">
  {order.product_id ? (
    <Link to={`/products/${order.product_id}`} className="font-bold text-slate-800 text-base leading-tight line-clamp-2">
      {order.product?.title || "Allocated Inventory Lot"}
    </Link>
  ) : (
    <span className="font-bold text-slate-800 text-base leading-tight line-clamp-2 cursor-not-allowed opacity-75" title="Manifest Not Available">
      {order.product?.title || "Allocated Inventory Lot (Locked)"}
    </span>
  )}
  
  {order.details && order.details.size && (
    <span className="self-start inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">
       CFG: {order.details.size}
    </span>
  )}
</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-3">
                           <div>
                              <div className="text-[10px] text-slate-400 uppercase font-bold">Cost Basis</div>
                              <div className="font-mono text-sm font-bold text-slate-700">{formatCurrency(cost)}</div>
                           </div>
                           <div className="text-right">
                              <div className="text-[10px] text-emerald-500 uppercase font-bold">Est. Value</div>
                              <div className="font-mono text-sm font-bold text-emerald-600">{formatCurrency(marketValue)}</div>
                           </div>
                        </div>

                        {!isSold && !isRefundPending && (
                           <div className="pt-2 border-t border-slate-100">
                              <div className="mb-3">
                                 <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">Syndication Channels</div>
                                 <DynamicChannelList orderId={order.id} />
                              </div>
                              <button 
                                 onClick={() => initiateRefund(order)}
                                 className="w-full py-2.5 bg-white border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wide rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                              >
                                 <FaUndoAlt /> Recall Asset
                              </button>
                           </div>
                        )}
                    </div>
                 );
              })}
              
               <div className="text-center py-4 text-[10px] text-slate-400 font-mono uppercase">
                  Logistics: Shenzhen Global SCM Ltd.
               </div>
            </div>

            {/* === B. DESKTOP TABLE VIEW === */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 text-slate-500 font-mono text-xs uppercase tracking-wider border-b border-slate-200">
                        <tr>
                           <th className="px-8 py-5 font-bold">Asset Preview</th> 
                           <th className="px-8 py-5 font-bold">Batch / Config</th>
                           <th className="px-8 py-5 font-bold text-center">Volume</th>
                           <th className="px-8 py-5 font-bold text-right">Cost Basis</th>
                           <th className="px-8 py-5 font-bold text-right">Est. Market Val</th>
                           <th className="px-8 py-5 font-bold">Syndication Channels</th>
                           <th className="px-8 py-5 font-bold text-right">Status</th>
                           <th className="px-8 py-5 font-bold text-right">Action</th>
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
                              <tr key={order.id} className="hover:bg-blue-50/50 transition-colors group">
                                 <td className="px-8 py-6 align-middle w-[120px]">
                                    <div className="w-20 h-20 bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                                       <img src={getProductImage(order.product)} alt="asset" className="w-full h-full object-cover mix-blend-multiply"/>
                                    </div>
                                 </td>
                                 
<td className="px-8 py-6 align-middle">
   <div className="flex flex-col gap-1">
      <span className="font-mono text-xs text-slate-400 font-semibold tracking-wide">
         BATCH-CN-{shortId}
      </span>
      
      {order.product_id ? (
        <Link to={`/products/${order.product_id}`} className="text-lg font-bold text-slate-800 hover:text-blue-700 transition-colors line-clamp-1">
           {order.product?.title || "Allocated Inventory Lot"}
        </Link>
      ) : (
        <span className="text-lg font-bold text-slate-500 cursor-not-allowed line-clamp-1" title="Manifest Not Available">
           {order.product?.title || "Allocated Inventory Lot (Locked)"}
        </span>
      )}

      {order.details && order.details.size && (
         <div className="mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
               CONFIG: {order.details.size}
            </span>
         </div>
      )}
   </div>
</td>

                                 <td className="px-8 py-6 align-middle text-center">
                                    <div className="font-mono text-base text-slate-600 font-medium">{qty}</div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Units</div>
                                 </td>

                                 <td className="px-8 py-6 align-middle text-right">
                                    <div className="font-mono text-base text-slate-700 font-medium">{formatCurrency(cost)}</div>
                                 </td>

                                 <td className="px-8 py-6 align-middle text-right">
                                    <div className="font-mono text-base font-bold text-emerald-600">{formatCurrency(marketValue)}</div>
                                    <div className="text-[10px] text-emerald-500 uppercase font-bold mt-0.5">Projected</div>
                                 </td>

                                 <td className="px-8 py-6 align-middle">
                                    {isSold || isRefundPending ? <span className="text-slate-300 font-mono text-xs">-</span> : <DynamicChannelList orderId={order.id} />}
                                 </td>

                                 <td className="px-8 py-6 align-middle text-right">
                                    <div className="flex justify-end">
                                       <StatusBadge isSold={isSold} isRefundPending={isRefundPending} />
                                    </div>
                                 </td>

                                 <td className="px-8 py-6 align-middle text-right">
                                    {!isSold && !isRefundPending && (
                                       <button 
                                          onClick={() => initiateRefund(order)}
                                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 hover:border-red-300 hover:text-red-600 text-slate-400 text-xs font-bold uppercase tracking-wide rounded-lg transition-all"
                                          title="Recall Asset from Market"
                                       >
                                          <FaUndoAlt /> Recall
                                       </button>
                                    )}
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
               
               <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono">
                  <div className="flex items-center gap-2">
                     <FaShip className="opacity-50" />
                     <span>LOGISTICS PARTNER: SHENZHEN GLOBAL SCM LTD.</span>
                  </div>
                  <span>SETTLEMENT CYCLE: T+2 DAYS</span>
               </div>
            </div>
         </>
      )}

      {/* 3. UNWIND MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
           <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
              <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                 <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                       <FaShieldAlt className="text-red-600"/> Protocol Warning
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">REF: UNWIND-{refundModalOrder.id.substring(0,8)}</p>
                 </div>
                 <button onClick={() => setRefundModalOrder(null)} disabled={processingRefund} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><FaTimes className="text-slate-400 hover:text-slate-600"/></button>
              </div>
              <div className="p-6">
                 <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
                    <div className="flex gap-3">
                       <FaExclamationCircle className="text-red-600 mt-0.5 shrink-0" size={16} />
                       <div>
                          <h4 className="text-sm font-bold text-red-900 mb-1">Asset Recall Initiated</h4>
                          <p className="text-xs text-red-800 leading-relaxed">
                             Recalling this asset removes it from active sales channels. A <strong>1.0% Restocking Fee</strong> applies.
                          </p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                    <div className="flex justify-between text-xs text-slate-500 font-mono uppercase tracking-wide">
                       <span>Gross Principal</span>
                       <span className="font-bold">{formatCurrency(Number(refundModalOrder.amount))}</span>
                    </div>
                    <div className="flex justify-between text-xs text-red-600 font-mono uppercase tracking-wide">
                       <span>Restocking Fee (1.0%)</span>
                       <span>-{formatCurrency(Number(refundModalOrder.amount) * 0.01)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-bold text-slate-900 font-mono">
                       <span>Net Return</span>
                       <span>{formatCurrency(Number(refundModalOrder.amount) * 0.99)}</span>
                    </div>
                 </div>

                 <button 
                    onClick={confirmRefund}
                    disabled={processingRefund}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                 >
                    {processingRefund ? <FaSpinner className="animate-spin" /> : <><FaMoneyBillWave /> Confirm Recall</>}
                 </button>
                 <div className="text-center mt-4">
                     <button onClick={() => setRefundModalOrder(null)} className="text-[10px] text-slate-400 hover:text-slate-600 underline decoration-dotted font-bold uppercase tracking-wide">Cancel Request</button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}