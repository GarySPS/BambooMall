// src/components/WithdrawModal.js

import React, { useState, useEffect } from "react";
import { 
  FaTimes, FaGlobe, FaBuilding, FaQrcode, FaNetworkWired, FaGasPump, FaExclamationTriangle 
} from "react-icons/fa";
import { submitWithdraw } from "../utils/api";

export default function WithdrawModal({ isOpen, onClose, onSuccess, user, liquidBalance }) {
  const [withdrawMethod, setWithdrawMethod] = useState(null);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [alipayName, setAlipayName] = useState("");
  const [submitState, setSubmitState] = useState("idle");

  useEffect(() => {
    if (isOpen) {
      setWithdrawMethod(null);
      setAmount("");
      setAddress("");
      setAlipayName("");
      setSubmitState("idle");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState("submitting");
    
    let finalAddress = address;
    let finalNote = "External Settlement";

    if (withdrawMethod === "ALIPAY-CN") {
        finalAddress = `ALIPAY: ${address} (NAME: ${alipayName})`;
        finalNote = "Alipay Cross-Border";
    } else {
        finalNote = "USDC-TRC20 Transfer";
    }

    try {
      await submitWithdraw({
        user_id: user.id,
        amount: amount,
        address: finalAddress,
        note: finalNote,
      });
      setSubmitState("success");
      setTimeout(() => { 
        onSuccess(); 
        onClose(); 
      }, 1500);
    } catch (err) {
      setSubmitState("error");
    }
  };

  const formatCurrency = (val, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(val).replace('USDC', ''); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
        {/* Responsive Width & Scroll handling */}
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-200 my-auto">
            
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm md:text-base">
                {withdrawMethod === "USDC-TRC20" ? "Send USDC" : withdrawMethod === "ALIPAY-CN" ? "Alipay Withdraw" : "Withdraw Assets"}
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <FaTimes className="text-slate-400 hover:text-slate-600"/>
                </button>
            </div>
            
            {/* Added max-h for scrolling on small screens */}
            <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
                
                {!withdrawMethod ? (
                    <div className="space-y-4">
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">Select Withdrawal Method</p>
                    
                    <button 
                        onClick={() => setWithdrawMethod("USDC-TRC20")}
                        className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group hover:shadow-md"
                    >
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xl shrink-0">
                            <FaGlobe />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                USDC (TRC20)
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">INSTANT</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Blockchain Transfer • Fee: $0.00</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setWithdrawMethod("ALIPAY-CN")}
                        className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group hover:shadow-md"
                    >
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl shrink-0">
                            <FaBuilding />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                Alipay Cross-Border
                            </div>
                            <div className="text-xs text-slate-500 mt-1">3-5 Business Days • High Fees</div>
                        </div>
                    </button>
                    </div>
                ) : (
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {withdrawMethod === "USDC-TRC20" && (
                        <>
                            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex justify-between items-center shadow-inner">
                                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Available Balance</div>
                                <div className="font-mono font-bold text-lg md:text-xl text-white">
                                    {liquidBalance.toLocaleString('en-US', {minimumFractionDigits: 2})} USDC
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Recipient Address</label>
                                <div className="relative">
                                    <input 
                                    type="text" 
                                    required
                                    placeholder="Paste TRC20 address" 
                                    value={address} 
                                    onChange={e => setAddress(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg p-3 pl-4 pr-10 font-mono text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition shadow-sm" 
                                    />
                                    <FaQrcode className="absolute right-3 top-3.5 text-slate-400 cursor-pointer hover:text-slate-600" />
                                </div>
                                <div className="flex gap-2 mt-2 text-[10px]">
                                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 flex items-center gap-1 font-medium">
                                        <FaNetworkWired size={10} /> Network: TRON (TRC20)
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Amount (USDC)</label>
                                <div className="relative">
                                    <input 
                                    type="number" 
                                    required
                                    max={liquidBalance}
                                    min="10"
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg p-3 pr-16 font-mono text-slate-900 text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition shadow-sm" 
                                    />
                                    <span className="absolute right-14 top-3.5 text-xs font-bold text-slate-400">USDC</span>
                                    <button 
                                    type="button"
                                    onClick={() => setAmount(liquidBalance)}
                                    className="absolute right-2 top-2 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1.5 rounded hover:bg-emerald-200 transition-colors"
                                    >
                                    MAX
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between text-xs text-slate-500 border-t border-dashed border-slate-200 pt-4">
                                <span>Network Fee</span>
                                <span className="font-bold text-emerald-600 flex items-center gap-1"><FaGasPump size={10}/> 0.00 USDC (Subsidized)</span>
                            </div>
                        </>
                    )}

                    {withdrawMethod === "ALIPAY-CN" && (
                        <>
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-r">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <FaExclamationTriangle className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-xs text-amber-700 leading-relaxed">
                                            International transfers to Alipay take <strong>3-5 business days</strong>. A 15% currency conversion fee will be deducted.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Alipay ID (Email/Phone)</label>
                                <input 
                                type="text" 
                                required
                                value={address} 
                                onChange={e => setAddress(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg p-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Full Legal Name</label>
                                <input 
                                type="text" 
                                required
                                value={alipayName} 
                                onChange={e => setAlipayName(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg p-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Amount (USD)</label>
                                <input 
                                type="number" 
                                required
                                max={liquidBalance}
                                min="50"
                                value={amount} 
                                onChange={e => setAmount(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg p-3 font-mono text-slate-900 text-base focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                                <div className="text-right text-[10px] text-slate-400 mt-1 font-mono">
                                Available: ${liquidBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button"
                            onClick={() => setWithdrawMethod(null)}
                            className="px-6 py-3.5 border border-slate-300 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                        >
                            Back
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitState !== 'idle' || Number(amount) > liquidBalance}
                            className={`flex-1 font-bold py-3.5 rounded-lg text-sm uppercase tracking-wide text-white shadow-lg transition-all transform active:scale-95 ${
                                withdrawMethod === 'ALIPAY-CN' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {submitState === 'submitting' ? 'Processing...' : 'Confirm Withdrawal'}
                        </button>
                    </div>
                    </form>
                )}
            </div>
        </div>
    </div>
  );
}