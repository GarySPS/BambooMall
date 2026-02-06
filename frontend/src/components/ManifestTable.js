import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Warehouse, ArrowUp, Activity } from "lucide-react";

// --- EXPANDED DATA SETS (Preserved from your snippet) ---
const CATEGORIES = [
  "Consumer Electronics", "Branded Sportswear", "Home Appliances", "Gaming Consoles", 
  "Cosmetics Lot", "Vintage Apparel", "Auto Parts", "Lithium Batteries", 
  "Raw Silk", "Medical Devices", "Smart Home IoT", "Luxury Handbags",
  "Industrial Graphene", "Surgical Robots", "Rare Earth Metals", "Server Racks", 
  "Agri-Drones", "Solar Panels", "Fine Art Logistics", "Precision Optics",
  "Aerospace Titanium", "Quantum Processors", "Bio-Synthetic Fabric", "Solid State Drives", 
  "Heavy Construction Rigs", "Pharma Cold Chain", "Deep Sea Drilling Gear", 
  "Fiber Optic Cabling", "Recycled Ocean Plastic", "Electric Vehicle Chassis", 
  "Nano-Carbon Filters", "Hydraulic Press Units", "Avionics Modules", 
  "High-Speed Rail Parts", "Cryptomining ASICs", "Lab Centrifuges", 
  "Marine Propulsion", "Tactical Gear Surplus", "Drone Swarm Controllers", 
  "Holographic Displays", "Semiconductor Wafers", "LNG Storage Valves"
];

const ORIGINS = [
  { id: "CN-SZ", city: "Shenzhen, CN", ports: ["T-5", "T-9", "X-2"] },
  { id: "VN-HCM", city: "Ho Chi Minh, VN", ports: ["T-2", "A-1"] },
  { id: "CN-YIWU", city: "Yiwu, CN", ports: ["T-4", "Z-8"] },
  { id: "JP-TOK", city: "Tokyo, JP", ports: ["T-3", "J-5"] },
  { id: "KR-BUS", city: "Busan, KR", ports: ["T-6", "K-9"] },
  { id: "US-LA", city: "Los Angeles, US", ports: ["T-9", "L-1"] },
  { id: "DE-HAM", city: "Hamburg, DE", ports: ["E-4", "H-2"] },
  { id: "SG-SIN", city: "Singapore, SG", ports: ["S-1", "S-9"] },
  { id: "IN-MUM", city: "Mumbai, IN", ports: ["M-2", "M-5"] },
  { id: "AE-DXB", city: "Dubai, UAE", ports: ["D-1", "D-8"] },
  { id: "NL-ROT", city: "Rotterdam, NL", ports: ["R-3", "R-9"] },
  { id: "GB-FXT", city: "Felixstowe, UK", ports: ["F-1", "F-4"] },
  { id: "BE-ANT", city: "Antwerp, BE", ports: ["A-7", "A-9"] },
  { id: "BR-SSZ", city: "Santos, BR", ports: ["S-2", "S-5"] },
  { id: "MY-PKG", city: "Port Klang, MY", ports: ["P-3", "P-8"] },
  { id: "AU-SYD", city: "Sydney, AU", ports: ["Y-1", "Y-6"] }
];

// Helper to generate ONE random item
const generateSingleItem = (isNew = false) => {
  const origin = ORIGINS[Math.floor(Math.random() * ORIGINS.length)];
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const value = Math.floor(Math.random() * 150000) + 5000;
  const port = origin.ports[Math.floor(Math.random() * origin.ports.length)];
  const randomSuffix = Math.floor(Math.random() * 8999) + 1000;

  return {
    id: Date.now() + Math.random(), // Unique React Key
    batchId: `${origin.id}-${randomSuffix}`,
    origin: origin.city,
    port: port,
    category: category,
    value: value,
    grade: Math.random() > 0.7 ? "A+" : Math.random() > 0.4 ? "A" : "B",
    status: isNew ? "NEW ARRIVAL" : (Math.random() > 0.8 ? "PENDING" : "LIVE"),
    trend: Math.random() > 0.5 ? 1 : -1,
    isNew: isNew // Flag for animation
  };
};

// Initial Bulk Generator (60 items to keep buffer large)
const generateInitialData = (count = 60) => {
  return Array.from({ length: count }).map(() => generateSingleItem());
};

export default function ManifestTable() {
  const [manifests, setManifests] = useState([]);
  const [isLive, setIsLive] = useState(true); // Toggle for stream
  
  // Removed scrollRef since we are hiding scrollbar

  // 1. Initialize Data
  useEffect(() => {
    setManifests(generateInitialData(60));
  }, []);

  // 2. SIMULATE MARKET ACTIVITY (The "Pulse")
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setManifests(current => {
        // Clone array
        let next = [...current];

        // A. REMOVE OLD: Randomly remove an item from the bottom half (Simulate "Sold Out")
        if (next.length > 50) {
           next.pop(); 
        }

        // B. ADD NEW: Add a new "Incoming" shipment to the top
        const newItem = generateSingleItem(true);
        next.unshift(newItem);

        // C. UPDATE STATUS: Randomly flip a "LIVE" item to "RESERVED"
        const randomIndex = Math.floor(Math.random() * 7); // Focus on top 7 visible items
        if (next[randomIndex] && next[randomIndex].status === 'LIVE') {
           next[randomIndex] = { ...next[randomIndex], status: "RESERVED" };
        }

        return next;
      });
    }, 2500); // New batch every 2.5 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  // 3. FAST PRICE TICKER (Flicker effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setManifests(prev => {
        const next = [...prev];
        // Update 3 random rows within the top 7
        for(let i=0; i<3; i++){
            const idx = Math.floor(Math.random() * 7); // Focus on visible rows
            if(next[idx]) {
                const change = (Math.random() * 600 - 300); 
                next[idx].value = Math.max(1000, next[idx].value + change);
                next[idx].trend = change > 0 ? 1 : -1;
            }
        }
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    // [UPDATE 1] Fixed height + Overflow Hidden (Removes Scrollbar)
    <div className="xl:col-span-3 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col min-h-[420px] overflow-hidden">
      
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur z-10 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-slate-200 rounded shadow-sm text-blue-600">
            <Warehouse size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm lg:text-base uppercase tracking-wide flex items-center gap-2">
              Inbound Manifests 
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full">
                 {manifests.length} ACTIVE
              </span>
            </h3>
            <div className="flex items-center gap-2 text-[10px] lg:text-xs font-mono mt-0.5">
               <span className={`flex items-center gap-1 ${isLive ? "text-emerald-600" : "text-slate-400"}`}>
                  <Activity size={12} className={isLive ? "animate-pulse" : ""} />
                  {isLive ? "LIVE MARKET STREAM" : "STREAM PAUSED"}
               </span>
               <span className="text-slate-300">|</span>
               <span className="text-slate-500">TICK: 2.5s</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
             onClick={() => setIsLive(!isLive)}
             className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${
                isLive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"
             }`}
          >
             {isLive ? "Pause Stream" : "Resume"}
          </button>
          <Link to="/products" className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-bold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors shadow-sm">
            View Full Manifest
          </Link>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 relative bg-white">
        <table className="w-full text-left text-sm lg:text-base whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] lg:text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Batch ID</th>
              <th className="px-5 py-3">Origin / Port</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Est. Value</th>
              <th className="px-5 py-3">Grade</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/* [UPDATE 2] SLICE TO 7 ITEMS */}
            {manifests.slice(0, 7).map((item) => (
              <tr 
                key={item.id} 
                className={`transition-colors duration-500 ${
                    item.isNew ? "bg-emerald-50/60" : "hover:bg-blue-50/40"
                }`}
              >
                <td className="px-5 py-3 font-mono text-blue-600 font-bold text-xs lg:text-sm">
                  <div className="flex items-center gap-2">
                     {item.batchId}
                     {item.isNew && <span className="text-[9px] bg-emerald-500 text-white px-1 rounded animate-pulse">NEW</span>}
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600 font-medium">
                  <div className="flex flex-col">
                    <span className="text-xs lg:text-sm">{item.origin}</span>
                    <span className="text-[9px] lg:text-[10px] text-slate-400 font-mono">PORT: {item.port}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-700 font-medium text-xs lg:text-sm">{item.category}</td>
                <td className="px-5 py-3 font-mono text-slate-700 font-medium">
                  <div className="flex items-center gap-1">
                    {item.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).split('.')[0]}
                    {item.trend > 0 ? <ArrowUp size={10} className="text-emerald-500" /> : <ArrowUp size={10} className="text-rose-500 rotate-180" />}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    item.grade.includes('A') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                    item.grade === 'B' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {item.grade}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={`text-[10px] font-bold flex items-center justify-end gap-1.5 ${
                    item.status === 'LIVE' || item.status === 'NEW ARRIVAL' ? 'text-emerald-600' : 
                    item.status === 'RESERVED' ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    {(item.status === 'LIVE' || item.status === 'NEW ARRIVAL') && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* [UPDATE 3] Subtle Fade at bottom to imply "stream continues" */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}