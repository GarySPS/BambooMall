// src/pages/HistoryPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { fetchResaleHistory, fetchWalletHistory } from "../utils/api"; 
import { getProductImage } from "../utils/image"; // IMPORTED IMAGE UTILITY
import { 
  FaArrowLeft, 
  FaSearch, 
  FaBoxOpen, 
  FaExchangeAlt,
  FaArrowDown,
  FaArrowUp,
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
        fetchResaleHistory(user.id).catch(() => ({ orders: [] })),
        fetchWalletHistory(user.id).catch(() => [])
      ]).then(([orderData, walletData]) => {
        setOrders(Array.isArray(orderData) ? orderData : (orderData.orders || []));
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans animate-fade-in">
      
      <div className="max-w-4xl mx-auto p-6 pb-20">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6">
          <button onClick={() => navigate('/balance')} className="p-2 text-slate-400 hover:text-blue-900 transition">
             <FaArrowLeft size={20} />
          </button>
          <div>
             <h1 className="text-2xl font-bold text-slate-800">Master Ledger</h1>
             <p className="text-xs text-slate-500 font-mono">FISCAL YEAR 2026 // CONSOLIDATED RECORDS</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
           <div className="flex bg-white border border-slate-200 p-1 rounded shadow-sm">
             {['all', 'orders', 'wallet'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-6 py-2 text-xs font-bold rounded uppercase tracking-wide transition-all ${
                   activeTab === tab ? 'bg-blue-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'
                 }`}
               >
                 {tab === 'all' ? 'All Activity' : tab === 'orders' ? 'Allocations' : 'Treasury'}
               </button>
             ))}
           </div>
           
           <div className="relative flex-1">
             <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text"
               placeholder="Search by ID, Asset Name, or Note..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white border border-slate-200 rounded pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
             />
           </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
             <div className="text-center text-slate-400 py-20 font-mono text-xs uppercase tracking-widest">Retrieving Fiscal Data...</div>
          ) : filteredItems.length === 0 ? (
             <div className="text-center text-slate-400 py-20 flex flex-col items-center">
               <FaExchangeAlt className="text-4xl mb-3 opacity-20" />
               <p className="text-sm">No records match your criteria.</p>
             </div>
          ) : (
            filteredItems.map((item, idx) => {
              // Determine Title
              const title = item.product?.title || item.title || item.note || item.displayType;
              
              // Determine Financial Direction
              // Order = Negative (Spending) unless it's sold profit (but usually we show cost here)
              // Deposit = Positive
              // Withdraw = Negative
              const isPositive = item.type === 'wallet' && item.displayType === 'Inbound Wire';
              const isOrder = item.type === 'order';
              const isProfit = item.status === 'sold' && item.earn > 0;

              return (
                <div key={idx} className="bg-white border border-slate-200 p-4 rounded shadow-sm flex items-center gap-4 hover:border-blue-300 transition-colors group">
                  
                  {/* ICON OR IMAGE */}
                  <div className={`w-12 h-12 rounded overflow-hidden flex items-center justify-center text-lg flex-shrink-0 ${
                    item.type === 'wallet' 
                      ? (isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')
                      : 'bg-white border border-slate-200'
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
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-sm text-slate-700 truncate pr-2">
                        {title}
                        <div className="text-[10px] text-slate-400 font-mono font-normal mt-0.5 flex items-center gap-2">
                           <span>ID: {item.id.toString().substring(0,8).toUpperCase()}</span>
                           <span>• {new Date(item.created_at).toLocaleDateString()}</span>
                           {isOrder && <span className="bg-slate-100 px-1 rounded text-slate-500">QTY: {item.quantity || item.qty}</span>}
                        </div>
                      </div>
                      
                      <div className="text-right">
                         {/* Amount Display */}
                         <div className={`font-mono font-bold text-sm ${
                            isPositive || isProfit ? 'text-emerald-600' : 'text-slate-800'
                         }`}>
                            {isOrder 
                              ? `-$${Number(item.amount).toFixed(2)}` // Orders are costs
                              : `${isPositive ? '+' : ''}${Number(item.amount).toFixed(2)}` // Wallet TX
                            }
                         </div>
                         
                         {/* Status / Profit Badge */}
                         {isOrder && item.status === 'sold' ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                               Recouped: +${(Number(item.resale_amount || 0)).toFixed(2)}
                            </span>
                         ) : (
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                               item.status === 'completed' || item.status === 'sold' ? 'text-emerald-600' : 'text-amber-500'
                            }`}>
                               {item.status}
                            </span>
                         )}
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