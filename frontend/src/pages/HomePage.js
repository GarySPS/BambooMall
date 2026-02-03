import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import { 
  LineChart, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  ArrowUp, 
  Globe, 
  Warehouse, 
  Clock, 
  ChevronRight,
  ShoppingCart,
  CreditCard,
  FileText
} from "lucide-react";

// --- UTILS: Fake Data Generator ---
const generateFakeTx = () => {
  const buyers = ["Logistics Au...", "NZ Import Gr...", "Shenzhen Exp...", "Global Resale...", "Tokyo Trading...", "Euro Biz Ltd..."];
  const statuses = ["CLEARED", "PENDING", "PROCESSING"];
  const amounts = ["$142,000", "$89,500", "$12,400", "$420,000", "$55,200", "$1,205,000"];
  
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
  const [creditLimit, setCreditLimit] = useState(0);
  const [tier, setTier] = useState("Standard");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [ticker, setTicker] = useState([
    { id: "TX-9902", buyer: "Logistics Au...", amount: "$142,000", status: "CLEARED", timestamp: "10:00:01 AM" },
    { id: "TX-9903", buyer: "NZ Import Gr...", amount: "$89,500", status: "PENDING", timestamp: "10:00:05 AM" },
    { id: "TX-9904", buyer: "Shenzhen Exp...", amount: "$420,000", status: "CLEARED", timestamp: "10:01:20 AM" },
    { id: "TX-9905", buyer: "US Retail Co...", amount: "$12,500", status: "PROCESSING", timestamp: "10:02:15 AM" },
  ]);

  useEffect(() => {
    const fetchFinancials = async () => {
      if (!user?.short_id) return;
      try {
        const res = await fetch(`${API_BASE_URL}/users/profile?short_id=${user.short_id}`);
        const data = await res.json();
        
        if (data.wallet) {
           setBalance(data.wallet.balance || 0);
           setCreditLimit(data.wallet.credit_limit || 0);
           setTier(data.wallet.tier || "Standard");
        }
      } catch (err) {
        console.error("Financial Data Stream Interrupted");
      }
    };
    fetchFinancials();
  }, [user]);

  useEffect(() => {
    const txInterval = setInterval(() => {
      setTicker(prev => [generateFakeTx(), ...prev.slice(0, 8)]); 
    }, 3500);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(txInterval);
      clearInterval(clockInterval);
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12 w-full">
      
      {/* --- HEADER --- */}
      {/* lg:pb-8 adds more space below header on desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-800 pb-4 lg:pb-6">
        <div>
           {/* lg:text-4xl makes the title much bigger on desktop */}
           <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
             Procurement Console
           </h1>
           <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs lg:text-sm font-mono font-medium text-slate-500">
             <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
        <div className="mt-4 md:mt-0 flex items-center gap-2">
           <Link 
             to="/products"
             className="text-sm lg:text-base font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
           >
              Browse Master Manifest <ChevronRight className="group-hover:translate-x-1 transition-transform" size={16} />
           </Link>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      {/* lg:gap-6 increases gap between cards on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Card A: Liquidity */}
        {/* lg:p-8 makes the card feel roomier on desktop */}
        <div className="bg-white p-5 lg:p-8 rounded-lg shadow-sm border border-slate-200 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110"></div>
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-2 lg:mb-4">
               {/* lg:text-xs makes label readable */}
               <span className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">Available Liquidity</span>
               <DollarSign className="text-blue-500" size={24} />
             </div>
             {/* lg:text-4xl makes the money HUGE on desktop */}
             <div className="text-2xl lg:text-4xl font-bold text-slate-900 font-mono tracking-tight">
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
        <div className="bg-white p-5 lg:p-8 rounded-lg shadow-sm border border-slate-200 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110"></div>
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-2 lg:mb-4">
               <span className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">Approved Credit</span>
               <LineChart className="text-indigo-500" size={24} />
             </div>
             <div className="text-2xl lg:text-4xl font-bold text-slate-900 font-mono tracking-tight">
               {creditLimit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
             </div>
             <div className="mt-2 lg:mt-3 text-[10px] lg:text-sm text-slate-400">
               LEVEL: <span className="font-bold text-indigo-700">{tier.toUpperCase()}</span>
             </div>
           </div>
        </div>

        {/* Card C: Compliance */}
        <div className="bg-amber-50 p-5 lg:p-8 rounded-lg shadow-sm border border-amber-200 relative overflow-hidden sm:col-span-2 lg:col-span-2">
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
                    {/* lg:text-base makes body text readable */}
                    <p className="text-xs lg:text-base text-slate-600 mt-1 lg:mt-2 max-w-lg leading-relaxed">
                        All fiat transfers (SWIFT) are now subject to a 15% pre-clearance holding period. Use USDC for instant release.
                    </p>
                </div>
                <Link to="/compliance" className="text-xs lg:text-sm font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-4 py-3 rounded transition-colors whitespace-nowrap">
                   Review Action Items →
                </Link>
             </div>
           </div>
        </div>
      </div>

      {/* --- MAIN DASHBOARD SPLIT --- */}
      {/* lg:gap-8 puts more space between the Table and the Ticker */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8 min-h-[500px]">
         
         {/* LEFT: MANIFEST FEED */}
         <div className="xl:col-span-3 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
            <div className="px-5 py-4 lg:px-6 lg:py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border border-slate-200 rounded shadow-sm text-blue-600">
                     <Warehouse size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm lg:text-base uppercase tracking-wide">Inbound Manifests</h3>
                    <p className="text-[10px] lg:text-xs text-slate-400 font-mono">REAL-TIME INVENTORY STREAM</p>
                  </div>
               </div>
               <Link to="/products" className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  View Full Manifest
               </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
               <table className="w-full text-left text-sm lg:text-base whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] lg:text-xs uppercase tracking-wider border-b border-slate-200">
                     <tr>
                        <th className="px-5 py-3 lg:px-6 lg:py-4">Batch ID</th>
                        <th className="px-5 py-3 lg:px-6 lg:py-4">Origin / Port</th>
                        <th className="px-5 py-3 lg:px-6 lg:py-4">Category</th>
                        <th className="px-5 py-3 lg:px-6 lg:py-4">Est. Value</th>
                        <th className="px-5 py-3 lg:px-6 lg:py-4">Grade</th>
                        <th className="px-5 py-3 lg:px-6 lg:py-4 text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {[
                       {id: "CN-SZ-9920", origin: "Shenzhen, CN", cat: "Consumer Electronics", val: "$45,200", grade: "A", status: "LIVE"},
                       {id: "VN-HCM-4402", origin: "Ho Chi Minh, VN", cat: "Branded Sportswear", val: "$12,800", grade: "OVERSTOCK", status: "LIVE"},
                       {id: "CN-YIWU-8821", origin: "Yiwu, CN", cat: "Home Appliances", val: "$8,500", grade: "B", status: "PROCESSING"},
                       {id: "JP-TOK-1102", origin: "Tokyo, JP", cat: "Gaming Consoles", val: "$125,000", grade: "A+", status: "PENDING"},
                       {id: "KR-BUS-3391", origin: "Busan, KR", cat: "Cosmetics Lot", val: "$32,100", grade: "A", status: "LIVE"},
                       {id: "US-LA-1029", origin: "Los Angeles, US", cat: "Vintage Apparel", val: "$18,500", grade: "B+", status: "LIVE"}, // Added extra row for desktop fullness
                     ].map((item, i) => (
                       <tr key={i} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                          <td className="px-5 py-3 lg:px-6 lg:py-5 font-mono text-blue-600 font-bold group-hover:underline">{item.id}</td>
                          <td className="px-5 py-3 lg:px-6 lg:py-5 text-slate-600 font-medium">
                            <div className="flex flex-col">
                               <span>{item.origin}</span>
                               <span className="text-[9px] lg:text-[10px] text-slate-400 font-mono">PORT: T-{Math.floor(Math.random()*10)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 lg:px-6 lg:py-5 text-slate-700 font-medium">{item.cat}</td>
                          <td className="px-5 py-3 lg:px-6 lg:py-5 font-mono text-slate-600">{item.val}</td>
                          <td className="px-5 py-3 lg:px-6 lg:py-5">
                             <span className={`px-2 py-0.5 lg:px-3 lg:py-1 rounded text-[10px] lg:text-xs font-bold border ${
                               item.grade.includes('A') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                               item.grade === 'OVERSTOCK' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                               'bg-amber-50 text-amber-700 border-amber-100'
                             }`}>
                               {item.grade}
                             </span>
                          </td>
                          <td className="px-5 py-3 lg:px-6 lg:py-5 text-right">
                             <span className={`text-[10px] lg:text-xs font-bold flex items-center justify-end gap-1 ${
                               item.status === 'LIVE' ? 'text-emerald-600' : 'text-slate-400'
                             }`}>
                               {item.status === 'LIVE' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                               {item.status}
                             </span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* RIGHT: DARK MODE TICKER (Global Feed) */}
         <div className="xl:col-span-1 flex flex-col gap-4">
             {/* lg:min-h-[600px] makes the ticker taller on desktop */}
             <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-700 overflow-hidden flex flex-col h-full min-h-[400px] lg:min-h-[500px]">
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                   <h3 className="font-bold text-white text-xs lg:text-sm uppercase tracking-widest flex items-center gap-2">
                      <Globe className="text-blue-500" size={16} /> Global Feed
                   </h3>
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                </div>
                
                <div className="flex-1 relative overflow-hidden bg-slate-900">
                   <div className="absolute inset-0 overflow-y-auto no-scrollbar p-3 space-y-3">
                      {ticker.map((tx, i) => (
                         <div key={tx.id + i} className="p-3 lg:p-4 bg-slate-800/50 rounded border border-slate-700/50 animate-fade-in hover:bg-slate-800 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                               <span className="text-[10px] lg:text-xs text-slate-400 font-mono">{tx.timestamp}</span>
                               <span className={`text-[9px] lg:text-[10px] font-bold px-1.5 rounded ${
                                  tx.status === 'CLEARED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                               }`}>{tx.status}</span>
                            </div>
                            <div className="flex justify-between items-end mt-1">
                               <div>
                                  <div className="text-xs lg:text-sm font-bold text-slate-200">{tx.buyer}</div>
                                  <div className="text-[10px] lg:text-xs text-slate-500 font-mono">{tx.id}</div>
                               </div>
                               <div className="text-sm lg:text-base font-mono font-bold text-white">{tx.amount}</div>
                            </div>
                         </div>
                      ))}
                   </div>
                   <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
                </div>
             </div>
         </div>

      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 pt-4">
         
         {/* 1. Browse Manifests - SOLID BLUE */}
         <Link to="/products" className="bg-blue-700 hover:bg-blue-600 text-white p-4 lg:p-6 rounded-lg flex flex-col items-center justify-center gap-2 text-center shadow-lg shadow-blue-900/20 transform hover:-translate-y-1 transition-all">
            <Package className="text-3xl lg:text-4xl text-blue-100" />
            <span className="text-sm lg:text-base font-bold uppercase tracking-wide">Browse Manifests</span>
         </Link>

         {/* 2. Add Funds - SOLID EMERALD */}
         <Link to="/balance" className="bg-emerald-700 hover:bg-emerald-600 text-white p-4 lg:p-6 rounded-lg flex flex-col items-center justify-center gap-2 text-center shadow-lg shadow-emerald-900/20 transform hover:-translate-y-1 transition-all">
            <DollarSign className="text-3xl lg:text-4xl text-emerald-100" />
            <span className="text-sm lg:text-base font-bold uppercase tracking-wide">Add Funds</span>
         </Link>

         {/* 3. Secondary Actions - White Cards */}
         <Link to="/compliance" className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 p-4 lg:p-6 rounded-lg flex flex-col items-center justify-center gap-2 text-center transition-all">
            <FileText className="text-3xl lg:text-4xl text-slate-400" />
            <span className="text-sm lg:text-base font-bold uppercase tracking-wide">Shipping Policy</span>
         </Link>

         <Link to="/profile" className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 p-4 lg:p-6 rounded-lg flex flex-col items-center justify-center gap-2 text-center transition-all">
            <LineChart className="text-3xl lg:text-4xl text-slate-400" />
            <span className="text-sm lg:text-base font-bold uppercase tracking-wide">My Stats</span>
         </Link>
      </div>

    </div>
  );
}