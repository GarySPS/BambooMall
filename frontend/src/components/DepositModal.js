// src/components/DepositModal.js

import React, { useState, useEffect } from "react";
import { 
  FaTimes, FaFingerprint, FaGlobe, FaBuilding, FaExclamationTriangle, FaShieldAlt 
} from "react-icons/fa";
import { submitDeposit } from "../utils/api";
import { API_BASE_URL } from "../config";

// --- Local Helper for Upload ---
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

const PAYMENT_CHANNELS = {
  "USDC-TRC20": { 
      type: "crypto",
      label: "USDC (TRC20)", 
      address: "TW4ig5B5Re713KRfSVsQCGAAAvYJFbS3Z6", 
      icon: <FaGlobe className="text-emerald-500" />,
      desc: "Fee-Free • Instant Settlement (T+0)"
  },
  "ALIPAY-CN": { 
      type: "fiat",
      label: "Alipay Cross-Border", 
      address: "MERCHANT-ID: 2088-1021-4822 (BambooMall HK)", 
      icon: <FaBuilding className="text-blue-500" />,
      desc: "⚠️ High Tariff • Mainland CN Only"
  }
};

const TOP_UP_AMOUNT = 5000;

export default function DepositModal({ isOpen, onClose, onSuccess, user }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState(TOP_UP_AMOUNT);
  const [screenshot, setScreenshot] = useState(null);
  const [submitState, setSubmitState] = useState("idle");
  
  // Fake Wallet Logic
  const [walletReady, setWalletReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      const hasWallet = localStorage.getItem(`bamboomall_wallet_${user.id}`);
      if (hasWallet) setWalletReady(true);
      setSelectedMethod(null);
      setAmount(TOP_UP_AMOUNT);
      setScreenshot(null);
      setSubmitState("idle");
    }
  }, [isOpen, user?.id]);

  const handleCreateWallet = () => {
    setIsGenerating(true);
    setTimeout(() => {
      localStorage.setItem(`bamboomall_wallet_${user.id}`, "true");
      setWalletReady(true);
      setIsGenerating(false);
    }, 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState("submitting");
    try {
      let screenshotUrl = null;
      if (screenshot) {
        screenshotUrl = await uploadDepositScreenshot(screenshot);
      }
      
      await submitDeposit({
        user_id: user.id,
        amount: amount,
        screenshot_url: screenshotUrl,
        note: selectedMethod,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in overflow-y-auto">
        {/* Adjusted width for mobile (w-full, mx-4) and desktop (max-w-md) */}
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative border border-slate-200 my-auto">
            
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                {selectedMethod === "USDC-TRC20" && !walletReady 
                    ? <><FaFingerprint className="text-blue-600"/> Secure Wallet Initialization</>
                    : "Inbound Liquidity Request"
                }
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <FaTimes className="text-slate-400 hover:text-slate-600"/>
                </button>
            </div>
            
            {/* Added max-h to handle small screens scrolling */}
            <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
                {!selectedMethod ? (
                    <div className="space-y-4">
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">Select Settlement Rail</p>
                    {Object.entries(PAYMENT_CHANNELS).map(([key, data]) => (
                        <button 
                            key={key} 
                            onClick={() => setSelectedMethod(key)}
                            className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group hover:shadow-md"
                        >
                            <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xl group-hover:border-blue-200 shadow-sm shrink-0">
                                {data.icon}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                {data.label}
                                {data.type === 'crypto' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">RECOMMENDED</span>}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">{data.desc}</div>
                            </div>
                        </button>
                    ))}
                    </div>
                ) : (
                    <>
                    {selectedMethod === "USDC-TRC20" && !walletReady ? (
                        <div className="text-center py-8">
                        {isGenerating ? (
                            <div className="space-y-6 animate-pulse">
                            <div className="w-20 h-20 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">Allocating Dedicated Address...</h4>
                                <p className="text-sm text-slate-500 mt-2 font-mono">Connecting to TRON Mainnet Nodes (RPC-72)</p>
                            </div>
                            <div className="text-xs font-mono text-emerald-600 bg-emerald-50 py-2 px-4 rounded inline-block">
                                Generating Keys... Encrypting... Verifying...
                            </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 border border-slate-100">
                                <FaFingerprint size={48} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-xl">Internal Wallet Required</h4>
                                <p className="text-sm text-slate-500 mt-3 max-w-xs mx-auto leading-relaxed">
                                    To process instant USDC settlements, a unique dedicated wallet address must be generated for your account identity: <strong className="text-slate-900">{user?.username}</strong>.
                                </p>
                            </div>
                            <button 
                                onClick={handleCreateWallet}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl transform active:scale-95 transition-all w-full"
                            >
                                Generate Deposit Address
                            </button>
                            <button onClick={() => setSelectedMethod(null)} className="block w-full text-sm text-slate-400 mt-4 hover:text-slate-600 underline">Cancel Operation</button>
                            </div>
                        )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                        <div className={`p-5 rounded-xl border mb-4 ${
                            PAYMENT_CHANNELS[selectedMethod].type === 'fiat' 
                            ? 'bg-amber-50 border-amber-100' 
                            : 'bg-slate-50 border-slate-200'
                        }`}>
                            
                            {(PAYMENT_CHANNELS[selectedMethod].type === 'crypto' || selectedMethod === 'ALIPAY-CN') && (
                                <div className="flex justify-center mb-6">
                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                    <img 
                                        src={selectedMethod === 'USDC-TRC20' ? "/usdc.jpg" : "/images/qr-alipay-demo.png"} 
                                        alt="Deposit QR" 
                                        className="w-40 h-40 object-contain mix-blend-multiply"
                                    />
                                </div>
                                </div>
                            )}

                            <div className={`text-xs font-bold uppercase mb-2 tracking-wide ${
                                PAYMENT_CHANNELS[selectedMethod].type === 'fiat' ? 'text-amber-800' : 'text-slate-500'
                            }`}>
                            {PAYMENT_CHANNELS[selectedMethod].type === 'crypto' ? 'Your Unique Deposit Address (TRC20)' : 'Beneficiary Coordinates'}
                            </div>
                            
                            <div className="font-mono text-sm bg-white p-4 border border-slate-200 rounded-lg text-slate-700 break-all select-all flex items-center justify-between group cursor-pointer hover:border-blue-400 transition-colors shadow-sm"
                                onClick={() => navigator.clipboard.writeText(PAYMENT_CHANNELS[selectedMethod].address)}>
                                <span>{PAYMENT_CHANNELS[selectedMethod].address}</span>
                            </div>
                            
                            {PAYMENT_CHANNELS[selectedMethod].type === 'fiat' ? (
                                <div className="mt-4 bg-red-50 border border-red-100 p-3 rounded-lg text-red-700 text-xs">
                                <div className="flex items-center gap-2 font-bold mb-1">
                                    <FaExclamationTriangle /> HIGH TARIFF WARNING
                                </div>
                                <p>International banking regulations impose a <strong>50% surcharge</strong> on fiat transfers.</p>
                                </div>
                            ) : (
                                <div className="text-xs text-blue-600 mt-3 flex items-center gap-1.5 font-medium bg-blue-50 w-fit px-2 py-1 rounded">
                                <FaShieldAlt /> Only send {PAYMENT_CHANNELS[selectedMethod].label} to this address.
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Amount (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                                <input 
                                type="number" 
                                required
                                value={amount} 
                                onChange={e => setAmount(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg p-3 pl-8 font-mono text-slate-900 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition shadow-sm" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Proof of Transfer (Optional)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={e => setScreenshot(e.target.files[0])}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all cursor-pointer" 
                            />
                            {/* DISCLAIMER */}
                            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                                <span className="font-bold text-slate-500">Note:</span> Uploading a receipt is optional. Blockchain transactions are automatically verified via TXID. However, if a network delay occurs, this screenshot helps our support team locate your funds faster.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setSelectedMethod(null)}
                                className="px-6 py-3.5 border border-slate-300 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Back
                            </button>
                            <button 
                                type="submit" 
                                disabled={submitState !== 'idle'}
                                className={`flex-1 font-bold py-3.5 rounded-lg text-sm uppercase tracking-wide text-white shadow-lg transition-all transform active:scale-95 ${
                                    PAYMENT_CHANNELS[selectedMethod].type === 'fiat' 
                                    ? 'bg-amber-600 hover:bg-amber-700' 
                                    : 'bg-slate-900 hover:bg-slate-800'
                                }`}
                            >
                                {submitState === 'submitting' ? 'Verifying...' : 'Submit for Clearance'}
                            </button>
                        </div>
                        </form>
                    )}
                    </>
                )}
            </div>
        </div>
    </div>
  );
}