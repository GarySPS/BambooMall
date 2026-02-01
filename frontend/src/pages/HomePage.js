// src/pages/HomePage.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config"; // Import Config
import { 
  FaChartLine, 
  FaBoxOpen, 
  FaFileInvoiceDollar, 
  FaExclamationTriangle,
  FaArrowUp,
  FaGlobe,
  FaShip,
  FaWarehouse,
  FaSync
} from "react-icons/fa";

// --- UTILS: Fake Data Generator for "Live Feed" ---
const generateFakeTx = () => {
  const buyers = ["Logistics Au...", "NZ Import Gr...", "Shenzhen Exp...", "Global Resale...", "Tokyo Trading..."];
  const statuses = ["CLEARED", "PENDING", "PROCESSING"];
  const amounts = ["$142,000", "$89,500", "$12,400", "$420,000", "$55,200"];
  
  return {
    id: "TX-" + Math.floor(Math.random() * 9000 + 1000),
    buyer: buyers[Math.floor(Math.random() * buyers.length)],
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    timestamp: new Date().toLocaleTimeString()
  };
};

export default function HomePage() {
  const { user } = useUser();
  const [balance, setBalance] = useState(0);
  const [creditLimit, setCreditLimit] = useState(0); // New State
  const [tier, setTier] = useState("Standard");      // New State
  const [ticker, setTicker] = useState([
    { id: "TX-9902", buyer: "Logistics Au...", amount: "$142,000", status: "CLEARED" },
    { id: "TX-9903", buyer: "NZ Import Gr...", amount: "$89,500", status: "PENDING" },
    { id: "TX-9904", buyer: "Shenzhen Exp...", amount: "$420,000", status: "CLEARED" },
  ]);

  // 1. DATA STREAM: Fetch "Real" Financials from Backend
  useEffect(() => {
    const fetchFinancials = async () => {
      if (!user?.short_id) return;
      try {
        // We use the endpoint we created in 'users.js'
        const res = await fetch(`${API_BASE_URL}/users/profile?short_id=${user.short_id}`);
        const data = await res.json();
        
        if (data.wallet) {
           setBalance(data.wallet.balance || 0);
           setCreditLimit(data.wallet.credit_limit || 0); // This should show $50,000
           setTier(data.wallet.tier || "Standard");
        }
      } catch (err) {
        console.error("Financial Data Stream Interrupted");
      }
    };

    fetchFinancials();
  }, [user]);

  // 2. LIVE FEED SIMULATION: Add new fake transaction every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(prev => [generateFakeTx(), ...prev.slice(0, 4)]); // Keep last 5
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* 1. HEADER: Welcome & Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
             Procurement Terminal <span className="text-slate-400 font-light">/ Dashboard</span>
           </h1>
           <div className="flex items-center gap-3 mt-1 text-xs font-mono text-slate-500">
             <span>SESSION ID: {user?.short_id ? `AGT-${user.short_id}` : "GUEST"}</span>
             <span className="text-slate-300">|</span>
             <span>REGION: CN-SOUTH-1</span>
             <span className="text-slate-300">|</span>
             <span className="flex items-center gap-1">
                <FaSync className="animate-spin text-slate-300" size={8} />
                LIVE
             </span>
           </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
           <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs font-bold text-emerald-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              GATEWAY OPERATIONAL
           </div>
        </div>
      </div>

      {/* 2. KPIS: Financial Overview (Connected to Backend) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card A: Liquidity */}
        <div className="bg-white p-6 rounded shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded">
                 <FaFileInvoiceDollar size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Available Liquidity</span>
           </div>
           <div className="text-3xl font-bold text-slate-800 font-mono tracking-tight">
              {balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
           </div>
           <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <span className="text-emerald-500 font-bold flex items-center">
                 <FaArrowUp size={10} /> +0.0%
              </span>
              <span>vs last settlement cycle</span>
           </div>
        </div>

        {/* Card B: Credit Line (Real Data) */}
        <div className="bg-white p-6 rounded shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                 <FaChartLine size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pre-Approved Credit</span>
           </div>
           <div className="text-3xl font-bold text-slate-800 font-mono tracking-tight">
              {creditLimit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
           </div>
           <div className="mt-2 text-xs text-slate-500">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono uppercase font-bold">
                 {tier}
              </span>
           </div>
        </div>

        {/* Card C: Pending Actions */}
        <div className="bg-white p-6 rounded shadow-sm border border-amber-200 bg-amber-50/50">
           <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded">
                 <FaExclamationTriangle size={20} />
              </div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Compliance Alerts</span>
           </div>
           <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">
                 ⚠️ 2026 Export Tariff Update
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                 All fiat transfers (SWIFT) are now subject to a 15% pre-clearance holding period. Use Digital Settlement (USDC) for instant release.
              </p>
              <Link to="/compliance" className="text-xs font-bold text-blue-600 hover:underline block mt-2">
                 Read Policy Update →
              </Link>
           </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: The Manifest Feed & Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left Column: Live Manifests */}
         <div className="lg:col-span-2 bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                  <FaWarehouse /> Incoming Warehouse Lots
               </h3>
               <Link to="/products" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                  View Full Manifest →
               </Link>
            </div>
            
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-slate-500 font-mono text-xs uppercase">
                  <tr>
                     <th className="px-4 py-3">Batch ID</th>
                     <th className="px-4 py-3">Origin</th>
                     <th className="px-4 py-3">Category</th>
                     <th className="px-4 py-3">Grade</th>
                     <th className="px-4 py-3 text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                     <td className="px-4 py-3 font-mono text-blue-600 font-medium">CN-SZ-9920</td>
                     <td className="px-4 py-3 text-slate-600">Shenzhen, CN</td>
                     <td className="px-4 py-3">Consumer Electronics</td>
                     <td className="px-4 py-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">GRADE A</span></td>
                     <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600">LIVE</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                     <td className="px-4 py-3 font-mono text-blue-600 font-medium">VN-HCM-4402</td>
                     <td className="px-4 py-3 text-slate-600">Ho Chi Minh, VN</td>
                     <td className="px-4 py-3">Branded Sportswear</td>
                     <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">OVERSTOCK</span></td>
                     <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600">LIVE</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                     <td className="px-4 py-3 font-mono text-blue-600 font-medium">CN-YIWU-8821</td>
                     <td className="px-4 py-3 text-slate-600">Yiwu, CN</td>
                     <td className="px-4 py-3">Home Appliances</td>
                     <td className="px-4 py-3"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">GRADE B</span></td>
                     <td className="px-4 py-3 text-right text-xs font-bold text-slate-400">PROCESSING</td>
                  </tr>
               </tbody>
            </table>
         </div>

         {/* Right Column: Live Settlement Feed (AUTO SCROLLING) */}
         <div className="bg-white rounded shadow-sm border border-slate-200 flex flex-col h-[400px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
               <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
                  <FaGlobe /> Global Settlement Feed
               </h3>
            </div>
            <div className="flex-1 overflow-hidden relative">
               <div className="absolute inset-0 overflow-y-auto p-2 space-y-2 no-scrollbar">
                  {ticker.map((tx, i) => (
                     <div key={tx.id + i} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100 animate-slide-in-right">
                        <div>
                           <div className="text-xs font-bold text-slate-700">{tx.buyer}</div>
                           <div className="text-[10px] text-slate-400 font-mono">{tx.id}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-xs font-mono font-bold text-slate-800">{tx.amount}</div>
                           <div className={`text-[10px] font-bold ${tx.status === 'CLEARED' ? 'text-emerald-600' : 'text-amber-500'}`}>{tx.status}</div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            <div className="p-3 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-400 text-center flex justify-center items-center gap-2">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
               Real-time settlement data via BambooChain Nodes
            </div>
         </div>

      </div>

      {/* 4. FOOTER: Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
         <Link to="/products" className="bg-blue-900 hover:bg-blue-800 text-white p-4 rounded text-center transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            <FaBoxOpen className="mx-auto mb-2 text-xl" />
            <span className="text-sm font-bold">Browse Manifests</span>
         </Link>
         <Link to="/balance" className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded text-center transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            <FaFileInvoiceDollar className="mx-auto mb-2 text-xl" />
            <span className="text-sm font-bold">Manage Funds</span>
         </Link>
         <Link to="/compliance" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-4 rounded text-center transition-colors">
            <FaShip className="mx-auto mb-2 text-xl text-slate-400" />
            <span className="text-sm font-bold">Shipping Policy</span>
         </Link>
         <Link to="/profile" className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-4 rounded text-center transition-colors">
            <FaChartLine className="mx-auto mb-2 text-xl text-slate-400" />
            <span className="text-sm font-bold">Agent Profile</span>
         </Link>
      </div>

    </div>
  );
}