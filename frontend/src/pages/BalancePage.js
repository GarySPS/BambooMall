//src>pages>BalancePage.js

import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import AnimatedVipBadge from "../components/AnimatedVipBadge";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { fetchResaleHistory } from "../utils/api";
import { 
  FaWallet, 
  FaArrowUp, 
  FaArrowDown, 
  FaHistory, 
  FaCopy, 
  FaCheck, 
  FaTimes, 
  FaMoneyBillWave,
  FaUniversity
} from "react-icons/fa";

// --- VIP Logic ---
function getVipLevel(balance) {
  if (balance >= 40000) return "VIVIP";
  if (balance >= 20000) return "VIPX";
  if (balance >= 15000) return "VIP2";
  if (balance >= 10000) return "VIP1";
  if (balance >= 5000)  return "VIP0";
  return "MEMBER";
}

// --- Payment Data ---
const USDC_INFO = { qr: "/usdt.jpg", address: "TW4ig5B5Re713KRfSVsQCGAAAvYJFbS3Z6", network: "USDC TRC20" };
const ALIPAY_INFO = { qr: "/images/qr-alipay-demo.png", address: "188-118-2490-1180" };
const WECHAT_INFO = { qr: "/images/qr-wechat-demo.png", address: "uxwd_48uxi" };
const WISE_INFO = { qr: "/usdt.jpg", address: "wise.bamboomall@pay.com", note: "Name: BambooMall LLC" };
const TOP_UP_AMOUNT = 1000;

// --- Copyable Address Component ---
function DepositAddress({ address }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative flex items-center gap-2 w-full">
      <div className="text-sm font-mono text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 select-all shadow-inner w-full overflow-x-auto whitespace-nowrap">
        {address}
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(address);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className={`flex-shrink-0 px-3 py-2 rounded-lg font-bold text-xs transition-all duration-200 flex items-center gap-1 ${
          copied 
            ? "bg-green-100 text-green-700 shadow-none scale-95" 
            : "bg-white border border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-300 shadow-sm"
        }`}
        type="button"
      >
        {copied ? <FaCheck /> : <FaCopy />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

// --- API helpers ---
async function fetchWalletFromBackend(user_id) {
  const res = await fetch(`${API_BASE_URL}/wallet/${user_id}`);
  if (!res.ok) throw new Error("Failed to fetch wallet");
  const data = await res.json();
  return data.wallet;
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
  const { wallet, updateWallet, user } = useUser();
  const [resaleHistory, setResaleHistory] = useState([]);
  const [modalType, setModalType] = useState(null); 
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState("");
  const [depositAmount, setDepositAmount] = useState(TOP_UP_AMOUNT);
  const [depositScreenshot, setDepositScreenshot] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [submitState, setSubmitState] = useState("idle"); 
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchWalletFromBackend(user.id)
        .then(walletData => {
           // Save the whole wallet object (including .balance) to context
           updateWallet(walletData); 
        })
        .catch(() => updateWallet({ balance: 0 }));

      fetchResaleHistory(user.id)
        .then(data => setResaleHistory(Array.isArray(data.orders) ? data.orders : []))
        .catch(() => setResaleHistory([]));
    }
  }, [user?.id]);

  // Auto-close deposit modal after success
  useEffect(() => {
    if (submitState === "success" && modalType === "deposit") {
      const timer = setTimeout(() => {
        setModalType(null);
        setSelectedMethod(null);
        setSubmitState("idle");
        setDepositScreenshot(null);
        if (user?.id) {
          fetchWalletFromBackend(user.id)
            .then(walletData => updateWallet(walletData)) // Correct
            .catch(() => updateWallet({ balance: 0 }));
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [submitState, modalType, user, updateWallet]);

  // Modal handlers
  const handleDeposit = () => {
    setModalType("deposit");
    setSelectedMethod(null);
    setDepositAmount(TOP_UP_AMOUNT);
    setDepositScreenshot(null);
    setSubmitState("idle");
  };
  const handleWithdraw = () => {
    setModalType("withdraw");
    setWithdrawAmount("");
    setWithdrawAddress("");
    setSelectedWithdrawMethod("");
    setSubmitState("idle");
  };

  // Submit handlers
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
      setSubmitState("success");
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
        note: selectedWithdrawMethod,
      });
      setSubmitState("success");
    } catch (err) {
      setSubmitState("error");
    }
  };

  // --- Payment UI logic
const balance = Number(wallet?.balance || 0);
const vipLevel = getVipLevel(balance);

  const PAYMENT_MAP = {
    "USDC(TRC)": USDC_INFO,
    "AliPay": ALIPAY_INFO,
    "WeChat": WECHAT_INFO,
    "Bank Transfer": WISE_INFO,
  };

  const methodInfo = selectedMethod ? PAYMENT_MAP[selectedMethod] : null;

  return (
    <div className="min-h-screen w-full bg-[#151516] text-gray-800 font-sans relative">
       {/* Background Image Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          background: `url('/balance.png') center top / cover no-repeat`
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col p-4">
        
        {/* Header Title */}
        <div className="flex items-center justify-between py-2 mb-2">
           <h1 className="text-white text-xl font-bold flex items-center gap-2">
             <FaWallet className="text-emerald-400" /> My Assets
           </h1>
        </div>

        {/* Balance Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 mb-6 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
          
          <div className="mt-2 mb-4 transform transition-transform group-hover:scale-105 duration-300">
            <AnimatedVipBadge level={vipLevel} active={true} size={64} />
          </div>
          
          <div className="text-gray-500 text-sm font-medium tracking-wide uppercase mb-1">Total Balance</div>
          <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 mb-6 tracking-tight">
            {/* UPDATED: Force 2 decimal places for clean look */}
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className="grid grid-cols-2 w-full gap-4">
            <button
              onClick={handleDeposit}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-4 shadow-lg shadow-green-500/20 transition-all hover:shadow-green-500/40 active:scale-95"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col items-center justify-center gap-1 text-white">
                 <FaArrowDown className="text-xl mb-1 group-hover:animate-bounce" />
                 <span className="font-bold text-lg">Deposit</span>
              </div>
            </button>
            
            <button
              onClick={handleWithdraw}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/40 active:scale-95"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col items-center justify-center gap-1 text-white">
                 <FaArrowUp className="text-xl mb-1 group-hover:animate-bounce" />
                 <span className="font-bold text-lg">Withdraw</span>
              </div>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-gray-500 font-medium">VIP level updates instantly on deposit</span>
          </div>
        </div>

        {/* Resale History Section */}
        <div className="flex-1 bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-5 overflow-hidden flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaHistory className="text-gray-400" />
            History
          </h3>
          
          {resaleHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10 opacity-70">
              <FaHistory className="text-4xl mb-2 text-gray-300" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <ul className="space-y-3 pb-4">
              {resaleHistory.map((order) => (
                <li
                  key={order.id}
                  className="bg-gray-50 hover:bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex items-center gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  {/* Icon / Image */}
                  <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                    {order.image ? (
                      <img src={order.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🛒</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-gray-800 truncate text-sm">{order.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        order.status === 'sold' ? 'bg-green-100 text-green-700' :
                        order.status === 'refund_pending' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status === 'refund_pending' ? 'Pending' : order.status}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-1">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Unknown Date"}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        {/* UPDATED: Format Amount to 2 decimals */}
                        <span className="font-medium text-gray-600">${Number(order.amount).toFixed(2)}</span>
                        
                        <span className={`font-bold ${order.status === 'sold' ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {/* UPDATED: Format Profit to 2 decimals */}
                          {order.status === "sold" ? `+ $${Number(order.earn ?? order.profit ?? 0).toFixed(2)}` : "..."}
                        </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Deposit Modal */}
      {modalType === "deposit" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-gray-800">
                {selectedMethod ? `${selectedMethod} Deposit` : "Add Funds"}
              </h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {!selectedMethod ? (
                /* Payment Method Selection */
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "AliPay", icon: "/images/alipay.png", color: "border-blue-100 hover:border-blue-400" },
                    { id: "WeChat", icon: "/images/wechatpay.png", color: "border-green-100 hover:border-green-400" },
                    { id: "USDC(TRC)", icon: "/usdc.jpg", color: "border-teal-100 hover:border-teal-400", bonus: "+4% Bonus" },
                    { id: "Bank Transfer", icon: "/wise-logo.png", color: "border-indigo-100 hover:border-indigo-400", sub: "Global (WISE)" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 bg-white shadow-sm hover:shadow-md transition-all active:scale-95 ${m.color}`}
                    >
                      <img src={m.icon} alt={m.id} className="w-12 h-12 mb-2 object-contain" />
                      <span className="font-bold text-gray-800 text-sm text-center leading-tight">{m.id}</span>
                      {m.bonus && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full mt-1 font-bold">{m.bonus}</span>}
                      {m.sub && <span className="text-[10px] text-gray-500 mt-1 font-medium">{m.sub}</span>}
                    </button>
                  ))}
                </div>
              ) : (
                /* Selected Method Form */
                <form onSubmit={handleDepositSubmit} className="flex flex-col gap-5">
                   {/* QR & Address */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col items-center text-center">
                    <img
                      src={methodInfo.qr}
                      alt="QR Code"
                      className="w-40 h-40 rounded-xl border border-white shadow-sm mb-3 mix-blend-multiply"
                    />
                    
                    {selectedMethod === "USDC(TRC)" && (
                      <div className="mb-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                          Network: {USDC_INFO.network}
                      </div>
                    )}
                    {selectedMethod === "Bank Transfer" && (
                      <div className="mb-2 text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border">
                        Account: BambooMall LLC
                      </div>
                    )}

                    <DepositAddress address={methodInfo.address} />
                  </div>

                  {/* Amount Input */}
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Amount (USD)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input
                          type="number"
                          min={1}
                          required
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-lg font-bold rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Payment Screenshot</label>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={e => setDepositScreenshot(e.target.files[0])}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all border border-gray-200 rounded-xl bg-white"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => { setSelectedMethod(null); setSubmitState("idle"); }}
                      className="px-5 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!depositScreenshot || !depositAmount || submitState === "submitting" || submitState === "success"}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 font-bold shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                    >
                      {submitState === "submitting" ? (
                        <>Processing...</>
                      ) : submitState === "success" ? (
                        <><FaCheck /> Sent!</>
                      ) : (
                        "Confirm Deposit"
                      )}
                    </button>
                  </div>
                  
                  {submitState === "error" && (
                      <p className="text-center text-red-500 text-sm font-bold">Failed. Please try again.</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {modalType === "withdraw" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            
             <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-amber-800">Request Withdraw</h3>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-6 flex flex-col gap-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Method</label>
                <div className="relative">
                  <FaUniversity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 appearance-none outline-none focus:ring-2 focus:ring-amber-400 font-medium text-gray-700"
                    required
                    value={selectedWithdrawMethod}
                    onChange={e => setSelectedWithdrawMethod(e.target.value)}
                  >
                    <option value="">Select Method...</option>
                    <option value="USDC(TRC)">USDC (TRC20)</option>
                    <option value="AliPay">AliPay</option>
                    <option value="WeChat">WeChat</option>
                    <option value="Bank Transfer">Bank Transfer (WISE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    min={1}
                    max={balance}
                    required
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-lg font-bold rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div className="text-right mt-1 text-xs text-gray-400 font-medium">Available: ${balance.toFixed(2)}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Wallet Address / Account</label>
                <input
                  type="text"
                  required
                  placeholder={
                    selectedWithdrawMethod === "USDC(TRC)" ? "TRC20 Address"
                    : selectedWithdrawMethod === "AliPay" ? "AliPay Number"
                    : selectedWithdrawMethod === "WeChat" ? "WeChat ID"
                    : "Account Details"
                  }
                  value={withdrawAddress}
                  onChange={e => setWithdrawAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-mono text-sm rounded-xl py-3 px-4 focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all outline-none"
                />
              </div>

              <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-5 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!withdrawAmount || !withdrawAddress || submitState === "submitting" || submitState === "success"}
                    className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 rounded-xl py-3 font-bold shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2"
                  >
                    {submitState === "submitting" ? "Processing..." : submitState === "success" ? "Requested!" : "Confirm Withdraw"}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}