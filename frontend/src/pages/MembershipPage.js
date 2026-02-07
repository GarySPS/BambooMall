// src/pages/MembershipPage.js

import React from "react";
import { useUser } from "../contexts/UserContext";
import { 
  FaShieldAlt, 
  FaBuilding, 
  FaCheckCircle, 
  FaLock, 
  FaChartLine,
  FaInfoCircle,
  FaCrown,
  FaPlaneDeparture,
  FaHandshake,
  FaArrowRight
} from "react-icons/fa";

export default function MembershipPage() {
  const { wallet } = useUser();
  
  // --- WEALTH CALCULATION ---
  const liquidBalance = Number(wallet?.balance || 0);
  const stockValue = Number(wallet?.stock_value || 0);
  const netWorth = wallet?.net_worth ? Number(wallet.net_worth) : (liquidBalance + stockValue);

  // --- CONFIG ---
  const TIERS = [
    {
      id: "T1",
      name: "Global Syndicate (Tier 1)",
      minBalance: 20000,
      bonus: "10%",
      benefits: ["Instant Settlement (T+0)", "Pre-Market Access", "Dedicated Account Manager"],
      credit: "Unlimited",
      desc: "Full strategic partnership with direct factory access and zero-latency clearing."
    },
    {
      id: "T2",
      name: "Regional Partner (Tier 2)",
      minBalance: 13000,
      bonus: "8%",
      benefits: ["Expedited Settlement (T+1)", "Priority Allocation", "Quarterly Rebates"],
      credit: "$50,000 / mo",
      desc: "High-volume resellers granted priority logistics and expedited financial clearance."
    },
    {
      id: "T2_SUB",
      name: "Regional Associate",
      minBalance: 8000,
      bonus: "6%",
      benefits: ["Standard Settlement (T+2)", "Regional Access", "Bulk Discounts"],
      credit: "$25,000 / mo",
      desc: "Established merchants with consistent monthly volume and verified liquidity."
    },
    {
      id: "T3",
      name: "Wholesale Agent (Tier 3)",
      minBalance: 4000,
      bonus: "5%",
      benefits: ["Standard Settlement (T+2)", "Master Manifest"],
      credit: "$10,000 / mo",
      desc: "Verified agents authorized for standard wholesale procurement."
    },
    {
      id: "T3_SUB",
      name: "Verified Scout",
      minBalance: 2000,
      bonus: "4%",
      benefits: ["Standard Settlement (T+3)", "Public Manifest"],
      credit: "Prepaid Only",
      desc: "Entry-level access for new accounts establishing credit history."
    }
  ];

  // Logic to find current active tier
  const currentTier = TIERS.slice().sort((a,b) => a.minBalance - b.minBalance).reverse().find(t => netWorth >= t.minBalance) || { 
    name: "Unverified Entity", 
    bonus: "0%",
    minBalance: 0,
    desc: "Account pending verification."
  };

  const nextTier = TIERS.slice().sort((a,b) => a.minBalance - b.minBalance).find(t => t.minBalance > netWorth);
  const progressToNext = nextTier ? (netWorth / nextTier.minBalance) * 100 : 100;

  // Formatting Helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 font-sans text-slate-800 animate-fade-in">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 mb-8 gap-4 mt-6">
         <div className="w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-slate-900 text-white rounded-lg"><FaShieldAlt size={20} /></span>
              Partner Status
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm font-mono uppercase tracking-wide">
              <span className="text-slate-500">Classification: <span className="text-emerald-700 font-bold">{currentTier.name.toUpperCase()}</span></span>
            </div>
         </div>
      </div>

      {/* 2. OVERVIEW TEXT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FaHandshake className="text-blue-600"/> Syndicate Protocol Overview
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  The BambooMall Syndicate operates on a tiered liquidity protocol designed to reward high-volume partners with superior clearing terms and reduced procurement costs. 
                  Your partnership tier is dynamically evaluated based on your <strong>Total Net Worth</strong> (Liquid Settlement Balance + Active Inventory Value).
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-sm text-blue-800 leading-relaxed">
                      <strong>Automatic Upgrades:</strong> As your net worth increases through deposits or sales, your account is automatically upgraded to the next tier, unlocking deeper discounts and higher credit lines instantly.
                  </p>
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Next Milestone</div>
              {nextTier ? (
                  <>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-slate-800 font-bold text-sm md:text-base">{nextTier.name}</span>
                        <span className="text-emerald-600 font-mono text-sm">{formatCurrency(nextTier.minBalance)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progressToNext}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500">
                        Add <strong className="text-slate-800">{formatCurrency(nextTier.minBalance - netWorth)}</strong> to upgrade.
                    </p>
                  </>
              ) : (
                  <div className="text-center py-4">
                      <FaCrown className="text-yellow-400 text-4xl mx-auto mb-2" />
                      <p className="text-slate-800 font-bold">Top Tier Achieved</p>
                      <p className="text-xs text-slate-500">You have reached the highest partner status.</p>
                  </div>
              )}
          </div>
      </div>

      {/* 3. STATUS CARD (STACKS ON MOBILE) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-xl overflow-hidden relative group mb-10">
         <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
            <FaBuilding size={240} />
         </div>
         
         <div className="p-6 md:p-10 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
               <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Current Active Standing</div>
               <div className="text-2xl md:text-5xl font-mono font-bold text-white mb-4 leading-tight">
                  {currentTier.name.replace(/\(Tier \d\)/, '')}
               </div>
               
               <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold uppercase flex items-center gap-2">
                     <FaCheckCircle /> Verified Partner
                  </span>
                  <span className="px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold uppercase flex items-center gap-2">
                     <FaChartLine /> {currentTier.bonus} VIP Rate Active
                  </span>
               </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 w-full md:w-auto min-w-[240px]">
               <div className="text-xs text-slate-300 uppercase mb-1">Syndicate Credit Line</div>
               <div className="text-2xl font-mono font-bold text-white">{currentTier.credit}</div>
               <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                   <FaInfoCircle /> Revolving Monthly Cap
               </div>
            </div>
         </div>
      </div>

      {/* 4. TIER SCHEDULE (Responsive Switch) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
         <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
               <FaPlaneDeparture className="text-slate-400" /> Volume Schedule (2026)
            </h3>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">EFFECTIVE: JAN 01, 2026</span>
         </div>
         
         {/* A. MOBILE CARDS (< md) */}
         <div className="md:hidden divide-y divide-slate-100">
            {TIERS.map((tier) => {
               const isActive = currentTier.id === tier.id;
               return (
                  <div key={tier.id} className={`p-5 ${isActive ? 'bg-blue-50/50' : ''}`}>
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <div className="font-bold text-slate-900 flex items-center gap-2">
                              {tier.name}
                              {isActive && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Current</span>}
                           </div>
                           <div className="text-xs text-slate-500 mt-1">Min. Net Worth: <span className="font-mono font-bold text-slate-700">{formatCurrency(tier.minBalance)}</span></div>
                        </div>
                        <div className="text-right">
                           <div className="text-emerald-600 font-bold text-lg">{tier.bonus}</div>
                           <div className="text-[9px] text-emerald-700 uppercase font-bold">Discount</div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                           <div className="text-[9px] text-slate-400 uppercase font-bold">Settlement</div>
                           <div className="text-xs font-bold text-slate-700">{tier.benefits[0].split(' ')[0]}</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                           <div className="text-[9px] text-slate-400 uppercase font-bold">Credit Line</div>
                           <div className="text-xs font-bold text-slate-700">{tier.credit}</div>
                        </div>
                     </div>

                     <div className="text-xs text-slate-500 italic leading-relaxed">
                        "{tier.desc}"
                     </div>
                  </div>
               );
            })}
         </div>

         {/* B. DESKTOP TABLE (>= md) */}
         <div className="hidden md:block overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-white text-slate-400 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                   <tr>
                      <th className="px-6 py-4">Tier Designation</th>
                      <th className="px-6 py-4">Min. Net Worth</th>
                      <th className="px-6 py-4 text-emerald-600 font-bold">VIP Discount</th>
                      <th className="px-6 py-4">Settlement Speed</th>
                      <th className="px-6 py-4 text-right">Credit Line</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                   {TIERS.map((tier) => {
                      const isActive = currentTier.id === tier.id;
                      return (
                         <tr key={tier.id} className={`transition-colors ${isActive ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                    <span className={`font-bold ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>{tier.name}</span>
                                    {isActive && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold font-mono">CURRENT</span>}
                               </div>
                               <div className="text-xs text-slate-500 mt-1 max-w-xs">{tier.desc}</div>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-600 font-medium">
                               {formatCurrency(tier.minBalance)}
                            </td>
                            <td className="px-6 py-4 font-bold text-emerald-600 text-base">
                               {tier.bonus}
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                               <div className="flex flex-col gap-1">
                                    {tier.benefits.map((b, i) => (
                                       <span key={i} className="flex items-center gap-1.5"><FaCheckCircle size={10} className="text-slate-300"/> {b}</span>
                                    ))}
                               </div>
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
      </div>

      {/* 5. FOOTER DISCLAIMER */}
      <div className="mt-6 bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-3 leading-relaxed">
         <FaLock className="text-slate-400 mt-0.5 shrink-0" />
         <div>
           <strong>Tier Adjustment Protocol:</strong> Partner status is evaluated daily based on Total Net Worth (Liquid Settlement Balance + Active Inventory Value). 
           VIP Discounts are applied automatically to Proforma Invoices generated after status upgrade. Downgrades occur if Net Worth falls below threshold for 30 consecutive days.
         </div>
      </div>

    </div>
  );
}