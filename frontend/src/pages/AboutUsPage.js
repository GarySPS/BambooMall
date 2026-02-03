//src>pages>AboutUsPage.js

import React, { useState } from "react";
import {
  ShieldCheck,
  Building2,
  FileText,
  Globe,
  Phone,
  ArrowRight,
  Layers,
  Scale
} from "lucide-react";
import CertAwards from "../components/CertAwards";

export default function AboutUsPage() {
  const [tab, setTab] = useState("corporate");

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 font-sans pb-24">
      
      {/* 1. HEADER SECTION - Minimalist & Technical */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                    Corporate Profile
                 </h1>
                 <div className="hidden md:flex h-4 w-[1px] bg-slate-300"></div>
                 <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="text-emerald-600">● LIVE</span>
                    <span>SESSION: AGT-116430</span>
                 </div>
              </div>

              {/* High-end Tab Navigation */}
              <div className="flex h-full">
                {['corporate', 'grading', 'contact'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`h-full px-6 text-xs font-bold uppercase tracking-widest transition-all relative
                            ${tab === t ? "text-blue-700" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}
                        `}
                    >
                        {t}
                        {/* Active Indicator Line */}
                        {tab === t && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600"></div>
                        )}
                    </button>
                ))}
              </div>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full px-6 md:px-8 pt-8 max-w-[1600px] mx-auto">
        
        {/* --- TAB: CORPORATE --- */}
        {tab === "corporate" && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* ELITE HERO SECTION */}
            <div className="w-full bg-[#0a0f1c] rounded-lg text-white relative overflow-hidden shadow-2xl border-t border-slate-800">
               {/* Decorative Background Elements */}
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-900/10 rounded-full blur-[80px] pointer-events-none"></div>
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12">
                   {/* Left: Mandate Text */}
                   <div className="lg:col-span-8 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-2 py-1 bg-white/5 text-slate-300 text-[10px] font-mono uppercase tracking-widest border border-white/10 rounded-sm">
                                Entity ID: 91440300MA5FP7W02K
                            </span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-light mb-6 tracking-tight text-white">
                            Operational <span className="font-bold text-blue-400">Mandate</span>
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl text-justify">
                            BambooMall Supply Chain Management (Shenzhen) Co., Ltd. operates as a licensed liquidation clearinghouse for Tier-1 manufacturing hubs in the Greater Bay Area. Unlike traditional retail models, we strictly secure <strong>Ex-Factory</strong> and <strong>Distressed Asset</strong> contracts directly from OEM production lines, ensuring provenance and price efficiency.
                        </p>
                   </div>

                   {/* Right: Capital Structure */}
                   <div className="lg:col-span-4 p-10 lg:p-12 bg-white/[0.02] flex flex-col justify-center">
                        <div className="mb-8">
                            <div className="text-[10px] uppercase text-amber-500 font-bold tracking-widest mb-2 flex items-center gap-2">
                                <Building2 size={12} /> Registered Capital
                            </div>
                            <div className="text-4xl font-mono font-medium text-white tracking-tighter">
                                <span className="text-2xl text-slate-500 mr-2">¥</span>50,000,000
                            </div>
                            <div className="text-[10px] text-slate-500 mt-2 font-mono">
                                FULLY PAID-UP (CNY)
                            </div>
                        </div>
                        <div className="h-[1px] w-full bg-white/10 mb-8"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase mb-1">Audit Year</div>
                                <div className="text-sm text-white font-mono">FY-2024</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase mb-1">Jurisdiction</div>
                                <div className="text-sm text-white font-mono">Shenzhen</div>
                            </div>
                        </div>
                   </div>
               </div>
            </div>

            {/* INFRASTRUCTURE STRIP - Unified "Report" Look */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                 <div className="p-8 group hover:bg-slate-50 transition-colors">
                     <div className="mb-4 text-emerald-600 bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck size={20}/>
                     </div>
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Escrow Settlement</h3>
                     <p className="text-xs text-slate-500 leading-6">
                        Funds held in regulated accounts until manifest transfer is verified. Zero-risk allocation for institutional partners.
                     </p>
                 </div>
                 <div className="p-8 group hover:bg-slate-50 transition-colors">
                     <div className="mb-4 text-blue-600 bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Globe size={20}/>
                     </div>
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Customs Clearance</h3>
                     <p className="text-xs text-slate-500 leading-6">
                        Automated HS Code assignment for 140+ export jurisdictions. Seamless FOB/CIF logistics handling.
                     </p>
                 </div>
                 <div className="p-8 group hover:bg-slate-50 transition-colors">
                     <div className="mb-4 text-amber-600 bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText size={20}/>
                     </div>
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Grade Verification</h3>
                     <p className="text-xs text-slate-500 leading-6">
                        On-site ISO 9001 audit teams inspect every lot before listing. 100% transparency on cosmetic defects.
                     </p>
                 </div>
            </div>
            
            <CertAwards />

          </div>
        )}

        {/* --- TAB: GRADING --- */}
        {tab === "grading" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-6">
             <div className="flex items-center gap-4 bg-amber-50/50 border border-amber-100 p-4 rounded-sm">
                <Scale className="text-amber-500" size={20}/>
                <div className="text-sm text-slate-600">
                   <strong>Analyst Note:</strong> All assets are graded according to <em>Shenzhen Export Standard T/SZ 2023</em>. 
                </div>
             </div>

             <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">Classification Standards</h3>
                    <Layers className="text-slate-300" size={16}/>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead className="text-xs text-slate-400 font-bold uppercase border-b border-slate-200 tracking-wider">
                          <tr>
                             <th className="px-6 py-4 w-32">Grade</th>
                             <th className="px-6 py-4">Condition Logic</th>
                             <th className="px-6 py-4">Tolerance</th>
                             <th className="px-6 py-4">Reference</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 text-slate-600">
                          <tr className="hover:bg-slate-50/80 transition-colors">
                             <td className="px-6 py-5">
                                 <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold rounded text-xs">A</span>
                             </td>
                             <td className="px-6 py-5">
                                <strong className="text-slate-900 block mb-1">Factory Overstock</strong>
                                <span className="text-xs">Never sold. Original packaging intact. Retail-ready.</span>
                             </td>
                             <td className="px-6 py-5 font-mono text-xs text-slate-500">0% Defect Rate</td>
                             <td className="px-6 py-5 text-xs">New iPhone 15 (Sealed)</td>
                          </tr>
                          <tr className="hover:bg-slate-50/80 transition-colors">
                             <td className="px-6 py-5">
                                 <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded text-xs">B</span>
                             </td>
                             <td className="px-6 py-5">
                                <strong className="text-slate-900 block mb-1">Open Box / Shelf Pull</strong>
                                <span className="text-xs">Packaging minor damage. Product pristine.</span>
                             </td>
                             <td className="px-6 py-5 font-mono text-xs text-slate-500">Cosmetic &lt; 2mm</td>
                             <td className="px-6 py-5 text-xs">Laptop (No Box)</td>
                          </tr>
                          <tr className="hover:bg-slate-50/80 transition-colors">
                             <td className="px-6 py-5">
                                 <span className="w-8 h-8 flex items-center justify-center bg-amber-100 text-amber-700 font-bold rounded text-xs">C</span>
                             </td>
                             <td className="px-6 py-5">
                                <strong className="text-slate-900 block mb-1">Consumer Return</strong>
                                <span className="text-xs">Shows signs of light usage. Repackaged.</span>
                             </td>
                             <td className="px-6 py-5 font-mono text-xs text-slate-500">Battery &gt; 85%</td>
                             <td className="px-6 py-5 text-xs">Used Console</td>
                          </tr>
                       </tbody>
                    </table>
                </div>
             </div>
          </div>
        )}

        {/* --- TAB: CONTACT --- */}
        {tab === "contact" && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Address Card - Styled like a Business Card */}
              <div className="bg-slate-900 text-white p-10 rounded-lg shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                  <div>
                      <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                        <Globe size={14}/> Global Headquarters
                      </h3>
                      <div className="space-y-2 border-l-2 border-slate-700 pl-6">
                          <p className="text-xl font-light">Level 24, China Resources Tower</p>
                          <p className="text-slate-400 font-light">2666 Keyuan South Road, Nanshan District</p>
                          <p className="text-slate-400 font-light">Shenzhen, Guangdong, China 518052</p>
                      </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-end">
                      <div>
                        <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Operating Hours</div>
                        <div className="font-mono text-sm">MON-FRI: 09:00 - 18:00 (CST)</div>
                      </div>
                      <Building2 className="text-white/10 absolute bottom-4 right-4" size={64}/>
                  </div>
              </div>

              {/* Concierge List */}
              <div className="bg-white border border-slate-200 p-8 rounded-lg shadow-sm">
                  <h3 className="text-slate-900 font-bold text-lg mb-8 flex items-center gap-3">
                     <span className="bg-slate-100 p-2 rounded-full"><Phone className="text-slate-600" size={14}/></span>
                     Secure Channels
                  </h3>
                  
                  <div className="space-y-4">
                     <div className="group flex items-center justify-between p-5 bg-white border border-slate-200 rounded hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                        <div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Compliance Desk</div>
                             <div className="text-slate-800 font-mono text-sm group-hover:text-blue-600">compliance@bamboomall.store</div>
                        </div>
                        <ArrowRight className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={16}/>
                     </div>

                     <div className="group flex items-center justify-between p-5 bg-white border border-slate-200 rounded hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer">
                        <div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dispute Resolution</div>
                             <div className="text-slate-800 font-mono text-sm group-hover:text-emerald-600">+86 755-8890-9920</div>
                        </div>
                        <ArrowRight className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" size={16}/>
                     </div>
                  </div>
              </div>
           </div>
        )}

        {/* COMPLIANCE FOOTER */}
        <div className="mt-16 border-t border-slate-200 pt-8 pb-8 text-[10px] text-slate-400 font-mono flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="max-w-xl text-center md:text-left">
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