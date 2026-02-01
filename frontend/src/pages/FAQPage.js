// src/pages/FAQPage.js

import React, { useState } from "react";
import { FaChevronDown, FaBook, FaGlobe, FaShieldAlt, FaCoins } from "react-icons/fa";

const faqs = [
  {
    q: "What is the primary function of the BambooMall SCM Terminal?",
    a: "BambooMall SCM is a proprietary distressed asset clearinghouse. We connect certified agents directly to 'Second-Hand Title' export lots from Tier-1 manufacturing hubs (Shenzhen/Dongguan). Our platform allows agents to acquire 'Ex-Works' inventory and immediately liquidate it on secondary markets via our automated settlement API."
  },
  {
    q: "How is the 'Projected Margin' calculated?",
    a: "The margin spread is derived from the arbitrage between our 'Liquidation Cost Basis' (LCB) and the 'Global Spot Price' on downstream marketplaces (Amazon FBA/Walmart). Our algorithm locks in a fixed spread before an allocation is offered to you."
  },
  {
    q: "Can I cancel or refund an allocation?",
    a: "Yes. You may execute a 'Liquidity Unwind' command on any active allocation prior to final settlement. However, a 1.0% Breakage Fee will be deducted from the principal to cover counterparty contract termination costs. Funds are returned to your wallet immediately after the fee is processed."
  },
  {
    q: "Why does my Deposit Address change every time? (OTA Protocol)",
    a: "For maximum security, our Treasury System uses OTA (One-Time Address) generation. Similar to high-security personal wallets (e.g., TrustWallet, Ledger), a unique, segregated sub-account is created for every single transaction. This prevents ledger collisions and ensures your funds are isolated from the main liquidity pool. NEVER reuse an old address; always generate a fresh OTA in the Treasury console."
  },
  {
    q: "Why use USDC/XRP instead of Bank Transfer?",
    a: "Two reasons: Speed and Tariffs. 1) T+0 Settlement: Digital Assets settle instantly (0-10 mins), whereas SWIFT transfers take 3-5 days. 2) Duty-Free Status: Due to the '2025 Cross-Border Export Tariff,' fiat transfers (USD/EUR/CNY) now incur a 15% Tax Levy. Digital Asset settlements occur within the Free Trade Zone and remain 100% Duty-Free."
  },
  {
    q: "Is using USDC safe? Who else uses it?",
    a: "USDC is the global standard for institutional settlement, fully backed 1:1 by US Treasury bonds. It is currently utilized by major financial entities (BlackRock, Visa, Stripe) to bypass legacy banking delays. By using USDC, you are accessing the same 'Institutional Rail' used by global logistics firms for instant capital deployment."
  },
  {
    q: "Why are my funds held in 'Pending' status?",
    a: "In compliance with Cross-Border Settlement laws (SAFE Reg 2026), funds from resale activities must undergo a T+0 (Instant) or T+1 (24h) clearing period to verify the transaction ledger. This ensures audit compliance for high-volume traders."
  },
  {
    q: "What is the 'Resale Liquidity' guarantee?",
    a: "Unlike traditional wholesale, BambooMall holds pre-signed purchase orders from downstream retailers. When you click 'Liquidate', you are technically fulfilling an existing contract. Settlement is guaranteed unless the downstream buyer declares bankruptcy (Probability < 0.01%)."
  },
  {
    q: "Can I physically inspect the inventory?",
    a: "All lots are physically inspected by our on-site QC team before listing. You can view the 'Inspection Report' (PDF) and 'Condition Grade' on every manifest detail page. Physical site visits to the Shenzhen Bonded Warehouse are available for partners with >$500k monthly volume."
  },
  {
    q: "How do Tier Levels (Syndicate Status) affect my margins?",
    a: "Higher-tier partners (Tier 3+) gain access to 'Priority Lots'—inventory with significantly deeper LCB discounts (up to 40% below market). This artificially inflates your margin spread. Status is updated automatically at 00:00 UTC based on your wallet equity."
  }
];

export default function FAQPage() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4 shadow-xl text-white">
            <FaBook size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3 uppercase">
            Operational Manual
          </h1>
          <div className="h-1 w-20 bg-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm font-medium">
            Standard Operating Procedures (SOP) for Asset Liquidation, Settlement Protocols, and Tariff Avoidance.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="space-y-4">
          {faqs.map((f, idx) => {
            const isOpen = open === idx;
            return (
              <div 
                key={idx} 
                className={`bg-white border rounded-lg overflow-hidden transition-all duration-300 ${
                  isOpen ? "border-blue-900 shadow-md ring-1 ring-blue-900" : "border-slate-200 shadow-sm hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none bg-white hover:bg-slate-50 transition-colors"
                >
                  <span className={`font-bold text-sm uppercase tracking-wide pr-4 ${isOpen ? "text-blue-900" : "text-slate-700"}`}>
                    {f.q}
                  </span>
                  <FaChevronDown 
                    className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180 text-blue-900" : ""}`} 
                    size={12}
                  />
                </button>
                
                <div
                  className={`px-5 text-sm text-slate-600 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-48 pb-5 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-2 border-t border-slate-100 font-mono text-xs">
                    {f.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center border-t border-slate-200 pt-8">
          <div className="flex items-center justify-center gap-4 text-slate-400 text-xs mb-2">
             <span className="flex items-center gap-1"><FaGlobe /> Global Trade Compliance</span>
             <span className="flex items-center gap-1"><FaShieldAlt /> ISO 27001 Secure</span>
             <span className="flex items-center gap-1"><FaCoins /> Institutional Rails</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            &copy; {new Date().getFullYear()} BambooMall SCM Ltd. 
            <br />
            Licensed under Shenzhen Commerce Bureau. Reg: 9920-3382.
          </p>
        </div>

      </div>
    </div>
  );
}