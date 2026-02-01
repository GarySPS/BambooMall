// src/pages/MembershipPage.js

import React from "react";
import { useUser } from "../contexts/UserContext";
import { 
  FaShieldAlt, 
  FaBuilding, 
  FaCheckCircle, 
  FaLock, 
  FaChartLine 
} from "react-icons/fa";

export default function MembershipPage() {
  const { wallet } = useUser();
  const currentBalance = Number(wallet?.balance || 0);

  // --- CONFIG: Must match 'getVipBonus' in orders.js ---
  const TIERS = [
    {
      id: "T1",
      name: "Global Syndicate (Tier 1)",
      minBalance: 40000,
      bonus: "10%",
      benefits: ["Instant Settlement (T+0)", "Pre-Market Access"],
      credit: "Unlimited"
    },
    {
      id: "T2",
      name: "Regional Partner (Tier 2)",
      minBalance: 20000,
      bonus: "8%",
      benefits: ["Expedited Settlement (T+1)", "Priority Allocation"],
      credit: "$50,000 / mo"
    },
    {
      id: "T2_SUB",
      name: "Regional Associate",
      minBalance: 15000,
      bonus: "6%",
      benefits: ["Standard Settlement (T+2)", "Regional Access"],
      credit: "$25,000 / mo"
    },
    {
      id: "T3",
      name: "Wholesale Agent (Tier 3)",
      minBalance: 10000,
      bonus: "5%",
      benefits: ["Standard Settlement (T+2)", "Master Manifest"],
      credit: "$10,000 / mo"
    },
    {
      id: "T3_SUB",
      name: "Verified Scout",
      minBalance: 5000,
      bonus: "4%",
      benefits: ["Standard Settlement (T+3)", "Public Manifest"],
      credit: "Prepaid Only"
    }
  ];

  // Logic to find current active tier
  const currentTier = TIERS.slice().sort((a,b) => a.minBalance - b.minBalance).reverse().find(t => currentBalance >= t.minBalance) || { 
    name: "Unverified Account", 
    bonus: "0%",
    minBalance: 0
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20 font-sans text-slate-800">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200 pb-6">
         <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <FaShieldAlt className="text-blue-900" />
              Partner Status
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              CURRENT STANDING: <span className="text-emerald-600 font-bold">{currentTier.name.toUpperCase()}</span>
            </p>
         </div>
      </div>

      {/* 2. STATUS CARD */}
      <div className="bg-slate-900 text-white p-8 rounded shadow-lg relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Liquidity Requirement Met</div>
               <div className="text-4xl font-mono font-bold text-white">
                  ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
               </div>
               <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                     <FaCheckCircle /> Active Status
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                     <FaChartLine /> {currentTier.bonus} VIP Discount Applied
                  </span>
               </div>
            </div>
            
            {/* Next Tier Progress */}
            <div className="bg-white/10 p-4 rounded border border-white/20 w-full md:w-64 backdrop-blur-sm">
               <div className="text-[10px] text-slate-300 uppercase mb-1">Current Benefit Rate</div>
               <div className="text-2xl font-bold text-emerald-400">{currentTier.bonus} Off</div>
               <div className="text-[10px] text-slate-400 mt-1">Applied to all acquisitions automatically.</div>
            </div>
         </div>
         
         {/* Background Watermark */}
         <div className="absolute right-0 bottom-0 opacity-10 text-white pointer-events-none">
            <FaBuilding size={150} />
         </div>
      </div>

      {/* 3. TIER SCHEDULE TABLE */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
               Syndicate Volume Schedule (2026)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">UPDATED: 01/2026</span>
         </div>
         <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 font-mono text-xs uppercase border-b border-slate-100">
               <tr>
                  <th className="px-6 py-4">Tier Designation</th>
                  <th className="px-6 py-4">Min. Liquidity (USDC)</th>
                  <th className="px-6 py-4 text-emerald-600 font-bold">VIP Discount</th>
                  <th className="px-6 py-4">Settlement Speed</th>
                  <th className="px-6 py-4 text-right">Credit Line</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {TIERS.map((tier) => {
                  const isActive = currentTier.id === tier.id;
                  return (
                     <tr key={tier.id} className={`transition-colors ${isActive ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                        <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-2">
                           {tier.name}
                           {isActive && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-mono">CURRENT</span>}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600">
                           ${tier.minBalance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                           {tier.bonus}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                           {tier.benefits[0]}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                           {tier.credit}
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>

      {/* 4. FOOTER DISCLAIMER */}
      <div className="bg-slate-50 p-4 border border-slate-200 rounded text-[10px] text-slate-400 flex items-start gap-2">
         <FaLock className="text-slate-500 mt-0.5" />
         <div>
            <strong>Tier Adjustment Protocol:</strong> Partner status is evaluated instantly based on wallet balance. 
            VIP Discounts are applied automatically to Proforma Invoices generated after status upgrade.
         </div>
      </div>

    </div>
  );
}