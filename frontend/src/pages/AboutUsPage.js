// src/pages/AboutUsPage.js

import React, { useState } from "react";
import {
  ShieldCheck,
  Building2,
  Globe,
  Phone,
  ArrowRight,
  Layers,
  Scale,
  MapPin,
  Box,
  TrendingUp,
  MessageCircle, // For Telegram
  Microscope,
} from "lucide-react";
import CertAwards from "../components/CertAwards";
import GradingMatrix from "../components/GradingMatrix"; // <--- IMPORTED

export default function AboutUsPage() {
  const [tab, setTab] = useState("corporate");

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 font-sans pb-24">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter hidden sm:block">
                    Corporate Profile
                 </h1>
                 <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter sm:hidden">
                    Profile
                 </h1>
                 <div className="hidden md:flex h-4 w-[1px] bg-slate-300"></div>
                 <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="text-emerald-600 flex items-center gap-1"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> LIVE</span>
                    <span>SESSION: AGT-116430</span>
                 </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex h-full overflow-x-auto no-scrollbar">
                {['corporate', 'grading', 'contact'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`h-full px-4 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap
                            ${tab === t ? "text-blue-700 bg-blue-50/50" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}
                        `}
                    >
                        {t}
                        {tab === t && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></div>
                        )}
                    </button>
                ))}
              </div>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full px-4 sm:px-6 pt-8 max-w-7xl mx-auto">
        
        {/* --- TAB: CORPORATE --- */}
        {tab === "corporate" && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* HERO SECTION */}
            <div className="w-full bg-[#0a0f1c] rounded-2xl text-white relative overflow-hidden shadow-2xl border border-slate-800">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-900/10 rounded-full blur-[80px] pointer-events-none"></div>
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12">
                   <div className="lg:col-span-8 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-white/5 text-slate-300 text-xs font-mono uppercase tracking-widest border border-white/10 rounded-md">
                                Entity ID: 91440300MA5FP7W02K
                            </span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-light mb-6 tracking-tight text-white leading-tight">
                           Operational <span className="font-bold text-blue-400">Mandate</span>
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl text-justify">
                           BambooMall Supply Chain Management (Shenzhen) Co., Ltd. operates as a licensed liquidation clearinghouse for Tier-1 manufacturing hubs in the Greater Bay Area. Unlike traditional retail models, we strictly secure <strong>Ex-Factory</strong> and <strong>Distressed Asset</strong> contracts directly from OEM production lines, ensuring provenance and price efficiency.
                        </p>
                        
                        <div className="mt-8 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                                <ShieldCheck size={16} /> Licensed Distributor
                            </div>
                            <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                                <Globe size={16} /> Cross-Border Certified
                            </div>
                        </div>
                   </div>

                   <div className="lg:col-span-4 p-8 md:p-12 bg-white/[0.02] flex flex-col justify-center">
                        <div className="mb-8">
                            <div className="text-xs uppercase text-amber-500 font-bold tracking-widest mb-2 flex items-center gap-2">
                                <Building2 size={14} /> Registered Capital
                            </div>
                            <div className="text-4xl font-mono font-medium text-white tracking-tighter">
                                <span className="text-2xl text-slate-500 mr-2">¥</span>50,000,000
                            </div>
                            <div className="text-xs text-slate-500 mt-2 font-mono">
                                FULLY PAID-UP (CNY)
                            </div>
                        </div>
                        <div className="h-[1px] w-full bg-white/10 mb-8"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-slate-500 uppercase mb-1">Audit Year</div>
                                <div className="text-sm text-white font-mono font-bold">FY-2025</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase mb-1">Jurisdiction</div>
                                <div className="text-sm text-white font-mono font-bold">Shenzhen</div>
                            </div>
                        </div>
                   </div>
               </div>
            </div>

            {/* METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Daily Volume", val: "$2.4M+", icon: <TrendingUp className="text-emerald-600"/> },
                    { label: "Active Warehouses", val: "14", icon: <Building2 className="text-blue-600"/> },
                    { label: "Partner Factories", val: "320+", icon: <Layers className="text-amber-600"/> },
                    { label: "Clearance Rate", val: "99.8%", icon: <ShieldCheck className="text-purple-600"/> },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
                        <div className="mb-2 p-2 bg-slate-50 rounded-full">{stat.icon}</div>
                        <div className="text-2xl font-bold text-slate-900">{stat.val}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* INFRASTRUCTURE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin className="text-blue-600"/> Strategic Logistics Hubs
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                            <div>
                                <strong className="text-sm text-slate-800 block">Shenzhen (HQ & Tech Hub)</strong>
                                <span className="text-xs text-slate-500">Primary consolidation point for electronics and high-tech manufacturing.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                            <div>
                                <strong className="text-sm text-slate-800 block">Yiwu (Commodity Aggregation)</strong>
                                <span className="text-xs text-slate-500">Central warehousing for bulk small commodities and textiles.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                            <div>
                                <strong className="text-sm text-slate-800 block">Hong Kong (Financial Gateway)</strong>
                                <span className="text-xs text-slate-500">Offshore settlement and international logistics routing.</span>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Box className="text-emerald-600"/> Fulfillment Capacity
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                <span>Monthly Container Output</span>
                                <span>850+ TEU</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full w-[85%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                <span>Customs Clearance Success</span>
                                <span>99.9%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full w-[99%]"></div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mt-4 pt-4 border-t border-slate-100">
                            Our integrated ERP system connects directly with major shipping lines (Maersk, MSC, COSCO) to ensure priority slot booking even during peak seasons.
                        </p>
                    </div>
                </div>
            </div>
            
            <CertAwards />

          </div>
        )}

        {/* --- TAB: GRADING --- */}
        {tab === "grading" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-6">
              
              {/* Analyst Note */}
              <div className="flex items-center gap-4 bg-amber-50/50 border border-amber-100 p-4 rounded-lg">
                 <Scale className="text-amber-500 shrink-0" size={24}/>
                 <div className="text-sm text-slate-600">
                    <strong>Analyst Note:</strong> All assets are graded according to <em>Shenzhen Export Standard T/SZ 2023</em>. Grading is performed by independent third-party inspectors.
                 </div>
              </div>

              {/* Inspection Protocol Info */}
              <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-xl shadow-sm">
                 <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
                        <Microscope size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">20-Point Technical Inspection</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                            All electronic assets processed by BambooMall undergo a rigorous multi-stage testing protocol. We do not sell unchecked "raw" returns. 
                            Our independent QA teams in Shenzhen verify functionality, battery health, and cosmetic condition before any item is listed on the Manifest.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Screen Test', 'Battery Cycle Count', 'Port Functionality', 'IMEI Check', 'Software Reset'].map((tag) => (
                                <span key={tag} className="text-[10px] font-bold uppercase px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                 </div>
              </div>

              {/* DYNAMIC MATRIX COMPONENT */}
              <GradingMatrix />
              
          </div>
        )}

        {/* --- TAB: CONTACT --- */}
        {tab === "contact" && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Address Card */}
              <div className="bg-slate-900 text-white p-8 md:p-10 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[350px]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                  <div>
                      <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                        <Globe size={14}/> Global Headquarters
                      </h3>
                      <div className="space-y-3 border-l-2 border-slate-700 pl-6">
                          <p className="text-xl md:text-2xl font-light">Level 24, China Resources Tower</p>
                          <p className="text-slate-400 font-light text-sm md:text-base">2666 Keyuan South Road, Nanshan District</p>
                          <p className="text-slate-400 font-light text-sm md:text-base">Shenzhen, Guangdong, China 518052</p>
                      </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-end">
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Operating Hours</div>
                        <div className="font-mono text-sm">MON-FRI: 09:00 - 18:00 (CST)</div>
                      </div>
                      <Building2 className="text-white/10 absolute bottom-6 right-6" size={80}/>
                  </div>
              </div>

              {/* Concierge List */}
              <div className="flex flex-col gap-4">
                  <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex-1">
                      <h3 className="text-slate-900 font-bold text-lg mb-6 flex items-center gap-3">
                         <span className="bg-slate-100 p-2 rounded-full"><Phone className="text-slate-600" size={16}/></span>
                         Secure Channels
                      </h3>
                      
                      <div className="space-y-4">
                         {/* TELEGRAM */}
                         <a href="https://t.me/bamboomall" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-5 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:shadow-lg transition-all cursor-pointer">
                            <div>
                                 <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 group-hover:text-blue-200">24/7 Priority Support</div>
                                 <div className="text-slate-900 font-bold text-base flex items-center gap-2 group-hover:text-white">
                                    <MessageCircle size={18} /> Telegram: @bamboomall
                                 </div>
                            </div>
                            <ArrowRight className="text-blue-400 group-hover:text-white group-hover:translate-x-1 transition-all" size={20}/>
                         </a>

                         <div className="group flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all cursor-pointer">
                            <div>
                                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Compliance Desk</div>
                                 <div className="text-slate-700 font-mono text-sm group-hover:text-slate-900">compliance@bamboomall.store</div>
                            </div>
                            <ArrowRight className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" size={16}/>
                         </div>

                         <div className="group flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-md transition-all cursor-pointer">
                            <div>
                                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Dispute Resolution</div>
                                 <div className="text-slate-700 font-mono text-sm group-hover:text-slate-900">+86 755-8890-9920</div>
                            </div>
                            <ArrowRight className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" size={16}/>
                         </div>
                      </div>
                  </div>
              </div>
           </div>
        )}

        {/* COMPLIANCE FOOTER */}
        <div className="mt-16 border-t border-slate-200 pt-8 pb-8 text-xs text-slate-400 font-mono flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="max-w-xl">
                REGULATORY WARNING: Cross-border capital settlements exceeding $50,000 USD are subject to SAFE reporting requirements. This portal is for authorized agents only.
            </p>
            <div className="flex gap-6 font-bold text-slate-500">
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> ICP: 粤B2-2024889X</span>
               <span>ISO 9001:2015</span>
            </div>
        </div>

      </div>
    </div>
  );
}