// src/pages/BalancePage.js

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import { fetchCartOrders, fetchResaleHistory } from "../utils/api";
import { 
  FaWallet, FaArrowDown, FaArrowUp, FaHistory, FaCheck, FaFileInvoiceDollar, 
  FaChevronRight, FaBoxOpen, FaChartPie, FaClock, FaUniversity, FaCircle,
  FaReceipt // Added for mobile cards
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import RestrictedContent from "../components/RestrictedContent";
import DepositModal from "../components/DepositModal";
import WithdrawModal from "../components/WithdrawModal";

// --- SYNDICATE TIER LOGIC ---
function getSyndicateTier(netWorth) {
  if (netWorth >= 20000) return "Global Syndicate (Tier 1)";
  if (netWorth >= 13000) return "Regional Partner (Tier 2)";
  if (netWorth >= 8000)  return "Regional Associate";
  if (netWorth >= 4000)  return "Wholesale Agent (Tier 3)";
  if (netWorth >= 2000)  return "Verified Scout";
  return "Unverified Entity";
}

// --- API Helpers ---
async function fetchWalletFromBackend(user_id) {
  const res = await fetch(`${API_BASE_URL}/wallet/${user_id}`);
  if (!res.ok) throw new Error("Failed to fetch wallet");
  const data = await res.json();
  return data.wallet; 
}

async function fetchTransactionHistory(user_id) {
  const res = await fetch(`${API_BASE_URL}/wallet/history/${user_id}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  const data = await res.json();
  return data.transactions; 
}

export default function BalancePage() {
  const navigate = useNavigate();
  const { wallet, updateWallet, user } = useUser();
  
  const [transactions, setTransactions] = useState([]);
  const [modalType, setModalType] = useState(null); 

  // --- Data Loading Wrapper ---
  const refreshData = useCallback(() => {
    if (user?.id) {
      fetchWalletFromBackend(user.id).then(updateWallet).catch(() => {});

      Promise.all([
        fetchTransactionHistory(user.id).catch(() => []), 
        fetchCartOrders(user.id).catch(() => []),        
        fetchResaleHistory(user.id).catch(() => [])       
      ]).then(([walletData, activeData, historyData]) => {
        
        const wTx = (Array.isArray(walletData) ? walletData : []).map(w => ({ ...w, type: 'wallet' }));
        const rawActive = Array.isArray(activeData) ? activeData : (activeData.orders || []);
        const rawHistory = Array.isArray(historyData) ? historyData : (historyData.orders || []);
        
        const combinedOrders = [...rawActive, ...rawHistory];
        const uniqueOrders = Array.from(new Map(combinedOrders.map(item => [item.id, item])).values())
            .map(o => ({ ...o, type: 'order' })); 

        const allActivity = [...wTx, ...uniqueOrders]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setTransactions(allActivity); 
      });
    }
  }, [user?.id, updateWallet]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // --- WEALTH CALCULATIONS ---
  const liquidBalance = Number(wallet?.balance || 0);
  const stockValue = Number(wallet?.stock_value || 0);
  const netWorth = wallet?.net_worth ? Number(wallet.net_worth) : (liquidBalance + stockValue);
  const tier = getSyndicateTier(netWorth);
  const creditLine = 50000.00; 

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-24 font-sans text-slate-800 animate-fade-in">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 mb-8 gap-4 mt-6">
          <div className="w-full">
             <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
               <span className="p-2 bg-slate-900 text-white rounded-lg"><FaUniversity size={20} /></span>
               Treasury Management
             </h1>
             <div className="flex flex-wrap items-center gap-3 mt-3 text-xs md:text-sm font-mono uppercase tracking-wide">
               <span className="text-slate-500">Entity ID: <span className="text-slate-900 font-bold">{user?.username?.toUpperCase() || "UNKNOWN"}</span></span>
               <span className="text-slate-300 hidden sm:inline">|</span>
               <div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
                  <span className={`w-2 h-2 rounded-full ${netWorth > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></span>
                  <span className="font-bold text-emerald-700">{tier}</span>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm whitespace-nowrap self-start md:self-end">
             <FaCircle className="text-emerald-500 animate-pulse" size={8} />
             <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">System Operational</span>
          </div>
      </div>

      <RestrictedContent>

          {/* 2. CAPITAL STRUCTURE CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              
              {/* CARD 1: SETTLEMENT - DARK THEME */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xl overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                    <FaWallet size={240} />
                 </div>
                 
                 <div className="p-6 md:p-8 relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-8 sm:mb-10 gap-4">
                       <div>
                          <div className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-2">Settlement Balance</div>
                          <div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-white tabular-nums break-words">
                              {formatCurrency(liquidBalance)}
                          </div>
                          <div className="text-emerald-400 text-xs md:text-sm font-mono mt-3 flex items-center gap-1.5">
                             <FaCheck size={12} /> Available for immediate deployment
                          </div>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button 
                          onClick={() => { setModalType("deposit"); }}
                          className="bg-white text-slate-900 hover:bg-slate-50 py-4 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                       >
                          <FaArrowDown className="text-emerald-600" /> Inbound Wire
                       </button>
                       <button 
                          onClick={() => setModalType("withdraw")}
                          className="bg-slate-700/50 text-white border border-slate-600 hover:bg-slate-700 py-4 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:border-slate-500"
                       >
                          <FaArrowUp /> Outbound
                       </button>
                    </div>
                 </div>
              </div>

              {/* CARD 2: NET WORTH SUMMARY - CLEAN LIGHT THEME */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col justify-between">
                 
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <div className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-2">Total Capital (Net Worth)</div>
                       <div className="text-3xl md:text-4xl font-mono font-bold text-slate-900 tabular-nums">
                           {formatCurrency(netWorth)}
                       </div>
                    </div>
                    <div className="p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hidden sm:block">
                       <FaChartPie size={24} />
                    </div>
                 </div>

                 {/* Breakdown */}
                 <div className="space-y-4 font-mono text-xs md:text-sm">
                    <div className="flex items-center justify-between group">
                        <span className="text-slate-500 flex items-center gap-3 group-hover:text-slate-800 transition-colors whitespace-nowrap">
                           <FaWallet className="text-slate-400" size={14}/> Liquid Cash
                        </span>
                        <div className="flex-1 mx-4 border-b border-dotted border-slate-300 relative top-[-4px] hidden sm:block"></div>
                        <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(liquidBalance)}</span>
                    </div>
                    <div className="flex items-center justify-between group">
                        <span className="text-slate-500 flex items-center gap-3 group-hover:text-slate-800 transition-colors whitespace-nowrap">
                           <FaBoxOpen className="text-slate-400" size={14}/> Active Inventory
                        </span>
                        <div className="flex-1 mx-4 border-b border-dotted border-slate-300 relative top-[-4px] hidden sm:block"></div>
                        <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(stockValue)}</span>
                    </div>
                 </div>

                 <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="bg-slate-50/80 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 gap-2">
                       <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                          <FaFileInvoiceDollar /> Syndicate Credit Line
                       </span>
                       <span className="text-sm font-mono font-bold text-slate-900 tabular-nums">{formatCurrency(creditLine)}</span>
                    </div>
                 </div>
              </div>
          </div>

          {/* 3. FISCAL LEDGER (Responsive Switch) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-3">
                 <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <FaHistory className="text-slate-400"/> Fiscal Ledger
                 </h3>
                 <button 
                    onClick={() => navigate('/history')}
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline underline-offset-2 transition-all"
                 >
                    View Full Ledger <FaChevronRight size={12} />
                 </button>
              </div>
              
              {/* === A. MOBILE TRANSACTION LIST (< md) === */}
              <div className="md:hidden">
                 {transactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic text-sm">
                       No recent activity.
                    </div>
                 ) : (
                    <div className="divide-y divide-slate-100">
                       {transactions.slice(0, 8).map((tx) => (
                          <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors">
                             <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${
                                   Number(tx.amount) > 0 || (tx.type === 'wallet' && tx.amount > 0) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                   {tx.type === 'order' ? <FaBoxOpen size={12} /> : <FaReceipt size={12} />}
                                </div>
                                <div>
                                   <div className="font-bold text-slate-800 text-sm line-clamp-1">
                                      {tx.note || tx.product?.title || (tx.type === 'deposit' ? "External Inbound" : "Settlement Outbound")}
                                   </div>
                                   <div className="text-[10px] text-slate-400 font-mono">
                                      #{tx.id.toString().substring(0,8).toUpperCase()} • {tx.type === 'order' ? 'Purchase' : 'Transfer'}
                                   </div>
                                </div>
                             </div>
                             <div className="text-right">
                                <div className={`font-mono font-bold text-sm ${
                                   Number(tx.amount) > 0 || (tx.type === 'wallet' && tx.amount > 0) ? 'text-emerald-600' : 'text-slate-900'
                                }`}>
                                   {tx.type === 'order' ? '-' : (Number(tx.amount) > 0 ? '+' : '')}
                                   {formatCurrency(Math.abs(Number(tx.amount)))}
                                </div>
                                <div className="text-[10px] uppercase font-bold text-slate-400">
                                   {tx.status}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* === B. DESKTOP TABLE VIEW (>= md) === */}
              <div className="hidden md:block overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-white text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                       <tr>
                          <th className="px-6 py-4 font-semibold">Tx ID</th>
                          <th className="px-6 py-4 font-semibold">Type</th>
                          <th className="px-6 py-4 font-semibold">Memo / Context</th>
                          <th className="px-6 py-4 font-semibold text-right">Amount</th>
                          <th className="px-6 py-4 font-semibold text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                       {transactions.slice(0, 8).map((tx) => (
                             <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group cursor-default">
                                <td className="px-6 py-4 font-mono text-xs text-slate-400 group-hover:text-slate-600">
                                   <span className="opacity-50 select-none">#</span>{tx.id.toString().substring(0,8).toUpperCase()}
                                </td>
                                <td className="px-6 py-4">
                                   <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                      tx.type === 'wallet' 
                                      ? (tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100')
                                      : 'bg-slate-100 text-slate-600 border-slate-200' 
                                   }`}>
                                      {tx.type === 'order' ? 'Purchase' : tx.type}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                                   <span className="font-medium text-slate-700">
                                        {tx.note || tx.product?.title || (tx.type === 'deposit' ? "External Inbound" : "Settlement Outbound")}
                                   </span>
                                   {tx.type === 'order' && <span className="text-xs text-slate-400 ml-2 font-mono bg-slate-100 px-1 rounded">x{tx.quantity || tx.qty}</span>}
                                </td>
                                <td className={`px-6 py-4 text-right font-mono font-bold tracking-tight tabular-nums ${
                                   Number(tx.amount) > 0 || (tx.type === 'wallet' && tx.amount > 0) ? 'text-emerald-600' : 'text-slate-800'
                                }`}>
                                   {tx.type === 'order' ? '-' : (Number(tx.amount) > 0 ? '+' : '')}
                                   {formatCurrency(Math.abs(Number(tx.amount)))}
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex justify-end">
                                        {tx.type === 'wallet' ? (
                                          (tx.status === 'completed' || tx.status === 'approved') 
                                          ? <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase"><FaCheck size={10}/> Cleared</span>
                                          : <span className="flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase"><FaClock size={10}/> Pending</span>
                                        ) : (
                                          tx.status === 'selling' 
                                          ? <span className="flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span> Live</span>
                                          : (tx.status === 'sold' 
                                             ? <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase"><FaCheck size={10}/> Sold</span>
                                             : <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase">{tx.status}</span>
                                            )
                                        )}
                                   </div>
                                </td>
                             </tr>
                          ))
                       }
                       {transactions.length === 0 && (
                          <tr>
                             <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/30">
                                <div className="mb-2 opacity-20"><FaFileInvoiceDollar size={32} className="mx-auto"/></div>
                                No fiscal records found for this period.
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
          </div>

          {/* --- MODALS --- */}
          <DepositModal 
            isOpen={modalType === "deposit"} 
            onClose={() => setModalType(null)} 
            onSuccess={refreshData}
            user={user}
          />

          <WithdrawModal
            isOpen={modalType === "withdraw"}
            onClose={() => setModalType(null)} 
            onSuccess={refreshData}
            user={user}
            liquidBalance={liquidBalance}
          />

      </RestrictedContent>
    </div>
  );
}