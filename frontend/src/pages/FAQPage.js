// src/pages/FAQPage.js

import React, { useState, useEffect } from "react";
import { 
  FaChevronDown, 
  FaBook, 
  FaGlobe, 
  FaShieldAlt, 
  FaCoins, 
  FaServer,
  FaCheckCircle 
} from "react-icons/fa";

const faqs = [
  {
    id: "OP-01",
    q: "What is the primary function of the BambooMall SCM Terminal?",
    a: "BambooMall SCM is a proprietary distressed asset clearinghouse. We connect certified agents directly to 'Second-Hand Title' export lots from Tier-1 manufacturing hubs (Shenzhen/Dongguan). Our platform allows agents to acquire 'Ex-Works' inventory and immediately liquidate it on secondary markets via our automated settlement API."
  },
  {
    id: "FIN-02",
    q: "How is the 'Projected Margin' calculated?",
    a: "The margin spread is derived from the arbitrage between our 'Liquidation Cost Basis' (LCB) and the 'Global Spot Price' on downstream marketplaces (Amazon FBA/Walmart). Our algorithm locks in a fixed spread before an allocation is offered to you."
  },
  {
    id: "OPS-03",
    q: "Can I cancel or refund an allocation?",
    a: "Yes. You may execute a 'Liquidity Unwind' command on any active allocation prior to final settlement. However, a 1.0% Breakage Fee will be deducted from the principal to cover counterparty contract termination costs. Funds are returned to your wallet immediately after the fee is processed."
  },
  {
    id: "SEC-04",
    q: "Why does my Deposit Address change every time? (OTA Protocol)",
    a: "For maximum security, our Treasury System uses OTA (One-Time Address) generation. Similar to high-security personal wallets (e.g., TrustWallet, Ledger), a unique, segregated sub-account is created for every single transaction. This prevents ledger collisions and ensures your funds are isolated from the main liquidity pool. NEVER reuse an old address; always generate a fresh OTA in the Treasury console."
  },
  {
    id: "TX-05",
    q: "Why use USDC instead of Bank Transfer?",
    a: "Two reasons: Speed and Tariffs. 1) T+0 Settlement: Digital Assets settle instantly (0-10 mins), whereas SWIFT transfers take 3-5 days. 2) Duty-Free Status: Due to the '2025 Cross-Border Export Tariff,' fiat transfers (USD/EUR/CNY) now incur a 15% Tax Levy. Digital Asset settlements occur within the Free Trade Zone and remain 100% Duty-Free."
  },
  {
    id: "SEC-06",
    q: "Is using USDC safe? Who else uses it?",
    a: "USDC is the global standard for institutional settlement, fully backed 1:1 by US Treasury bonds. It is currently utilized by major financial entities (BlackRock, Visa, Stripe) to bypass legacy banking delays. By using USDC, you are accessing the same 'Institutional Rail' used by global logistics firms for instant capital deployment."
  },
  {
    id: "OPS-07",
    q: "Why are my funds held in 'Pending' status?",
    a: "In compliance with Cross-Border Settlement laws (SAFE Reg 2026), funds from resale activities must undergo a T+0 (Instant) or T+1 (24h) clearing period to verify the transaction ledger. This ensures audit compliance for high-volume traders."
  },
  {
    id: "MKT-08",
    q: "What is the 'Resale Liquidity' guarantee?",
    a: "Unlike traditional wholesale, BambooMall holds pre-signed purchase orders from downstream retailers. When you click 'Liquidate', you are technically fulfilling an existing contract. Settlement is guaranteed unless the downstream buyer declares bankruptcy (Probability < 0.01%)."
  },
  {
    id: "QC-09",
    q: "Can I physically inspect the inventory?",
    a: "All lots are physically inspected by our on-site QC team before listing. You can view the 'Inspection Report' (PDF) and 'Condition Grade' on every manifest detail page. Physical site visits to the Shenzhen Bonded Warehouse are available for partners with >$500k monthly volume."
  },
  {
    id: "ACC-10",
    q: "How do Tier Levels (Syndicate Status) affect my margins?",
    a: "Higher-tier partners (Tier 3+) gain access to 'Priority Lots'—inventory with significantly deeper LCB discounts (up to 40% below market). This artificially inflates your margin spread. Status is updated automatically at 00:00 UTC based on your wallet equity."
  }
];

export default function FAQPage() {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 shadow-sm mb-10">
        <div className="max-w-[1600px] mx-auto pt-10 pb-8 px-6 lg:px-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              {/* Left Side */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <span className="bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Doc v4.2</span>
                   <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                      <FaServer /> Knowledge Base
                   </span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight font-sans">
                  Operational Protocols
                </h1>
                <p className="text-slate-500 mt-2 font-medium max-w-2xl text-sm leading-relaxed">
                  Standard Operating Procedures (SOP) regarding Asset Liquidation, Settlement Protocols, and Tariff Avoidance strategies.
                </p>
              </div>

              {/* Right Side Status */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded p-3 self-start md:self-end">
                 <div className="text-right border-r border-slate-200 pr-4">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Protocol Compliance</div>
                    <div className="text-sm font-bold text-slate-700 font-mono">100%</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Regulation</div>
                    <div className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-2 font-mono">
                       SAFE 2026 <FaCheckCircle />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="max-w-[1000px] mx-auto px-6 lg:px-8">
        
        {/* Intro Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8 flex items-start gap-4">
           <FaBook className="text-blue-600 mt-1 shrink-0 text-xl" />
           <div>
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-1">Agent Handbook</h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                 The following protocols govern all transactions on the BambooMall SCM Terminal. Failure to adhere to settlement timelines (T+0/T+1) may result in account suspension.
              </p>
           </div>
        </div>

        {/* Protocol Grid */}
        <div className="space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = open === idx;
            return (
              <div 
                key={idx} 
                className={`bg-white border rounded transition-all duration-300 overflow-hidden ${
                  isOpen ? "border-blue-600 shadow-md" : "border-slate-200 shadow-sm hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none bg-white hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                     {/* ID Badge */}
                     <span className={`font-mono text-[10px] font-bold px-2 py-1 rounded border ${
                        isOpen ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-500 border-slate-200"
                     }`}>
                        {f.id}
                     </span>
                     
                     {/* Question */}
                     <span className={`font-bold text-sm text-slate-800 ${isOpen ? "text-blue-900" : ""}`}>
                        {f.q}
                     </span>
                  </div>
                  
                  <FaChevronDown 
                    className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? "rotate-180 text-blue-600" : ""}`} 
                    size={10}
                  />
                </button>
                
                {/* Answer Panel */}
                <div
                  className={`px-5 md:px-14 text-sm text-slate-600 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-4 border-t border-slate-100 font-mono text-xs bg-slate-50/50 p-4 rounded border border-slate-100 mt-2">
                    <span className="text-slate-400 font-bold mr-2">&gt;&gt; SYSTEM_RESPONSE:</span>
                    {f.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Badges */}
        <div className="mt-16 pt-8 border-t border-slate-200">
           <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                 <FaGlobe className="text-lg" /> Global Trade Compliance
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                 <FaShieldAlt className="text-lg" /> ISO 27001 Secure
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                 <FaCoins className="text-lg" /> USDC Institutional Rail
              </div>
           </div>
           <p className="text-center text-[10px] text-slate-400 font-mono mt-8 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} BambooMall SCM Ltd. | Shenzhen Bonded Zone | Reg: 9920-3382
           </p>
        </div>

      </div>
    </div>
  );
}