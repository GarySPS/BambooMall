//src>pages>BalancePage.js

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../contexts/UserContext";
import { 
  fetchCartOrders, 
  fetchResaleHistory, 
  fetchWalletBalance,
  fetchWalletHistory
} from "../utils/api";
import { 
  FaWallet, FaArrowDown, FaArrowUp, FaHistory, FaCheck, FaFileInvoiceDollar, 
  FaChevronRight, FaBoxOpen, FaChartPie, FaClock, FaUniversity, FaCircle,
  FaReceipt, FaLock, FaCreditCard
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

export default function BalancePage() {
  const navigate = useNavigate();
  const { wallet, updateWallet, user } = useUser();
  
  const [transactions, setTransactions] = useState([]);
  const [modalType, setModalType] = useState(null); 

  // --- Scroll Locking Logic ---
  useEffect(() => {
    if (modalType) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalType]);

  // --- Data Loading Wrapper ---
  const refreshData = useCallback(() => {
    if (user?.id) {
      // 1. Fetch Wallet (Securely)
      fetchWalletBalance(user.id).then(updateWallet).catch(() => {});

      // 2. Fetch All History (Securely)
      Promise.all([
        fetchWalletHistory(user.id).catch(() => []), 
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
  // Credit limit is now handled by backend/context, or static display here
  const creditLine = 50000.00; 

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-[1600px] mx-auto px-4 md:px-0">
      
      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4 px-1">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-4">
              <span className="bg-slate-900 text-white p-3 rounded-xl shadow-md">
                <FaUniversity size={24} />
              </span>
              Treasury Management
            </h2>
            <div className="flex items-center gap-4 mt-3 text-sm font-medium text-slate-500 uppercase tracking-wide">
              <span className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> 
                SYSTEM OPERATIONAL
              </span>
              <span className="text-slate-300">|</span>
              <span>ENTITY ID: <span className="text-slate-900 font-bold">{user?.username?.toUpperCase() || "UNKNOWN"}</span></span>
            </div>
         </div>

         <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm w-full md:min-w-[200px]">
               <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-1">Syndicate Tier</div>
               <div className={`text-lg md:text-xl font-bold truncate ${netWorth > 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
                 {tier}
               </div>
            </div>
         </div>
      </div>

      {/* 2. MAIN DASHBOARD CONTENT (Secured by KYC) */}
      <RestrictedContent>
          
          {/* --- TOP: CAPITAL CARDS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-4">
              {/* CARD 1: SETTLEMENT */}
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       {/* 1. Existing Manual Transfer */}
                       <button onClick={() => { setModalType("deposit"); }} className="bg-white/10 text-white hover:bg-white/20 border border-white/10 py-4 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0">
                          <FaArrowDown className="text-emerald-400" /> Inbound Wire
                       </button>

                       {/* 2. NEW Premium Direct Fiat-to-Crypto Button */}
                       <button 
                          onClick={() => { window.open("https://buy.moonpay.com?currencyCode=usdc_base&walletAddress=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", "_blank"); }} 
                          className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] transform hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] border border-blue-400/30"
                       >
                          {/* Shine Effect */}
                          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"></div>
                          <FaCreditCard className="text-blue-100" size={16} /> 
                          <span>Buy with Card <span className="text-[10px] uppercase font-bold text-blue-200 ml-1 bg-blue-900/40 px-1.5 py-0.5 rounded">Fast</span></span>
                       </button>

                       {/* 3. Existing Outbound */}
                       <button onClick={() => setModalType("withdraw")} className="bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white py-4 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:border-slate-600">
                          <FaArrowUp /> Outbound
                       </button>
                    </div>
                 </div>
              </div>

              {/* CARD 2: NET WORTH SUMMARY */}
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
                 <div className="space-y-4 font-mono text-xs md:text-sm">
                    <div className="flex items-center justify-between group">
                        <span className="text-slate-500 flex items-center gap-3 group-hover:text-slate-800 transition-colors whitespace-nowrap"><FaWallet className="text-slate-400" size={14}/> Liquid Cash</span>
                        <div className="flex-1 mx-4 border-b border-dotted border-slate-300 relative top-[-4px] hidden sm:block"></div>
                        <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(liquidBalance)}</span>
                    </div>
                    <div className="flex items-center justify-between group">
                        <span className="text-slate-500 flex items-center gap-3 group-hover:text-slate-800 transition-colors whitespace-nowrap"><FaBoxOpen className="text-slate-400" size={14}/> Active Inventory</span>
                        <div className="flex-1 mx-4 border-b border-dotted border-slate-300 relative top-[-4px] hidden sm:block"></div>
                        <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(stockValue)}</span>
                    </div>
                 </div>
                 <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="bg-slate-50/80 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 gap-2">
                       <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><FaFileInvoiceDollar /> Syndicate Credit Line</span>
                       <span className="text-sm font-mono font-bold text-slate-900 tabular-nums">{formatCurrency(creditLine)}</span>
                    </div>
                 </div>
              </div>
          </div>

          {/* --- MIDDLE: PROMO CARD --- */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col md:flex-row relative mb-8">
            <div className="absolute -top-10 -right-10 p-12 opacity-5 pointer-events-none"><FaUniversity size={200} className="text-white" /></div>
            <div className="p-6 md:p-8 flex-1 z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                   user?.kyc_status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                   user?.kyc_status === 'pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                   'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>Capital Deployment</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {user?.kyc_status === 'approved' ? "Treasury Access Unlocked" : user?.kyc_status === 'pending' ? "Compliance Review Active" : "Secure Your Treasury Access"}
              </h3>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
                {user?.kyc_status === 'approved' 
                  ? "Your dealership identity is verified. You now have full clearance for inbound wires, outbound settlements, and unrestricted ledger operations." 
                  : user?.kyc_status === 'pending'
                  ? "Your documentation has been received and is under priority review. Operations will unlock upon final compliance approval."
                  : <>Unverified entities cannot process inbound or outbound wires. Complete your identity verification to unlock full ledger access and your <strong className="text-white">$100 starting grant</strong>.</>}
              </p>

              {/* --- NEW WELCOME BONUS NOTE --- */}
              <div className="mt-4 bg-blue-900/30 border border-blue-800/50 rounded-lg p-3 flex items-start gap-3 max-w-2xl">
                <FaLock className="text-blue-400 mt-0.5 flex-shrink-0" size={14} />
                <p className="text-blue-200 text-xs md:text-sm leading-relaxed">
                  <strong className="text-blue-300">Bonus Notice:</strong> The $100 agent welcome bonus is locked and can only be withdrawn once you reach the <strong className="text-white">Verified Scout</strong> partnership tier.
                </p>
              </div>
              {/* ------------------------------ */}

            </div>
            <div className="bg-slate-800/50 p-6 md:p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-700/50 z-10 backdrop-blur-sm">
              {user?.kyc_status === 'approved' ? (
                <button disabled className="w-full md:w-auto px-8 py-4 bg-slate-800/50 text-emerald-500 border border-emerald-500/20 font-bold rounded-lg flex items-center justify-center gap-3 cursor-not-allowed"><FaLock /> Verified Identity</button>
              ) : user?.kyc_status === 'pending' ? (
                <button disabled className="w-full md:w-auto px-8 py-4 bg-slate-800/50 text-amber-500 border border-amber-500/20 font-bold rounded-lg flex items-center justify-center gap-3 cursor-not-allowed"><FaClock className="animate-pulse" /> Audit Pending</button>
              ) : (
                <button onClick={() => navigate('/kyc-verification')} className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-3 group">
                  Verify Identity <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>

          {/* --- BOTTOM: FISCAL LEDGER --- */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-3">
                 <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <FaHistory className="text-slate-400"/> Fiscal Ledger
                 </h3>
                 <button onClick={() => navigate('/history')} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline underline-offset-2 transition-all">
                    View Full Ledger <FaChevronRight size={12} />
                 </button>
              </div>
              
              {/* MOBILE LIST */}
              <div className="md:hidden">
                 {transactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic text-sm">No recent activity.</div>
                 ) : (
                    <div className="divide-y divide-slate-100">
                       {transactions.slice(0, 8).map((tx) => (
                          <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors">
                             <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${Number(tx.amount) > 0 || (tx.type === 'wallet' && tx.amount > 0) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                   {tx.type === 'order' ? <FaBoxOpen size={12} /> : <FaReceipt size={12} />}
                                </div>
                                <div>
                                   <div className="font-bold text-slate-800 text-sm line-clamp-1">{tx.note || tx.product?.title || (tx.type === 'deposit' ? "External Inbound" : "Settlement Outbound")}</div>
                                   <div className="text-[10px] text-slate-400 font-mono">#{tx.id.toString().substring(0,8).toUpperCase()} • {tx.type === 'order' ? 'Purchase' : 'Transfer'}</div>
                                </div>
                             </div>
                             <div className="text-right">
                                <div className={`font-mono font-bold text-sm ${Number(tx.amount) > 0 || (tx.type === 'wallet' && tx.amount > 0) ? 'text-emerald-600' : 'text-slate-900'}`}>
                                   {tx.type === 'order' ? '-' : (Number(tx.amount) > 0 ? '+' : '')}{formatCurrency(Math.abs(Number(tx.amount)))}
                                </div>
                                <div className="text-[10px] uppercase font-bold text-slate-400">{tx.status}</div>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* DESKTOP TABLE */}
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
                                      tx.type === 'wallet' ? (tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100') : 'bg-slate-100 text-slate-600 border-slate-200' 
                                   }`}>{tx.type === 'order' ? 'Purchase' : tx.type}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                                   <span className="font-medium text-slate-700">{tx.note || tx.product?.title || (tx.type === 'deposit' ? "External Inbound" : "Settlement Outbound")}</span>
                                   {tx.type === 'order' && <span className="text-xs text-slate-400 ml-2 font-mono bg-slate-100 px-1 rounded">x{tx.quantity || tx.qty}</span>}
                                </td>
                                <td className={`px-6 py-4 text-right font-mono font-bold tracking-tight tabular-nums ${Number(tx.amount) > 0 || (tx.type === 'wallet' && tx.amount > 0) ? 'text-emerald-600' : 'text-slate-800'}`}>
                                   {tx.type === 'order' ? '-' : (Number(tx.amount) > 0 ? '+' : '')}{formatCurrency(Math.abs(Number(tx.amount)))}
                                </td>
                                <td className="px-6 py-4 text-right">
                                   <div className="flex justify-end">
                                        {tx.type === 'wallet' ? (
                                           (tx.status === 'completed' || tx.status === 'approved') ? <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase"><FaCheck size={10}/> Cleared</span> : <span className="flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase"><FaClock size={10}/> Pending</span>
                                        ) : (
                                           tx.status === 'selling' ? <span className="flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span> Live</span> : (tx.status === 'sold' ? <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase"><FaCheck size={10}/> Sold</span> : <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase">{tx.status}</span>)
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
          <DepositModal isOpen={modalType === "deposit"} onClose={() => setModalType(null)} onSuccess={refreshData} user={user} />
          <WithdrawModal isOpen={modalType === "withdraw"} onClose={() => setModalType(null)} onSuccess={refreshData} user={user} liquidBalance={liquidBalance} />

      </RestrictedContent>

    </div>
  );
}