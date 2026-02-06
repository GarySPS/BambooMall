// src/components/GlobalFeed.js
import React, { useState, useEffect, useRef } from "react";
import { Globe, ShieldCheck, Clock, Activity } from "lucide-react";

// --- EXPANDED DATASET (50+ GLOBAL BUYERS) ---
const BUYERS = [
  "Tokyo Trading Corp", "Shenzhen Electronics", "Global Resale Ltd", "Nordic Supply Chain", 
  "Alpha Freight Systems", "Euro Biz Solutions", "Logistics Au", "NZ Import Group", 
  "Mumbai Tech Traders", "Dubai Port Authority", "Hamburg Logistics", "Seoul Semi-Conductor",
  "Singapore Shipping", "Rotterdam Cold Chain", "US Retail Giants", "Canadian Maple Imports",
  "Brasilia Agro-Tech", "Sydney Freight Forwarders", "Cape Town Minerals", "London Fin-Tech",
  "Paris Luxury Goods", "Milan Fashion Exports", "Berlin Auto Parts", "Moscow Energy Grid",
  "Beijing Data Systems", "Jakarta Palm Oil", "Bangkok Rice Traders", "Hanoi Textile Co",
  "Manila Outsourcing", "Taipei Chip Foundry", "Riyadh Oil & Gas", "Tel Aviv Cyber-Sec",
  "Istanbul Bazaar Ltd", "Athens Shipping Magnates", "Cairo Cotton Exchange", "Lagos Oil Works",
  "Nairobi Tea Exports", "Casablanca Spices", "Lisbon Cork Supply", "Madrid Solar Energy",
  "Dublin Pharma Group", "Oslo Marine Harvest", "Stockholm Design House", "Helsinki Nokia Legacy",
  "Warsaw Heavy Industry", "Prague Crystal Works", "Vienna Steel Corp", "Zurich Bank Vaults",
  "Geneva Watchmakers", "Brussels Diamond Exchange", "Amsterdam Flower Market"
];

const STATUSES = ["CLEARED", "PENDING", "PROCESSING", "VERIFYING"];

const generateTx = () => {
  return {
    id: "TX-" + Math.floor(Math.random() * 90000 + 10000),
    buyer: BUYERS[Math.floor(Math.random() * BUYERS.length)],
    amount: (Math.floor(Math.random() * 500) * 1000 + 12500).toLocaleString('en-US', { style: 'currency', currency: 'USD' }).split('.')[0],
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
  };
};

export default function GlobalFeed() {
  // Initialize with 30 items so the list is full immediately
  const [transactions, setTransactions] = useState(() => 
    Array.from({ length: 30 }).map(generateTx)
  );

  const scrollRef = useRef(null);

  // LIVE FEED SIMULATION
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions(prev => {
        const next = [generateTx(), ...prev];
        if (next.length > 50) next.pop(); 
        return next;
      });
    }, 3500); 

    return () => clearInterval(interval);
  }, []);

  return (
    // [UPDATE 1] Changed 'h-full min-h-[500px]' to 'h-fit' so it wraps the 5 items exactly
    <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-700 overflow-hidden flex flex-col h-fit">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center shadow-md z-10">
        <div>
          <h3 className="font-bold text-white text-xs lg:text-sm uppercase tracking-widest flex items-center gap-2">
            <Globe className="text-blue-500" size={16} /> Global Feed
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
             <span className="text-[10px] text-slate-400 font-mono">LIVE NETWORK</span>
          </div>
        </div>
        <div className="text-right">
           <div className="text-[10px] text-slate-500 font-mono">TX/MIN</div>
           <div className="text-lg font-mono font-bold text-blue-400 leading-none">24</div>
        </div>
      </div>

      {/* FEED LIST */}
      <div className="relative bg-slate-900">
        <div className="p-3 space-y-3">
          {/* [UPDATE 2] Limit to exactly 5 items */}
          {transactions.slice(0, 5).map((tx, i) => (
            <div 
              key={tx.id + i} 
              className="p-3 bg-slate-800/40 rounded border border-slate-700/50 animate-fade-in hover:bg-slate-800 hover:border-slate-600 transition-all group"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] text-slate-500 font-mono group-hover:text-slate-300 transition-colors">
                    {tx.timestamp}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  tx.status === 'CLEARED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {tx.status}
                </span>
              </div>
              
              <div className="flex justify-between items-end mt-2">
                <div>
                  <div className="text-xs font-bold text-slate-300 group-hover:text-white truncate max-w-[120px]">
                      {tx.buyer}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                      <ShieldCheck size={10} /> {tx.id}
                  </div>
                </div>
                <div className="text-sm font-mono font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {tx.amount}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Removed Fade Overlay since we are showing full list of 5 without scroll */}
      </div>
    </div>
  );
}