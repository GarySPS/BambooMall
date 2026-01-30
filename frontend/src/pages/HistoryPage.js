//src>pages>HistoryPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { fetchResaleHistory } from "../utils/api"; 
import { API_BASE_URL } from "../config"; 
import { 
  FaArrowLeft, 
  FaSearch, 
  FaShoppingBag, 
  FaExchangeAlt, // Kept this one
  FaArrowDown,
  FaArrowUp 
} from "react-icons/fa";

// Helper to fetch wallet transactions
async function fetchWalletHistory(user_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/history/${user_id}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.transactions || []; 
  } catch (error) {
    console.error("Failed to fetch wallet history", error);
    return [];
  }
}

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
        setOrders(Array.isArray(orderData.orders) ? orderData.orders : []);
        setWalletTx(Array.isArray(walletData) ? walletData : []);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [user?.id]);

  // Merge and Filter Logic
  const allItems = [
    ...orders.map(o => ({ ...o, type: 'order', displayType: 'Order' })),
    ...walletTx.map(w => ({ 
      ...w, 
      type: 'wallet', 
      displayType: w.type ? w.type.charAt(0).toUpperCase() + w.type.slice(1) : 'Transaction' 
    }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filteredItems = allItems.filter(item => {
    if (activeTab === "orders" && item.type !== 'order') return false;
    if (activeTab === "wallet" && item.type !== 'wallet') return false;
    
    const term = searchTerm.toLowerCase();
    const title = item.title || item.displayType;
    
    return (
      (title && title.toLowerCase().includes(term)) ||
      (item.status && item.status.toLowerCase().includes(term)) ||
      (item.amount && item.amount.toString().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-[#151516] text-gray-100 p-4 pb-20 font-sans">
      
      {/* Header */}
      <div className="max-w-xl mx-auto mb-6 flex items-center gap-4 sticky top-0 bg-[#151516] z-10 py-4">
        <button onClick={() => navigate('/balance')} className="p-3 bg-zinc-800 rounded-full hover:bg-zinc-700 transition">
          <FaArrowLeft className="text-white" />
        </button>
        <h1 className="text-2xl font-bold">History</h1>
      </div>

      {/* Tabs */}
      <div className="max-w-xl mx-auto mb-6 flex bg-zinc-900 p-1 rounded-xl">
        {['all', 'orders', 'wallet'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
              activeTab === tab ? 'bg-zinc-700 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-6 relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input 
          type="text"
          placeholder="Search transaction ID, status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* List */}
      <div className="max-w-xl mx-auto space-y-3">
        {loading ? (
           <div className="text-center text-gray-500 py-10 animate-pulse">Loading records...</div>
        ) : filteredItems.length === 0 ? (
           <div className="text-center text-gray-500 py-10 flex flex-col items-center">
             <FaExchangeAlt className="text-4xl mb-3 opacity-20" />
             <p>No records found.</p>
           </div>
        ) : (
          filteredItems.map((item, idx) => {
            // FIX: Removed unused 'isDeposit' variable
            const title = item.title || item.displayType;
            
            return (
              <div key={idx} className="bg-zinc-900/80 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:bg-zinc-800 transition-colors">
                
                {/* Icon based on Type */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-inner ${
                  item.type === 'wallet' 
                    ? (item.displayType === 'Withdraw' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400')
                    : 'bg-green-500/10 text-green-400'
                }`}>
                   {item.type === 'wallet' ? (
                      item.displayType === 'Withdraw' ? <FaArrowUp className="rotate-45" /> : <FaArrowDown className="rotate-45" />
                   ) : (
                      <FaShoppingBag />
                   )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-gray-200 truncate pr-2">
                      {title}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      item.status === 'sold' || item.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                      item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2 font-mono">
                     {new Date(item.created_at).toLocaleString()}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-400 font-mono">
                        {item.type === 'wallet' && item.displayType === 'Withdraw' ? '-' : ''}
                        ${Number(item.amount).toFixed(2)}
                     </span>
                     
                     {item.type === 'order' && (
                       <span className="text-emerald-400 font-bold text-xs">
                         Profit: +${Number(item.earn ?? item.profit ?? 0).toFixed(2)}
                       </span>
                     )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}