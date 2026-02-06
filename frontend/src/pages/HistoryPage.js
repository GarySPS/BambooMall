// src/pages/HistoryPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { fetchResaleHistory, fetchWalletHistory, fetchCartOrders } from "../utils/api"; 
import { getProductImage } from "../utils/image"; 
import { 
  FaArrowLeft, 
  FaSearch, 
  FaExchangeAlt,
  FaArrowDown,
  FaArrowUp,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaFileInvoiceDollar
} from "react-icons/fa";

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("all"); 
  const [orders, setOrders] = useState([]);
  const [walletTx, setWalletTx] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      Promise.all([
        fetchCartOrders(user.id).catch(() => []),      // 1. Get ACTIVE (Selling)
        fetchResaleHistory(user.id).catch(() => []),   // 2. Get HISTORY (Sold)
        fetchWalletHistory(user.id).catch(() => [])    // 3. Get WALLET
      ]).then(([activeData, historyData, walletData]) => {
        
        const rawActive = Array.isArray(activeData) ? activeData : (activeData.orders || []);
        const rawHistory = Array.isArray(historyData) ? historyData : (historyData.orders || []);
        
        const combinedOrders = [...rawActive, ...rawHistory];
        const uniqueOrders = Array.from(new Map(combinedOrders.map(item => [item.id, item])).values());

        setOrders(uniqueOrders);
        setWalletTx(Array.isArray(walletData) ? walletData : []);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [user?.id]);

  // Merge and Sort
  const allItems = [
    ...orders.map(o => ({ ...o, type: 'order', displayType: 'Acquisition' })),
    ...walletTx.map(w => ({ 
      ...w, 
      type: 'wallet', 
      displayType: w.type === 'deposit' ? 'Inbound Wire' : 'Outbound Transfer' 
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filteredItems = allItems.filter(item => {
    if (activeTab === "orders" && item.type !== 'order') return false;
    if (activeTab === "wallet" && item.type !== 'wallet') return false;
    
    const term = searchTerm.toLowerCase();
    const title = item.product?.title || item.title || item.note || item.displayType;
    return (
      (title && title.toLowerCase().includes(term)) ||
      (item.status && item.status.toLowerCase().includes(term))
    );
  });

  // Helper for Status Badge
  const getStatusBadge = (item) => {
    if (item.type === 'wallet') {
        const isCleared = item.status === 'completed' || item.status === 'approved';
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                isCleared 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
                {isCleared ? <FaCheckCircle size={12}/> : <FaClock size={12}/>} 
                {isCleared ? "Cleared" : "Pending"}
            </span>
        );
    }
    // Orders
    if (item.status === 'selling') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span> Live Market
            </span>
        );
    }
    if (item.status === 'sold') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold uppercase tracking-wide">
                <FaCheckCircle size={12}/> Liquidated
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold uppercase tracking-wide">
            {item.status}
        </span>
    );
  };

  return (
    // Added padding for mobile (px-4)
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans animate-fade-in pb-20">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <button 
            onClick={() => navigate('/balance')} 
            className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
          >
             <FaArrowLeft size={20} />
          </button>
          <div>
             <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Master Ledger</h1>
             <p className="text-sm text-slate-500 font-mono mt-1">FISCAL YEAR 2026 // CONSOLIDATED RECORDS</p>
          </div>
        </div>

        {/* Controls - Stacked on Mobile, Row on Desktop */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
           <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm overflow-x-auto">
             {['all', 'orders', 'wallet'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg uppercase tracking-wide transition-all whitespace-nowrap ${
                   activeTab === tab 
                   ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                   : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                 }`}
               >
                 {tab === 'all' ? 'All Activity' : tab === 'orders' ? 'Allocations' : 'Treasury'}
               </button>
             ))}
           </div>
           
           <div className="relative flex-1">
             <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
             <input 
               type="text"
               placeholder="Search transactions..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all shadow-sm"
             />
           </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center text-slate-400 py-20 font-mono text-xs uppercase tracking-widest flex flex-col items-center gap-4">
                <FaSpinner className="animate-spin text-3xl"/>
                Retrieving Fiscal Data...
             </div>
          ) : filteredItems.length === 0 ? (
             <div className="text-center text-slate-400 py-24 flex flex-col items-center bg-white rounded-2xl border border-slate-200 border-dashed">
               <FaExchangeAlt className="text-5xl mb-4 opacity-10" />
               <p className="text-sm font-medium">No records match your criteria.</p>
             </div>
          ) : (
            filteredItems.map((item, idx) => {
              // Determine Title
              const title = item.product?.title || item.title || item.note || item.displayType;
              
              // Determine Financial Direction
              const isPositive = item.type === 'wallet' && item.displayType === 'Inbound Wire';
              const isOrder = item.type === 'order';
              const isProfit = item.status === 'sold' && item.earn > 0;

              return (
                <div key={idx} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group">
                  
                  <div className="flex items-center gap-4 w-full">
                      {/* ICON OR IMAGE */}
                      <div className={`w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center text-xl flex-shrink-0 border ${
                        item.type === 'wallet' 
                          ? (isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100')
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                          {isOrder ? (
                            <img 
                              src={getProductImage(item.product)} 
                              alt="thumb" 
                              className="w-full h-full object-cover mix-blend-multiply"
                            />
                          ) : (
                             isPositive ? <FaArrowDown /> : <FaArrowUp />
                          )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div className="font-bold text-slate-800 truncate pr-2 text-sm sm:text-base">
                            {title}
                            <div className="text-xs text-slate-400 font-mono font-normal mt-1 flex flex-wrap items-center gap-2">
                               <span>ID: {item.id.toString().substring(0,8).toUpperCase()}</span>
                               <span className="hidden sm:inline">•</span>
                               <span>{new Date(item.created_at).toLocaleDateString()}</span>
                               {isOrder && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold border border-slate-200">QTY: {item.quantity || item.qty}</span>}
                            </div>
                          </div>
                          
                          <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end mt-3 sm:mt-0 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                              {/* Amount Display */}
                              <div className={`font-mono font-bold text-sm sm:text-base ${
                                 isPositive || isProfit ? 'text-emerald-600' : 'text-slate-900'
                              }`}>
                                 {isOrder 
                                   ? `-$${Number(item.amount).toFixed(2)}` 
                                   : `${isPositive ? '+' : ''}${Number(item.amount).toFixed(2)}` 
                                 }
                              </div>
                              
                              {/* Status Badge */}
                              <div className="mt-0 sm:mt-1">
                                 {getStatusBadge(item)}
                              </div>
                          </div>
                        </div>
                      </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}