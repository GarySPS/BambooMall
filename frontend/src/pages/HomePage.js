// src/pages/HomePage.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import ManifestTable from "../components/ManifestTable";
import GlobalFeed from "../components/GlobalFeed";
import { 
  LineChart, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  ArrowUp, 
  Clock, 
  ChevronRight,
  FileText
} from "lucide-react";

// --- TIER CONFIGURATION (Synced with MembershipPage.js) ---
const TIERS = [
  { min: 20000, name: "Global Syndicate", credit: "Unlimited" }, 
  { min: 13000, name: "Regional Partner", credit: 50000 }, 
  { min: 8000,  name: "Regional Associate", credit: 25000 }, 
  { min: 4000,  name: "Wholesale Agent", credit: 10000 }, 
  { min: 2000,  name: "Verified Scout", credit: 0 }, 
  { min: 0,     name: "Standard", credit: 0 }
];

export default function HomePage() {
  const { user } = useUser();
  const [balance, setBalance] = useState(0);
  const [creditLimit, setCreditLimit] = useState(0); 
  const [tier, setTier] = useState("Standard");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch Financials & Calculate Tier/Credit
  useEffect(() => {
    const fetchFinancials = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_BASE_URL}/wallet/${user.id}`);
        const data = await res.json();
        
        if (data.wallet) {
           const currentBalance = data.wallet.balance || 0;
           const stockValue = data.wallet.stock_value || 0;
           const netWorth = data.wallet.net_worth || (currentBalance + stockValue);

           setBalance(currentBalance);
           
           const matchingTier = TIERS.sort((a, b) => b.min - a.min).find(t => netWorth >= t.min) || TIERS[TIERS.length - 1];
           
           setTier(matchingTier.name);
           setCreditLimit(matchingTier.credit);
        }
      } catch (err) {
        console.error("Financial Data Stream Interrupted");
      }
    };
    fetchFinancials();
  }, [user]);

  // Clock
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-24 w-full">
      
      {/* --- HEADER (Mobile Optimized) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-800 pb-6 gap-4 md:gap-0">
        <div className="w-full md:w-auto">
           <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight flex justify-between items-center w-full">
              Procurement Console
              {/* Mobile Only Browse Link */}
              <Link to="/products" className="md:hidden text-xs font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                 Manifest <ChevronRight size={12}/>
              </Link>
           </h1>
           
           <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-[10px] md:text-sm font-mono font-medium text-slate-500">
             <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded text-slate-600">
               <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               NET: MAINNET-ALPHA
             </span>
             <span>SESSION: {user?.short_id ? `AGT-${user.short_id}` : "GUEST"}</span>
             <span className="hidden md:inline text-slate-300">|</span>
             <span className="flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                {currentTime.toUTCString().replace("GMT", "UTC")}
             </span>
           </div>
        </div>
        
        {/* Desktop Browse Link */}
        <div className="hidden md:flex items-center gap-2">
           <Link 
             to="/products"
             className="text-sm lg:text-base font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
           >
             Browse Master Manifest <ChevronRight className="group-hover:translate-x-1 transition-transform" size={16} />
           </Link>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Card A: Liquidity */}
        <div className="bg-white p-5 lg:p-8 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
           <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110"></div>
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-2 lg:mb-4">
               <span className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">Available Liquidity</span>
               <DollarSign className="text-blue-500" size={24} />
             </div>
             <div className="text-3xl lg:text-4xl font-bold text-slate-900 font-mono tracking-tight">
               {balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
             </div>
             <div className="mt-2 lg:mt-3 flex items-center gap-2 text-[10px] lg:text-sm font-bold">
               <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                 <ArrowUp size={12} /> 4.2%
               </span>
               <span className="text-slate-400">vs last cycle</span>
             </div>
           </div>
        </div>

        {/* Card B: Credit Line */}
        <div className="bg-white p-5 lg:p-8 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all">
           <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110"></div>
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-2 lg:mb-4">
               <span className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">Approved Credit</span>
               <LineChart className="text-indigo-500" size={24} />
             </div>
             <div className="text-3xl lg:text-4xl font-bold text-slate-900 font-mono tracking-tight truncate">
               {typeof creditLimit === 'number' 
                 ? creditLimit.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) 
                 : <span className="text-2xl">{creditLimit}</span>
               }
             </div>
             <div className="mt-2 lg:mt-3 text-[10px] lg:text-sm text-slate-400">
               LEVEL: <span className="font-bold text-indigo-700">{tier.toUpperCase()}</span>
             </div>
           </div>
        </div>

        {/* Card C: Compliance (Full Width Mobile Button) */}
        <div className="bg-amber-50 p-5 lg:p-8 rounded-xl shadow-sm border border-amber-200 relative overflow-hidden sm:col-span-2 lg:col-span-2">
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-2 lg:mb-4">
               <span className="text-[10px] lg:text-xs font-bold text-amber-700 uppercase tracking-widest">Compliance Alerts</span>
               <AlertTriangle className="text-amber-600 animate-pulse" size={24} />
             </div>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <div className="text-sm lg:text-xl font-bold text-slate-800 leading-snug">
                   New Tariff Policy (2026)
                   </div>
                   <p className="text-xs lg:text-base text-slate-600 mt-1 lg:mt-2 max-w-lg leading-relaxed">
                      All fiat transfers (SWIFT) are now subject to a 15% pre-clearance holding period. Use USDC for instant release.
                   </p>
                </div>
                {/* Full width button on mobile */}
                <Link to="/compliance" className="w-full md:w-auto text-center text-xs lg:text-sm font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-6 py-3 rounded-lg transition-colors whitespace-nowrap shadow-sm">
                   Review Action Items →
                </Link>
             </div>
           </div>
        </div>
      </div>

      {/* --- MAIN DASHBOARD SPLIT --- */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8 min-h-[500px]">
         
         {/* LEFT: MANIFEST FEED */}
         <ManifestTable />

         {/* RIGHT: GLOBAL FEED (Stacked on mobile) */}
         <div className="xl:col-span-1 h-fit">
             <GlobalFeed />
         </div>

      </div>

      {/* --- FOOTER ACTIONS (Responsive Grid) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 pt-4">
         <Link to="/products" className="bg-blue-700 hover:bg-blue-600 active:scale-95 text-white p-4 lg:p-6 rounded-xl flex flex-col items-center justify-center gap-2 text-center shadow-lg shadow-blue-900/20 transition-all">
            <Package className="text-2xl md:text-4xl text-blue-100" />
            <span className="text-xs md:text-base font-bold uppercase tracking-wide">Browse Manifests</span>
         </Link>

         <Link to="/balance" className="bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white p-4 lg:p-6 rounded-xl flex flex-col items-center justify-center gap-2 text-center shadow-lg shadow-emerald-900/20 transition-all">
            <DollarSign className="text-2xl md:text-4xl text-emerald-100" />
            <span className="text-xs md:text-base font-bold uppercase tracking-wide">Add Funds</span>
         </Link>

         <Link to="/compliance" className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 p-4 lg:p-6 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all shadow-sm">
            <FileText className="text-2xl md:text-4xl text-slate-400" />
            <span className="text-xs md:text-base font-bold uppercase tracking-wide">Shipping Policy</span>
         </Link>

         <Link to="/profile" className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 p-4 lg:p-6 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all shadow-sm">
            <LineChart className="text-2xl md:text-4xl text-slate-400" />
            <span className="text-xs md:text-base font-bold uppercase tracking-wide">My Stats</span>
         </Link>
      </div>

    </div>
  );
}