// src/pages/BalancePage.js

import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import { fetchCartOrders, fetchResaleHistory } from "../utils/api";
import { 
  FaWallet, 
  FaArrowDown, 
  FaArrowUp, 
  FaHistory, 
  FaCheck, 
  FaTimes, 
  FaUniversity,
  FaBuilding,
  FaGlobe,
  FaShieldAlt,
  FaFileInvoiceDollar,
  FaChevronRight,
  FaExclamationTriangle,
  FaBoxOpen,
  FaChartPie,
  FaClock
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import RestrictedContent from "../components/RestrictedContent";

// --- SYNDICATE TIER LOGIC (UPDATED: $2k - $20k) ---
function getSyndicateTier(netWorth) {
  if (netWorth >= 20000) return "Global Syndicate (Tier 1)";
  if (netWorth >= 13000) return "Regional Partner (Tier 2)";
  if (netWorth >= 8000)  return "Regional Associate";
  if (netWorth >= 4000)  return "Wholesale Agent (Tier 3)";
  if (netWorth >= 2000)  return "Verified Scout";
  return "Unverified Entity";
}

// --- Payment Rails Configuration ---
const PAYMENT_CHANNELS = {
  "USDC-TRC20": { 
      type: "crypto",
      label: "USDC (TRC20)", 
      address: "TW4ig5B5Re713KRfSVsQCGAAAvYJFbS3Z6", 
      icon: <FaGlobe className="text-teal-500" />,
      desc: "Fee-Free • Instant Settlement (T+0)"
  },
  "WISE-GLOBAL": { 
      type: "fiat",
      label: "Wise (TransferWise) / ACH", 
      address: "ACH: 021000021 | ACC: 9902841922 (Wise Inc)", 
      icon: <FaUniversity className="text-blue-700" />,
      desc: "⚠️ High Tariff • 3-5 Business Days"
  },
  "ALIPAY-CN": { 
      type: "fiat",
      label: "Alipay Cross-Border", 
      address: "MERCHANT-ID: 2088-1021-4822 (BambooMall HK)", 
      icon: <FaBuilding className="text-blue-400" />,
      desc: "⚠️ High Tariff • Mainland CN Only"
  }
};

const TOP_UP_AMOUNT = 5000;

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

async function uploadDepositScreenshot(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/upload/deposit`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url;
}

async function submitDepositToBackend({ user_id, amount, screenshot_url, note }) {
  const res = await fetch(`${API_BASE_URL}/wallet/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, amount, screenshot_url, note }),
  });
  if (!res.ok) throw new Error("Deposit API failed");
  return await res.json();
}

async function submitWithdrawToBackend({ user_id, amount, address, note }) {
  const res = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, amount, address, note }),
  });
  if (!res.ok) throw new Error("Withdraw API failed");
  return await res.json();
}

// --- Main Page ---
export default function BalancePage() {
  const navigate = useNavigate();
  const { wallet, updateWallet, user } = useUser();
  
  const [transactions, setTransactions] = useState([]);
  const [modalType, setModalType] = useState(null); 
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [depositAmount, setDepositAmount] = useState(TOP_UP_AMOUNT);
  const [depositScreenshot, setDepositScreenshot] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [submitState, setSubmitState] = useState("idle"); 

  useEffect(() => {
    if (user?.id) {
      // 1. Fetch Wallet Balance
      fetchWalletFromBackend(user.id).then(updateWallet).catch(() => {});

      // 2. Fetch Full History (Wallet + Orders)
      Promise.all([
        fetchTransactionHistory(user.id).catch(() => []), // <--- YOUR LOCAL FUNCTION
        fetchCartOrders(user.id).catch(() => []),         // Active Orders
        fetchResaleHistory(user.id).catch(() => [])       // Sold Orders
      ]).then(([walletData, activeData, historyData]) => {
        
        // Normalize Wallet Data
        const wTx = (Array.isArray(walletData) ? walletData : []).map(w => ({ ...w, type: 'wallet' }));
        
        // Normalize Order Data
        const rawActive = Array.isArray(activeData) ? activeData : (activeData.orders || []);
        const rawHistory = Array.isArray(historyData) ? historyData : (historyData.orders || []);
        
        // Merge Orders (Dedupe by ID)
        const combinedOrders = [...rawActive, ...rawHistory];
        const uniqueOrders = Array.from(new Map(combinedOrders.map(item => [item.id, item])).values())
            .map(o => ({ ...o, type: 'order' })); 

        // Merge All & Sort by Date (Newest First)
        const allActivity = [...wTx, ...uniqueOrders]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setTransactions(allActivity); 
      });
    }
  }, [user?.id, updateWallet]);

  // --- WEALTH CALCULATIONS ---
  // 1. Liquid Cash (Spending Power)
  const liquidBalance = Number(wallet?.balance || 0);
  
  // 2. Stock Value (Inventory Assets)
  const stockValue = Number(wallet?.stock_value || 0);

  // 3. Net Worth (Basis for Tier)
  // If backend provides net_worth use it, otherwise calc locally
  const netWorth = wallet?.net_worth ? Number(wallet.net_worth) : (liquidBalance + stockValue);

  // 4. Tier & Credit
  const tier = getSyndicateTier(netWorth);
  const creditLine = 50000.00; 

  // Handlers
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setSubmitState("submitting");
    try {
      const screenshotUrl = await uploadDepositScreenshot(depositScreenshot);
      await submitDepositToBackend({
        user_id: user.id,
        amount: depositAmount,
        screenshot_url: screenshotUrl,
        note: selectedMethod,
      });

      fetchTransactionHistory(user.id).then(setTransactions);
      fetchWalletFromBackend(user.id).then(updateWallet);

      setSubmitState("success");
      setTimeout(() => { setModalType(null); setSubmitState("idle"); }, 1500);
    } catch (err) {
      setSubmitState("error");
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setSubmitState("submitting");
    try {
      await submitWithdrawToBackend({
        user_id: user.id,
        amount: withdrawAmount,
        address: withdrawAddress,
        note: "External Settlement",
      });
      fetchWalletFromBackend(user.id).then(updateWallet);
      fetchTransactionHistory(user.id).then(setTransactions);
      setSubmitState("success");
      setTimeout(() => { setModalType(null); setSubmitState("idle"); }, 1500);
    } catch (err) {
      setSubmitState("error");
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20 font-sans text-slate-800">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200 pb-6">
          <div>
             <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
               <FaUniversity className="text-blue-900" />
               Treasury Management
             </h1>
             <p className="text-xs text-slate-500 font-mono mt-1">
               ENTITY: {user?.username?.toUpperCase() || "AGENT"} <span className="mx-2 text-slate-300">|</span> STATUS: <span className="text-emerald-600 font-bold">{tier.toUpperCase()}</span>
             </p>
          </div>
      </div>

      <RestrictedContent>

          {/* LIQUIDITY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LEFT: Liquid Cash (Wallet) */}
              <div className="bg-white p-8 rounded shadow-sm border border-slate-200 relative overflow-hidden">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Settlement Balance (Liquid)</div>
                       <div className="text-4xl font-mono font-bold text-slate-900">
                           ${liquidBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                       </div>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                       <FaWallet size={24} />
                    </div>
                 </div>
                 
                 <div className="flex gap-4">
                    <button 
                       onClick={() => { setModalType("deposit"); setSelectedMethod(null); }}
                       className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-3 rounded text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg"
                    >
                       <FaArrowDown /> Inbound Wire
                    </button>
                    <button 
                       onClick={() => { setModalType("withdraw"); }}
                       className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded text-sm font-bold flex items-center justify-center gap-2 transition"
                    >
                       <FaArrowUp /> Outbound Transfer
                    </button>
                 </div>
              </div>

              {/* RIGHT: Total Capital Structure (Net Worth) */}
              <div className="bg-slate-50 p-8 rounded shadow-inner border border-slate-200">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Capital (Net Worth)</div>
                       <div className="text-4xl font-mono font-bold text-slate-700">
                           ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                       </div>
                    </div>
                    <div className="p-3 bg-white text-slate-400 rounded-full border border-slate-200">
                       <FaChartPie size={24} />
                    </div>
                 </div>

                 {/* Capital Breakdown */}
                 <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-mono border-b border-slate-200 pb-1">
                        <span className="text-slate-500 flex items-center gap-2"><FaWallet size={10}/> Liquid Cash</span>
                        <span className="font-bold text-slate-700">${liquidBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono border-b border-slate-200 pb-1">
                        <span className="text-slate-500 flex items-center gap-2"><FaBoxOpen size={10}/> Active Inventory</span>
                        <span className="font-bold text-slate-700">${stockValue.toLocaleString()}</span>
                    </div>
                 </div>
                 
                 <div className="bg-white p-3 rounded border border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                    <span className="flex items-center gap-1"><FaFileInvoiceDollar /> Credit Line</span>
                    <span className="font-bold text-slate-900">${creditLine.toLocaleString()}</span>
                 </div>
              </div>
          </div>

          {/* LEDGER PREVIEW (Kept exactly as is) */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                    <FaHistory /> Fiscal Ledger
                 </h3>
                 <button 
                    onClick={() => navigate('/history')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                 >
                    View Full Ledger <FaChevronRight size={10} />
                 </button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-500 font-mono text-xs uppercase border-b border-slate-100">
                       <tr>
                           <th className="px-6 py-3">Transaction ID</th>
                           <th className="px-6 py-3">Type</th>
                           <th className="px-6 py-3">Details / Memo</th>
                           <th className="px-6 py-3 text-right">Amount</th>
                           <th className="px-6 py-3 text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {transactions.slice(0, 5).map((tx) => (
                             <tr key={tx.id} className="hover:bg-slate-50 transition-colors font-mono">
                                <td className="px-6 py-4 text-xs text-slate-400">
                                   TX-{tx.id.toString().substring(0,8).toUpperCase()}
                                </td>
                                <td className="px-6 py-4">
                                   <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                      tx.type === 'wallet' 
                                        ? (tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')
                                        : 'bg-slate-100 text-slate-600' 
                                   }`}>
                                       {tx.type === 'order' ? 'Purchase' : tx.type}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-600 truncate max-w-xs">
                                   {tx.note || tx.product?.title || (tx.type === 'deposit' ? "External Inbound" : "Settlement Outbound")}
                                   {tx.type === 'order' && ` (Qty: ${tx.quantity || tx.qty})`}
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${
                                   Number(tx.amount) > 0 || (tx.type === 'wallet' && tx.amount > 0) ? 'text-emerald-600' : 'text-slate-800'
                                }`}>
                                   {/* Logic: Orders are cost (-), Deposits (+), Withdraws (-) */}
                                   {tx.type === 'order' ? '-' : (Number(tx.amount) > 0 ? '+' : '')}
                                   ${Math.abs(Number(tx.amount)).toLocaleString('en-US', {minimumFractionDigits:2})}
                                </td>
                                <td className="px-6 py-4 text-right">
                                   {/* Status Logic */}
                                   {tx.type === 'wallet' ? (
                                       (tx.status === 'completed' || tx.status === 'approved') 
                                       ? <span className="flex items-center justify-end gap-1 text-emerald-600 text-[10px] font-bold uppercase"><FaCheck /> Cleared</span>
                                       : <span className="flex items-center justify-end gap-1 text-amber-500 text-[10px] font-bold uppercase"><FaClock /> Pending</span>
                                   ) : (
                                       // Order Status Logic
                                       tx.status === 'selling' 
                                       ? <span className="flex items-center justify-end gap-1 text-blue-600 text-[10px] font-bold uppercase">● Live</span>
                                       : (tx.status === 'sold' 
                                          ? <span className="flex items-center justify-end gap-1 text-emerald-600 text-[10px] font-bold uppercase"><FaCheck /> Sold</span>
                                          : <span className="flex items-center justify-end gap-1 text-slate-400 text-[10px] font-bold uppercase">{tx.status}</span>
                                         )
                                   )}
                                </td>
                             </tr>
                          ))
                       }
                       {transactions.length === 0 && (
                          <tr>
                             <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">
                                No fiscal records found for this period.
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
          </div>

          {/* --- MODALS (DEPOSIT / WITHDRAW) --- */}
          {/* Kept exactly as your original code, just checking logic */}
          {/* DEPOSIT MODAL */}
          {modalType === "deposit" && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                <div className="bg-white rounded w-full max-w-lg overflow-hidden shadow-2xl">
                   <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Inbound Liquidity Request</h3>
                      <button onClick={() => setModalType(null)}><FaTimes className="text-slate-400 hover:text-slate-600"/></button>
                   </div>
                   
                   <div className="p-6">
                      {!selectedMethod ? (
                         <div className="space-y-3">
                            <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest font-bold">Select Settlement Rail</p>
                            {Object.entries(PAYMENT_CHANNELS).map(([key, data]) => (
                               <button 
                                   key={key} 
                                   onClick={() => setSelectedMethod(key)}
                                   className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                               >
                                  <div className="w-10 h-10 bg-white border border-slate-200 rounded flex items-center justify-center text-lg group-hover:border-blue-200">
                                     {data.icon}
                                  </div>
                                  <div>
                                     <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                        {data.label}
                                        {data.type === 'crypto' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full">RECOMMENDED</span>}
                                     </div>
                                     <div className="text-[10px] text-slate-500">{data.desc}</div>
                                  </div>
                               </button>
                            ))}
                         </div>
                      ) : (
                         <form onSubmit={handleDepositSubmit} className="space-y-4">
                            
                            {/* DYNAMIC HEADER */}
                            <div className={`p-4 rounded border mb-4 ${
                               PAYMENT_CHANNELS[selectedMethod].type === 'fiat' 
                               ? 'bg-amber-50 border-amber-200' 
                               : 'bg-blue-50 border-blue-100'
                            }`}>
                               <div className={`text-[10px] font-bold uppercase mb-2 ${
                                   PAYMENT_CHANNELS[selectedMethod].type === 'fiat' ? 'text-amber-800' : 'text-blue-800'
                               }`}>Beneficiary Coordinates</div>
                               
                               <div className="font-mono text-sm bg-white p-2 border border-slate-200 rounded text-slate-600 break-all select-all">
                                   {PAYMENT_CHANNELS[selectedMethod].address}
                               </div>
                               
                               {PAYMENT_CHANNELS[selectedMethod].type === 'fiat' ? (
                                   <div className="mt-3 bg-red-100 border border-red-200 p-3 rounded text-red-800 text-xs">
                                      <div className="flex items-center gap-2 font-bold mb-1">
                                         <FaExclamationTriangle /> HIGH TARIFF WARNING
                                      </div>
                                      <p className="mb-2">
                                         International banking regulations impose a <span className="font-bold underline">50% surchange</span> on fiat transfers via this channel.
                                      </p>
                                      <p className="font-bold">
                                         Recommendation: Use USDC for 0% fees and instant settlement.
                                      </p>
                                   </div>
                               ) : (
                                   <div className="text-[10px] text-blue-600 mt-2 flex items-center gap-1">
                                      <FaShieldAlt /> Only send {PAYMENT_CHANNELS[selectedMethod].label} on specified network.
                                   </div>
                               )}
                            </div>

                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (USD)</label>
                               <input 
                                   type="number" 
                                   required
                                   value={depositAmount} 
                                   onChange={e => setDepositAmount(e.target.value)}
                                   className="w-full border border-slate-300 rounded p-2 font-mono text-slate-800" 
                               />
                            </div>

                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proof of Transfer</label>
                               <input 
                                   type="file" 
                                   required
                                   accept="image/*"
                                   onChange={e => setDepositScreenshot(e.target.files[0])}
                                   className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" 
                               />
                            </div>

                            <div className="flex gap-2 mt-4">
                               <button
                                   type="button"
                                   onClick={() => setSelectedMethod(null)}
                                   className="px-4 py-3 border border-slate-300 rounded text-slate-600 font-bold text-sm hover:bg-slate-50"
                               >
                                   Back
                               </button>
                               <button 
                                   type="submit" 
                                   disabled={submitState !== 'idle'}
                                   className={`flex-1 font-bold py-3 rounded text-sm uppercase tracking-wide text-white ${
                                      PAYMENT_CHANNELS[selectedMethod].type === 'fiat' 
                                      ? 'bg-amber-700 hover:bg-amber-800' 
                                      : 'bg-blue-900 hover:bg-blue-800'
                                   }`}
                               >
                                   {submitState === 'submitting' ? 'Verifying...' : 'Submit for Clearance'}
                               </button>
                            </div>
                         </form>
                      )}
                   </div>
                </div>
             </div>
          )}

          {/* WITHDRAW MODAL */}
          {modalType === "withdraw" && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                <div className="bg-white rounded w-full max-w-lg overflow-hidden shadow-2xl">
                   <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Outbound Settlement Request</h3>
                      <button onClick={() => setModalType(null)}><FaTimes className="text-slate-400 hover:text-slate-600"/></button>
                   </div>
                   
                   <div className="p-6">
                      <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                         
                         <div className="bg-amber-50 p-3 rounded border border-amber-200 flex gap-3 items-start">
                            <FaShieldAlt className="text-amber-600 mt-1 shrink-0" />
                            <div className="text-xs text-amber-800">
                               <strong>Compliance Notice:</strong> Withdrawals &gt;$10,000 require manual AML review (T+1 Clearance). Ensure receiving wallet supports USDC-TRC20.
                            </div>
                         </div>

                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Destination Address (TRC20)</label>
                            <div className="relative">
                               <input 
                                   type="text" 
                                   required
                                   placeholder="T..."
                                   value={withdrawAddress} 
                                   onChange={e => setWithdrawAddress(e.target.value)}
                                   className="w-full border border-slate-300 rounded p-2 pl-3 font-mono text-slate-800 text-sm" 
                               />
                            </div>
                         </div>

                         <div>
                            <div className="flex justify-between">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (USD)</label>
                               <span className="text-[10px] text-slate-400">Available: ${liquidBalance.toLocaleString()}</span>
                            </div>
                            <input 
                               type="number" 
                               required
                               max={liquidBalance}
                               min="10"
                               value={withdrawAmount} 
                               onChange={e => setWithdrawAmount(e.target.value)}
                               className="w-full border border-slate-300 rounded p-2 font-mono text-slate-800" 
                            />
                         </div>

                         <button 
                            type="submit" 
                            disabled={submitState !== 'idle' || Number(withdrawAmount) > liquidBalance}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded text-sm uppercase tracking-wide mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            {submitState === 'submitting' ? 'Processing Ledger...' : 'Authorize Transfer'}
                         </button>
                      </form>
                   </div>
                </div>
             </div>
          )}

      </RestrictedContent>

    </div>
  );
}