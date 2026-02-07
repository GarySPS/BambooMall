//src>components>DepositModal.js

import React, { useState, useEffect } from "react";
import { 
  FaTimes, FaFingerprint, FaGlobe, FaBuilding, 
  FaExclamationTriangle, FaShieldAlt, FaCopy, FaCloudUploadAlt, FaCheckCircle
} from "react-icons/fa";
import { submitDeposit } from "../utils/api"; // This is already secure
import { API_BASE_URL } from "../config";

// --- Local Helper for Upload (SECURED) ---
async function uploadDepositScreenshot(file) {
  const token = localStorage.getItem("token"); // <--- Get Token
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${API_BASE_URL}/upload/deposit`, {
    method: "POST",
    headers: {
        // NOTE: Do NOT set Content-Type for FormData; browser does it automatically
        "Authorization": `Bearer ${token}` // <--- Attach Token
    },
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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (user?.id) {
        const hasWallet = localStorage.getItem(`bamboomall_wallet_${user.id}`);
        if (hasWallet) setWalletReady(true);
        setSelectedMethod(null);
        setAmount(TOP_UP_AMOUNT);
        setScreenshot(null);
        setSubmitState("idle");
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
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
        amount: amount, // Backend will grab user_id from Token
        screenshot_url: screenshotUrl,
        note: selectedMethod,
      });

      setSubmitState("success");
      setTimeout(() => { 
        onSuccess(); 
        onClose(); 
      }, 1500);
    } catch (err) {
      console.error(err);
      setSubmitState("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-24 sm:pt-32">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-slide-up">
            <div className="flex-shrink-0 bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                {selectedMethod === "USDC-TRC20" && !walletReady 
                    ? <><FaFingerprint className="text-blue-600"/> Secure Wallet Setup</>
                    : "Inbound Liquidity Request"
                }
                </h3>
                <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                   <FaTimes size={20} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white">
                {!selectedMethod ? (
                    <div className="space-y-4">
                        <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">Select Settlement Rail</p>
                        {Object.entries(PAYMENT_CHANNELS).map(([key, data]) => (
                            <button 
                                key={key} 
                                onClick={() => setSelectedMethod(key)}
                                className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 active:scale-[0.98] transition-all text-left group shadow-sm"
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
                        <div className="text-center py-6">
                            {isGenerating ? (
                                <div className="space-y-6 animate-pulse">
                                    <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">Allocating Address...</h4>
                                        <p className="text-sm text-slate-500 mt-2 font-mono">Connecting to TRON Node (RPC-72)</p>
                                    </div>
                                    <div className="text-xs font-mono text-emerald-600 bg-emerald-50 py-2 px-4 rounded inline-block">
                                        Generating Keys... Encrypting...
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 border border-slate-100">
                                        <FaFingerprint size={40} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-xl">Internal Wallet Required</h4>
                                        <p className="text-sm text-slate-500 mt-3 max-w-xs mx-auto leading-relaxed">
                                            To process instant USDC settlements, a unique dedicated wallet address must be generated for your account identity: <strong className="text-slate-900">{user?.username}</strong>.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleCreateWallet}
                                        className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all w-full"
                                    >
                                        Generate Deposit Address
                                    </button>
                                    <button onClick={() => setSelectedMethod(null)} className="block w-full text-sm text-slate-400 mt-4 hover:text-slate-600 underline">Cancel Operation</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className={`p-5 rounded-xl border ${
                                PAYMENT_CHANNELS[selectedMethod].type === 'fiat' 
                                ? 'bg-amber-50 border-amber-100' 
                                : 'bg-slate-50 border-slate-200'
                            }`}>
                                
                                {(PAYMENT_CHANNELS[selectedMethod].type === 'crypto' || selectedMethod === 'ALIPAY-CN') && (
                                    <div className="flex justify-center mb-6">
                                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                                            <img 
                                                src={selectedMethod === 'USDC-TRC20' ? "/usdc.jpg" : "/images/qr-alipay-demo.png"} 
                                                alt="Deposit QR" 
                                                className="w-32 h-32 object-contain mix-blend-multiply"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className={`text-[10px] font-bold uppercase mb-2 tracking-wide ${
                                    PAYMENT_CHANNELS[selectedMethod].type === 'fiat' ? 'text-amber-800' : 'text-slate-500'
                                }`}>
                                    {PAYMENT_CHANNELS[selectedMethod].type === 'crypto' ? 'Your Deposit Address (TRC20)' : 'Beneficiary Coordinates'}
                                </div>
                                
                                <div 
                                    className="font-mono text-xs md:text-sm bg-white p-3 border border-slate-200 rounded-lg text-slate-700 break-all flex items-center justify-between group cursor-pointer active:bg-slate-50 active:border-blue-400 transition-all shadow-sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(PAYMENT_CHANNELS[selectedMethod].address);
                                    }}
                                >
                                    <span>{PAYMENT_CHANNELS[selectedMethod].address}</span>
                                    <FaCopy className="text-slate-300 group-hover:text-blue-500 ml-2 shrink-0" />
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
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount (USD)</label>
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
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Proof of Transfer (Optional)</label>
                                <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-white transition-all ${screenshot ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300'}`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {screenshot ? (
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                                <FaCheckCircle /> Receipt Selected
                                            </div>
                                        ) : (
                                            <>
                                                <FaCloudUploadAlt className="text-slate-400 mb-1" size={24} />
                                                <p className="text-xs text-slate-500"><span className="font-bold">Click to upload</span> screenshot</p>
                                            </>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={e => setScreenshot(e.target.files[0])}
                                    />
                                </label>
                                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                    Blockchain transactions are verified via TXID. Uploading a receipt is recommended for faster support if networks are congested.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedMethod(null)}
                                    className="px-6 py-3.5 border border-slate-300 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitState !== 'idle' || !screenshot} 
                                    className={`flex-1 font-bold py-3.5 rounded-lg text-sm uppercase tracking-wide text-white shadow-lg transition-all active:scale-95 ${
                                        (submitState !== 'idle' || !screenshot) 
                                        ? 'bg-slate-400 cursor-not-allowed opacity-70' 
                                        : PAYMENT_CHANNELS[selectedMethod].type === 'fiat' 
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