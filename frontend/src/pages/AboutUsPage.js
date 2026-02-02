// src/pages/AboutUsPage.js

import React, { useState } from "react";
import {
  FaShieldAlt,
  FaBuilding,
  FaExclamationTriangle,
  FaFileContract,
  FaGlobeAsia,
  FaPhoneAlt,
  FaEnvelope,
  FaCheckDouble
} from "react-icons/fa";
import CertAwards from "../components/CertAwards";

export default function AboutUsPage() {
  const [tab, setTab] = useState("corporate"); // corporate, grading, contact

  return (
    <div className="min-h-screen w-full bg-[#111111] text-slate-300 font-sans relative overflow-x-hidden pb-24">
      
      {/* Background Grid - Industrial Texture */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}
      />

      {/* Industrial Header - Full Width */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto pt-12 px-6 lg:px-12">
        
        <div className="border-b border-slate-800 pb-8 mb-12 flex flex-col md:flex-row justify-between items-end">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="px-2 py-1 bg-emerald-900/30 border border-emerald-800 text-emerald-500 text-[10px] font-mono uppercase tracking-widest rounded">
                    Entity ID: 91440300MA5FP7W02K
                 </span>
                 <span className="px-2 py-1 bg-blue-900/30 border border-blue-800 text-blue-500 text-[10px] font-mono uppercase tracking-widest rounded">
                    Status: Audited
                 </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                 BambooMall <span className="text-slate-700">SCM</span>
              </h1>
           </div>
           
           <div className="flex gap-1 mt-6 md:mt-0 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
              {['corporate', 'grading', 'contact'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-md ${
                    tab === t 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                      : "text-slate-500 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
           </div>
        </div>

        {/* --- TAB: CORPORATE --- */}
        {tab === "corporate" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 animate-fade-in">
            
            {/* Left Column: Text (Span 5) */}
            <div className="xl:col-span-5 space-y-8">
               <div>
                  <h3 className="text-white font-bold text-2xl mb-6 flex items-center gap-3">
                     <FaBuilding className="text-blue-600" /> Operational Mandate
                  </h3>
                  <div className="prose prose-invert prose-sm text-slate-400 text-justify leading-relaxed">
                     <p>
                        BambooMall Supply Chain Management (Shenzhen) Co., Ltd. operates as a licensed liquidation clearinghouse for Tier-1 manufacturing hubs in the Guangdong-Hong Kong-Macao Greater Bay Area.
                     </p>
                     <p>
                        Unlike traditional B2B portals, we do not hold retail inventory. We secure <strong>Ex-Factory</strong> and <strong>Distressed Asset</strong> contracts directly from OEM production lines, offering accredited partners access to pre-market manifests at liquidation cost basis.
                     </p>
                  </div>
               </div>
               
               <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                     Asset Recovery Infrastructure
                  </h4>
                  <ul className="space-y-4">
                     <li className="flex gap-4 items-start">
                        <div className="p-2 bg-emerald-900/20 rounded text-emerald-500"><FaShieldAlt /></div>
                        <div>
                           <div className="text-sm font-bold text-slate-200">Escrow Settlement</div>
                           <div className="text-xs text-slate-500">Funds held in regulated accounts until manifest transfer is verified.</div>
                        </div>
                     </li>
                     <li className="flex gap-4 items-start">
                        <div className="p-2 bg-blue-900/20 rounded text-blue-500"><FaGlobeAsia /></div>
                        <div>
                           <div className="text-sm font-bold text-slate-200">Customs Clearance</div>
                           <div className="text-xs text-slate-500">Automated HS Code assignment for 140+ export jurisdictions.</div>
                        </div>
                     </li>
                     <li className="flex gap-4 items-start">
                        <div className="p-2 bg-amber-900/20 rounded text-amber-500"><FaFileContract /></div>
                        <div>
                           <div className="text-sm font-bold text-slate-200">Grade Verification</div>
                           <div className="text-xs text-slate-500">On-site ISO 9001 audit teams inspect every lot before listing.</div>
                        </div>
                     </li>
                  </ul>
               </div>
            </div>
            
            {/* Right Column: Certs (Span 7) */}
            <div className="xl:col-span-7">
               <div className="bg-[#0f0f10] border border-slate-800 rounded-xl overflow-hidden h-full flex flex-col">
                  <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                     <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        Compliance & Audit Ledger
                     </span>
                     <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                        <FaCheckDouble /> VERIFIED: CN-SZ-2024-889X
                     </span>
                  </div>
                  <div className="p-8 flex-1 flex items-center justify-center">
                     <CertAwards /> 
                  </div>
               </div>
            </div>

          </div>
        )}

        {/* --- TAB: GRADING --- */}
        {tab === "grading" && (
          <div className="animate-fade-in max-w-5xl mx-auto">
             <div className="bg-amber-900/10 border border-amber-900/30 p-6 mb-8 flex items-start gap-4 rounded-xl">
                <FaExclamationTriangle className="text-amber-500 mt-1 flex-shrink-0 text-xl" />
                <div className="text-sm text-amber-200/80 leading-relaxed">
                   <strong>Analyst Note:</strong> All assets listed on the terminal are graded according to <em>Shenzhen Export Standard T/SZ 2023</em>. 
                   Partners are advised to review lot-specific inspection reports (PDF) before allocation to ensure compatibility with downstream resale channels.
                </div>
             </div>

             <div className="border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                   <thead className="bg-slate-900 text-slate-500 font-mono text-xs uppercase">
                      <tr>
                         <th className="p-6 border-b border-slate-800 w-1/4">Grade Code</th>
                         <th className="p-6 border-b border-slate-800 w-1/2">Condition Definition</th>
                         <th className="p-6 border-b border-slate-800 w-1/4">Technical Tolerance</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800 text-slate-400">
                      <tr className="bg-emerald-950/10 hover:bg-emerald-900/20 transition-colors">
                         <td className="p-6 font-bold text-emerald-400 font-mono text-lg">GRADE A (A+)</td>
                         <td className="p-6">
                            <span className="text-white font-bold block mb-1">Factory Overstock / Ex-Works</span>
                            Never sold. Original packaging intact. Retail-ready condition.
                         </td>
                         <td className="p-6 text-xs font-mono text-slate-500">
                            0% Defect Rate. <br/>Glue/Stitch imperfections &lt; 0.5mm.
                         </td>
                      </tr>
                      <tr className="hover:bg-slate-800/30 transition-colors">
                         <td className="p-6 font-bold text-white font-mono text-lg">GRADE B (A-)</td>
                         <td className="p-6">
                            <span className="text-white font-bold block mb-1">Open Box / Shelf Pulls</span>
                            Packaging may have minor cosmetic damage (dents/scratches). Product pristine.
                         </td>
                         <td className="p-6 text-xs font-mono text-slate-500">
                            Cosmetic flaws &lt; 2mm visible from 30cm. <br/>Functionality 100%.
                         </td>
                      </tr>
                      <tr className="hover:bg-slate-800/30 transition-colors">
                         <td className="p-6 font-bold text-amber-500 font-mono text-lg">GRADE C (RMA)</td>
                         <td className="p-6">
                            <span className="text-white font-bold block mb-1">Customer Returns</span>
                            May show signs of light usage. Repackaged in generic white box.
                         </td>
                         <td className="p-6 text-xs font-mono text-slate-500">
                            Visible wear permitted. <br/>Battery health &gt; 85% (Electronics).
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* --- TAB: CONTACT --- */}
        {tab === "contact" && (
           <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-2xl shadow-2xl">
                 <h3 className="text-white font-bold text-2xl mb-8 flex items-center gap-3">
                    <FaGlobeAsia className="text-blue-500"/> Secure Communication Channels
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="space-y-6">
                       <div className="p-4 border border-slate-700 rounded-lg bg-black/20">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Global Headquarters</span>
                          <span className="text-white font-mono text-sm leading-relaxed block">
                             Level 24, China Resources Tower (Spring Bamboo)<br/>
                             2666 Keyuan South Road, Nanshan District<br/>
                             Shenzhen, Guangdong, China 518052
                          </span>
                       </div>
                       <div className="p-4 border border-slate-700 rounded-lg bg-black/20">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Registered Capital</span>
                          <span className="text-emerald-500 font-mono text-xl font-bold block">
                             ¥ 50,000,000 CNY
                          </span>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="bg-slate-800 p-4 rounded flex items-center justify-between group cursor-pointer hover:bg-slate-700 transition">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-slate-900 rounded text-slate-400"><FaEnvelope/></div>
                             <div>
                                <div className="text-xs text-slate-400">Compliance Desk</div>
                                <div className="text-white font-mono text-sm group-hover:text-blue-400">compliance@bamboomall.store</div>
                             </div>
                          </div>
                       </div>
                       <div className="bg-slate-800 p-4 rounded flex items-center justify-between group cursor-pointer hover:bg-slate-700 transition">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-slate-900 rounded text-slate-400"><FaPhoneAlt/></div>
                             <div>
                                <div className="text-xs text-slate-400">Dispute Resolution</div>
                                <div className="text-white font-mono text-sm group-hover:text-emerald-400">+86 755-8890-9920</div>
                             </div>
                          </div>
                       </div>
                    </div>

                 </div>
              </div>
           </div>
        )}

        {/* --- REGULATORY FOOTER --- */}
        <div className="mt-20 border-t border-slate-800 pt-8 text-[10px] text-slate-600 font-mono leading-relaxed text-justify">
           <p className="mb-2">
              <strong>REGULATORY WARNING:</strong> Cross-border capital settlements exceeding $50,000 USD are subject to the <em>State Administration of Foreign Exchange (SAFE)</em> reporting requirements (Reg. 2026-CN). 
              BambooMall SCM utilizes automated AML/KYC filtering for all fiat transactions via SWIFT/SEPA.
           </p>
           <p>
              <strong>DIGITAL ASSET NOTICE:</strong> Settlements executed via decentralized ledgers (USDC/USDT) are processed through our Hong Kong Special Administrative Region entity (BambooMall Fintech HK Ltd) to ensure duty-free compliance within the Greater Bay Area Free Trade Zone.
           </p>
           <div className="mt-4 flex gap-6 text-slate-500 font-bold">
              <span>ICP License: 粤B2-2024889X</span>
              <span>D-U-N-S Number: 554-221-992</span>
              <span>ISO 9001:2015 Certified</span>
           </div>
        </div>

      </div>
    </div>
  );
}