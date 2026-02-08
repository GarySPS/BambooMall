//src>pages>ProfilePage.js

import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { fetchWalletBalance } from "../utils/api";
import { API_BASE_URL } from "../config"; 
import { 
  Building2, CheckCircle2, Globe, Server, Lock, UploadCloud,
  Fingerprint, Copy, ShieldCheck, CreditCard, Briefcase,
  AlertTriangle, TrendingUp, Activity, FileText, Landmark, ArrowRight
} from "lucide-react";

// --- HELPER: CURRENCY FORMATTER ---
const fmt = (n) => new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD', 
  minimumFractionDigits: 2 
}).format(n);

// --- BUSINESS LOGIC ---
function getSyndicateTier(netWorth) {
  if (netWorth >= 20000) return "Titanium Syndicate (Tier 1)";
  if (netWorth >= 13000) return "Regional Partner (Tier 2)";
  if (netWorth >= 8000)  return "Regional Associate";
  if (netWorth >= 4000)  return "Wholesale Agent (Tier 3)";
  if (netWorth >= 2000)  return "Verified Scout";
  return "Standard Entity";
}

// --- SUB-COMPONENTS ---
function TierBadge({ tier, kycStatus }) {
  const isVerified = kycStatus === 'approved';
  const isHighTier = tier.includes("Titanium") || tier.includes("Partner");
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-black uppercase tracking-widest border-2 shadow-sm ${
      isVerified 
        ? (isHighTier ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-emerald-50 text-emerald-900 border-emerald-200")
        : "bg-slate-100 text-slate-500 border-slate-200"
    }`}>
      {isVerified ? <ShieldCheck size={16} strokeWidth={2.5} /> : <Lock size={16} />}
      <span className="truncate max-w-[140px] md:max-w-none">
        {isVerified ? tier : "PENDING CLEARANCE"}
      </span>
    </div>
  );
}

function StatCard({ label, value, subtext, icon: Icon }) {
  return (
    <div className="bg-white p-5 md:p-6 flex items-start justify-between group transition-colors hover:bg-slate-50 border-r border-slate-100 last:border-0">
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            {label}
        </div>
        <div className="text-2xl md:text-3xl font-mono font-semibold text-slate-900 tracking-tight">
            {value}
        </div>
        {subtext && (
            <div className="text-[11px] font-bold text-emerald-700 mt-2 flex items-center gap-1 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                <TrendingUp size={12} strokeWidth={3}/> {subtext}
            </div>
        )}
      </div>
      <div className="p-3 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-white group-hover:shadow-md group-hover:text-slate-900 transition-all border border-slate-200">
        <Icon size={20} strokeWidth={2} />
      </div>
    </div>
  );
}

function InfoField({ label, value, statusColor, isMono, icon }) {
  return (
    <div className="w-full">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">{label}</label>
      {statusColor ? (
        <div className={`w-full md:w-auto text-sm font-bold px-4 py-3 rounded border-2 inline-flex items-center gap-2 ${statusColor}`}>
           {icon} {value}
        </div>
      ) : (
        <div className={`w-full bg-slate-50 border-b-2 border-slate-200 hover:border-slate-300 text-slate-900 px-4 py-3 rounded-t-sm text-sm ${isMono ? 'font-mono text-sm tracking-tight' : 'font-semibold'} flex items-center justify-between transition-colors`}>
           <span className="truncate">{value}</span>
           {icon && <span className="text-slate-400 ml-2 shrink-0">{icon}</span>}
        </div>
      )}
    </div>
  );
}

function SecurityAction({ label, status, isGood, onClick, icon: Icon }) {
  return (
    <div 
       onClick={onClick}
       className={`flex justify-between items-center p-4 border rounded-md cursor-pointer transition-all active:scale-[0.99] hover:shadow-sm ${isGood ? 'bg-white border-slate-200' : 'bg-amber-50 border-amber-200'}`}
    >
       <div className="flex items-center gap-4">
         <div className={`p-2 rounded-full ${isGood ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>
            <Icon size={18} strokeWidth={2.5}/>
         </div>
         <span className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide">{label}</span>
       </div>
       <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${isGood ? 'text-emerald-800 bg-emerald-100' : 'text-amber-800 bg-amber-100'}`}>
          {status}
       </span>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function ProfilePage() {
  const { user, updateWallet } = useUser();
  const navigate = useNavigate();
  
  const [localWallet, setLocalWallet] = useState(null);
  const [apiKey, setApiKey] = useState("sk_live_************************");
  const [licenseFile, setLicenseFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");

  // Fetch Wallet Data (SECURED)
  useEffect(() => {
    async function fetchWalletData() {
      if (user?.id) {
        try {
          // Replaced manual fetch with secure helper
          const walletData = await fetchWalletBalance(user.id);
          if (walletData) {
            setLocalWallet(walletData); 
            if (updateWallet) updateWallet(walletData);
          }
        } catch (error) {
          console.error("Wallet sync failed", error);
        }
      }
    }
    fetchWalletData();
  }, [user?.id, updateWallet]);

  const revealKey = () => {
    setApiKey(`sk_live_${Math.random().toString(36).substring(2, 24).toUpperCase()}`);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    setUploadStatus("uploading");
    setTimeout(() => {
      setUploadStatus("success");
      alert("Document submitted to Compliance Dept for review (Ref: DOC-9920)");
    }, 2000);
  };

  if (!user) return <div className="flex h-screen items-center justify-center text-xs uppercase tracking-widest font-bold text-slate-400">Secure Handshake...</div>;

  // --- METRICS ---
  const liquidBalance = Number(localWallet?.balance || 0);
  const stockValue = Number(localWallet?.stock_value || 0);
  const netWorth = localWallet?.net_worth ? Number(localWallet.net_worth) : (liquidBalance + stockValue);
  const currentTier = getSyndicateTier(netWorth);

  return (
    <div className="min-h-screen w-full bg-[#F1F5F9] text-slate-900 font-sans pb-32">
      
      {/* 1. HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 h-auto min-h-[5rem] py-4 md:py-0 md:h-24 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex justify-between items-center w-full md:w-auto">
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                       <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                          <Briefcase className="text-slate-900" size={24} strokeWidth={3}/> 
                          Entity Dossier
                       </h1>
                       <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hidden md:block">
                          Confidential
                       </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                       <span className="hidden md:inline font-semibold">REF: {user.id.substring(0, 8).toUpperCase()}</span>
                       <span className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                           SYSTEM ONLINE
                       </span>
                    </div>
                 </div>
                 <div className="md:hidden">
                    <TierBadge tier={currentTier} kycStatus={user.kyc_status} />
                 </div>
              </div>
              
              <div className="hidden md:block">
                <TierBadge tier={currentTier} kycStatus={user.kyc_status} />
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
         
         {/* 2. FINANCIAL DASHBOARD */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <StatCard 
              label="Total Liquidity Position" 
              value={fmt(netWorth)} 
              subtext="Real-time Valuation"
              icon={Landmark}
            />
            <StatCard 
              label="Buying Power" 
              value={fmt(liquidBalance)} 
              icon={Activity}
            />
            <div className="bg-white p-5 md:p-6 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Daily Limit</span>
                 <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">TIER 2 CAP</span>
               </div>
               <div className="w-full bg-slate-100 h-3 rounded-full mb-3 overflow-hidden border border-slate-200">
                 <div className="bg-slate-900 h-full w-[45%] rounded-full"></div>
               </div>
               <div className="flex justify-between text-xs font-mono font-semibold text-slate-600">
                 <span>$12,400.00</span>
                 <span>$50,000.00 MAX</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* 3. LEFT COL: Identity */}
             <div className="lg:col-span-2 space-y-8">
               
                <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                           <Building2 size={18} className="text-slate-400"/> Corporate Identity
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                          <Globe size={12}/> OFFSHORE (INTL)
                        </span>
                    </div>
                    
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-10 md:gap-y-8">
                       <InfoField label="Registered Agent" value={user.username || user.email.split('@')[0]} />
                       <InfoField label="Settlement Currency" value="USDC (TRC20)" icon={<Globe size={14}/>} />
                       <InfoField label="Primary Contact" value={user.email} isMono />
                       <InfoField 
                          label="Tax Classification" 
                          value="EXEMPT (Free Trade)" 
                          statusColor="text-emerald-800 bg-emerald-50 border-emerald-200" 
                          icon={<CheckCircle2 size={16}/>}
                       />
                       
                        <div className="md:col-span-2 pt-6 border-t border-slate-100 mt-2">
                           <div className="flex justify-between items-end mb-3">
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Registration Compliance</label>
                              {user.kyc_status !== 'approved' && (
                                <button 
                                  onClick={() => navigate('/kyc-verification')}
                                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 bg-amber-400 hover:bg-amber-500 px-3 py-1.5 rounded transition-colors shadow-sm"
                                >
                                  Complete Verification <ArrowRight size={12} strokeWidth={3} />
                                </button>
                              )}
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="h-4 flex-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                 <div className={`h-full ${user.kyc_status === 'approved' ? 'bg-emerald-500 w-full' : 'bg-amber-400 w-2/3'}`}></div>
                              </div>
                              <span className="text-xs font-black text-slate-700 uppercase">
                                 {user.kyc_status === 'approved' ? '100% Compliant' : '66% Verified'}
                              </span>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Compliance / Docs Section */}
                <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                           <FileText size={18} className="text-slate-400"/> Documents
                        </h3>
                    </div>
                    <div className="p-6 md:p-8">
                       {!licenseFile && uploadStatus !== 'success' && (
                         <div className="mb-6 flex items-start gap-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-md text-amber-900 shadow-sm">
                            <AlertTriangle size={20} className="mt-0.5 shrink-0"/>
                            <div className="text-sm font-medium leading-relaxed">
                               <strong>Requirement:</strong> Upload Certificate of Incorporation to unlock Tier 2.
                            </div>
                         </div>
                       )}

                       <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-6 rounded-lg border-2 border-slate-200 border-dashed hover:border-slate-300 transition-colors">
                          <div className="flex-1 w-full">
                             <input 
                                type="file" 
                                accept=".pdf,.jpg,.png"
                                onChange={(e) => setLicenseFile(e.target.files[0])}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-md file:border-0 file:text-xs file:font-black file:uppercase file:bg-slate-800 file:text-white hover:file:bg-slate-700 transition-all cursor-pointer"
                              />
                          </div>
                          <button 
                             onClick={handleUpload}
                             disabled={!licenseFile || uploadStatus !== 'idle'}
                             className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-md text-xs font-black uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-3"
                          >
                             {uploadStatus === 'uploading' ? 'Transmitting...' : uploadStatus === 'success' ? 'Verified' : <><UploadCloud size={16}/> Submit Docs</>}
                          </button>
                       </div>
                    </div>
                </div>
             </div>

             {/* 4. RIGHT COL: Developer & Security */}
             <div className="space-y-8">
                <div className="bg-[#0B1120] text-slate-400 rounded-xl shadow-2xl overflow-hidden border border-slate-800">
                   <div className="bg-[#151F32] px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                         <Server size={14} className="text-emerald-500"/> API Gateway
                      </h3>
                      <div className="flex gap-2">
                         <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                      </div>
                   </div>
                   
                   <div className="p-6">
                      <p className="text-xs font-mono mb-6 text-slate-400 border-l-2 border-emerald-500 pl-4 leading-relaxed">
                         High-frequency settlement keys. Rotation recommended every <span className="text-white font-bold">90 days</span>.
                      </p>
                      
                      <div className="group relative mb-6">
                         <label className="text-[10px] font-bold uppercase text-slate-500 mb-2 block tracking-widest">Secret Key</label>
                         <div className="bg-black/50 p-4 rounded-md border border-slate-700 font-mono text-xs text-emerald-400 break-all shadow-inner tracking-wide">
                            {apiKey}
                         </div>
                         <button 
                            onClick={revealKey} 
                            className="absolute bottom-3 right-3 text-slate-500 hover:text-white transition-colors"
                         >
                            <Copy size={16}/>
                         </button>
                      </div>
                      
                      <button 
                         onClick={revealKey}
                         className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-md text-xs font-bold uppercase tracking-widest transition-all"
                      >
                         Generate New Keys
                      </button>
                   </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                      <ShieldCheck size={16} className="text-slate-400"/> Security Level 3
                   </h3>
                   <div className="space-y-3">
                      <SecurityAction 
                         label="Biometrics" 
                         status={user.kyc_status === 'approved' ? 'VERIFIED' : 'REQUIRED'} 
                         isGood={user.kyc_status === 'approved'}
                         onClick={() => user.kyc_status !== 'approved' && navigate('/kyc-verification')}
                         icon={Fingerprint}
                      />
                      <SecurityAction 
                         label="2FA Auth" 
                         status="ACTIVE" 
                         isGood={true}
                         icon={Lock}
                      />
                      <button 
                         onClick={() => navigate('/change-password')} 
                         className="w-full mt-4 text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex justify-between items-center transition-colors group rounded-md"
                      >
                          <span className="flex items-center gap-3 uppercase tracking-wide"><CreditCard size={16}/> Change PIN</span>
                          <ArrowRight size={16} className="text-slate-400 group-hover:text-slate-900"/>
                      </button>
                   </div>
                </div>

             </div>

         </div>
      </div>
    </div>
  );
}