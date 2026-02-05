// src/pages/ProfilePage.js

import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config"; 
import { 
  FaBuilding, 
  FaCheckCircle, 
  FaGlobe, 
  FaServer, 
  FaLock, 
  FaFileUpload,
  FaFingerprint,
  FaCopy,
  FaUserShield,
  FaIdCard
} from "react-icons/fa";

// --- TIER LOGIC (Matches New Standards) ---
function getSyndicateTier(netWorth) {
  if (netWorth >= 20000) return "Global Syndicate (Tier 1)";
  if (netWorth >= 13000) return "Regional Partner (Tier 2)";
  if (netWorth >= 8000)  return "Regional Associate";
  if (netWorth >= 4000)  return "Wholesale Agent (Tier 3)";
  if (netWorth >= 2000)  return "Verified Scout";
  return "Unverified Entity";
}

// --- Badge Component ---
function EntityBadge({ tier, kycStatus }) {
  const isVerified = kycStatus === 'approved';
  // If verified, show the actual Calculated Tier. If not, show Unverified.
  const displayTier = isVerified ? tier : "Unverified Entity";
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest border ${
      isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
    }`}>
      {isVerified ? <FaCheckCircle /> : <FaLock />}
      {displayTier}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateWallet } = useUser();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("sk_live_************************");
  const [licenseFile, setLicenseFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [localWallet, setLocalWallet] = useState(null);

  // Fetch Wallet Data
  useEffect(() => {
    async function fetchWalletData() {
      if (user?.id) {
        try {
          const res = await fetch(`${API_BASE_URL}/wallet/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setLocalWallet(data.wallet); // Store locally for calculation
            if (data.wallet && updateWallet) updateWallet(data.wallet);
          }
        } catch (error) {
          console.error("Wallet sync failed", error);
        }
      }
    }
    fetchWalletData();
  }, [user?.id, updateWallet]);

  const revealKey = () => {
    setApiKey(`sk_live_${Math.random().toString(36).substring(2, 18).toUpperCase()}`);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    setUploadStatus("uploading");
    setTimeout(() => {
      setUploadStatus("success");
      alert("Document submitted to Compliance Dept for review (Ref: DOC-9920)");
    }, 2000);
  };

  if (!user) return <div className="p-10 text-center font-mono text-xs">ESTABLISHING SECURE CONNECTION...</div>;

  // --- CALCULATE TIER DYNAMICALLY ---
  const liquidBalance = Number(localWallet?.balance || 0);
  const stockValue = Number(localWallet?.stock_value || 0);
  // Backend usually sends net_worth, but we fallback to manual calc just in case
  const netWorth = localWallet?.net_worth ? Number(localWallet.net_worth) : (liquidBalance + stockValue);
  const currentTier = getSyndicateTier(netWorth);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20 font-sans text-slate-800">
      
      {/* 1. HEADER: Entity Context */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200 pb-6">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <FaBuilding className="text-blue-900" />
              Corporate Entity Profile
            </h1>
            <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-500">
              <span>ENTITY ID: {user.id.substring(0, 8).toUpperCase()}</span>
              <span>|</span>
              <span>JURISDICTION: NON-DOMICILED (INTL)</span>
            </div>
         </div>
         <div className="mt-4 md:mt-0">
            {/* Dynamic Badge based on Net Worth */}
            <EntityBadge tier={currentTier} kycStatus={user.kyc_status} />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* 2. LEFT COL: Identity & Docs */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
               <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <FaFingerprint /> Account Identity
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Registered Agent</label>
                     <div className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                        {user.username || user.email}
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contact Email</label>
                     <div className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">
                        {user.email}
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Settlement Currency</label>
                     <div className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between">
                        <span>USDC (ERC20 / TRC20)</span>
                        <FaGlobe className="text-slate-400" />
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tax Status</label>
                     <div className="font-mono text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100 font-bold">
                        EXEMPT (Free Trade Zone)
                     </div>
                  </div>
               </div>
            </div>

            {/* Officer Verification (The Link to KYC Page) */}
            <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
               <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                     <FaUserShield /> Designated Officer Verification
                  </h3>
                  {user.kyc_status === 'approved' ? (
                     <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Cleared</span>
                  ) : (
                     <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase animate-pulse">Action Required</span>
                  )}
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded text-slate-400">
                     <FaIdCard size={24} />
                  </div>
                  <div className="flex-1">
                     <p className="text-xs text-slate-500 leading-relaxed mb-2">
                        To activate high-volume purchasing (Tier 2+), the designated account officer must complete biometric verification.
                     </p>
                     {user.kyc_status === 'approved' ? (
                        <div className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                           <FaCheckCircle /> Biometric Data on File
                        </div>
                     ) : (
                        <button 
                           onClick={() => navigate('/kyc-verification')}
                           className="bg-blue-900 text-white px-6 py-2 rounded text-xs font-bold uppercase hover:bg-blue-800 shadow-md transition-transform active:scale-95"
                        >
                           Launch Biometric Clearance
                        </button>
                     )}
                  </div>
               </div>
            </div>

            {/* Corporate Docs Upload */}
            <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
               <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <FaFileUpload /> Corporate Documents
               </h3>
               <div className="bg-blue-50 border border-blue-100 p-4 rounded mb-4 text-xs text-blue-800 leading-relaxed">
                  <strong>Requirement:</strong> To increase daily settlement limits above $50,000, please upload a valid Business License or Certificate of Incorporation.
               </div>
               
               <form onSubmit={handleUpload} className="flex items-center gap-4">
                  <div className="flex-1">
                     <input 
                        type="file" 
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setLicenseFile(e.target.files[0])}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                     />
                  </div>
                  <button 
                     type="submit" 
                     disabled={!licenseFile || uploadStatus !== 'idle'}
                     className="bg-slate-800 text-white px-6 py-2 rounded text-xs font-bold uppercase hover:bg-slate-900 disabled:opacity-50"
                  >
                     {uploadStatus === 'uploading' ? 'Transmitting...' : uploadStatus === 'success' ? 'Submitted' : 'Upload Proof'}
                  </button>
               </form>
            </div>

         </div>

         {/* 3. RIGHT COL: Developer & Security */}
         <div className="space-y-6">
            
            {/* API Access */}
            <div className="bg-slate-900 text-slate-400 p-6 rounded shadow-lg">
               <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                  <FaServer /> API Credentials
               </h3>
               <p className="text-xs mb-4 leading-relaxed">
                  Use this key to access the <strong>BambooMall Settlement API</strong> for automated high-frequency purchasing.
               </p>
               <div className="bg-black/50 p-3 rounded border border-slate-700 font-mono text-xs break-all relative group">
                  {apiKey}
                  <button 
                     onClick={revealKey}
                     className="absolute top-2 right-2 text-slate-500 hover:text-white"
                     title="Generate Key"
                  >
                     <FaCopy />
                  </button>
               </div>
               <button 
                  onClick={revealKey}
                  className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-xs font-bold uppercase border border-slate-700 transition"
               >
                  Generate Production Key
               </button>
            </div>

            {/* Account Actions */}
            <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
               <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
                  Security Settings
               </h3>
               <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-xs font-bold text-slate-600 flex justify-between items-center">
                     <span>Change Access Password</span>
                     <FaLock className="text-slate-400" />
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-xs font-bold text-slate-600 flex justify-between items-center">
                     <span>Two-Factor Authentication (2FA)</span>
                     <span className="text-emerald-600">ENABLED</span>
                  </button>
               </div>
            </div>

         </div>

      </div>
    </div>
  );
}