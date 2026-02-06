//src>components>GradingMatrix.js

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, ClipboardCheck, AlertCircle, RefreshCw 
} from "lucide-react";

// --- 1. THE DATA POOL (Expanded to 60+ Real B2B Assets) ---
const POOL_APLUS = [
    "iPhone 15 Pro Max (1TB) - Sealed Master Carton",
    "Samsung S24 Ultra - Titanium (Factory Unlocked)",
    "MacBook Pro 16 M3 Max - Silver (Retail Box)",
    "DJI Mavic 3 Pro Cine Premium Combo",
    "Sony A7R V Body - Zero Shutter Count",
    "NVIDIA RTX 4090 Founders Edition (Bulk)",
    "iPad Pro 12.9 (M2) - WiFi+Cellular (Sealed)",
    "Alienware x16 R1 - i9/4080 (New Old Stock)",
    "PS5 Pro Console - Digital Edition (CFI-2000)",
    "Apple Vision Pro (512GB) - US Spec",
    // --- NEW ITEMS ADDED BELOW ---
    "Samsung Galaxy Tab S9 FE - Mint (Sealed)",
    "MacBook Air M3 13-inch - Starlight (Master Carton)",
    "Google Pixel 9 Pro - Obsidian (Factory Unlocked)",
    "Sony WH-1000XM5 - Midnight Blue (Retail Sealed)",
    "iPad Air 13-inch (M2) - Space Gray (New)",
    "Lenovo ThinkPad X1 Carbon Gen 12 (New In Box)",
    "GoPro Hero 12 Black - Creator Edition (Sealed)",
    "Meta Quest 3 (512GB) - US Retail Packaging",
    "Microsoft Surface Laptop 6 - Platinum (Sealed)",
    "DJI Mini 4 Pro - Fly More Combo (New)"
];

const POOL_A = [
    "iPhone 14 Pro - Deep Purple (14-Day Return)",
    "Galaxy Z Fold 5 - Phantom Black (Open Box)",
    "Pixel 8 Pro - Bay Blue (Carrier Unlock)",
    "Surface Pro 9 - i7/16GB (Retail Demo Unit)",
    "MacBook Air M2 15-inch (Cycle Count < 5)",
    "Steam Deck OLED (1TB) - Repackaged",
    "Sony WH-1000XM5 - Silver (Pristine)",
    "Galaxy Tab S9 Ultra - WiFi (Open Box)",
    "Asus ROG Ally - Z1 Extreme (Customer Return)",
    "iPhone 13 Mini - Starlight (Grade A Stock)",
    // --- NEW ITEMS ADDED BELOW ---
    "iPhone 15 - Pink (14-Day Carrier Return)",
    "Samsung Galaxy Watch 6 Classic (Open Box)",
    "Dell XPS 13 Plus (Retail Demo - No Scratches)",
    "iPad Pro 11 (M4) - Silver (Repackaged)",
    "Steam Deck LCD (512GB) - Like New",
    "Canon EOS R6 Mark II (Body Only - <100 Shutter)",
    "Mac Studio M2 Max (Customer Return)",
    "Nothing Phone (2) - Dark Grey (Unlocked)",
    "Bose QuietComfort Ultra (Box Damaged)",
    "HP Spectre x360 14 (Open Box / No Manual)"
];

const POOL_B = [
    "ThinkPad X1 Carbon Gen 10 (Corp Lease Return)",
    "Dell Latitude 7420 - i5/16GB (Asset Tag Removed)",
    "iPhone 12 - Mixed Color Bulk Tray (85% Batt)",
    "HP EliteBook 840 G8 (Office Surplus)",
    "iPad Air 4 - Sky Blue (Unit Only/No Box)",
    "Galaxy S22 Ultra (Minor Screen Shadow)",
    "MacBook Pro 13 (M1) - Grade B (Scratches)",
    "Nintendo Switch V2 (Tablet Only - Bulk)",
    "Apple Watch S7 45mm Aluminum (Strap Missing)",
    "Bose QC45 Headphones (Refurbished Unit)",
    // --- NEW ITEMS ADDED BELOW ---
    "MacBook Pro 14 (M1 Pro) - Minor Chassis Dents",
    "iPhone 11 - Bulk Mix (80% Batt)",
    "Samsung S21 FE - Screen Burn (Minor)",
    "Dell Precision 5560 (Corp Lease - Sticker Residue)",
    "iPad 9th Gen - Silver (Unit Only)",
    "Sony PlayStation 5 (Disc) - Controller Drift",
    "Microsoft Surface Go 3 (Scratches on Back)",
    "Lenovo ThinkCentre M70q Tiny (No Power Brick)",
    "Garmin Fenix 6 Pro (Bezel Wear)",
    "Epson EcoTank ET-2800 (No Ink - Used)"
];

export default function GradingMatrix() {
  const [examples, setExamples] = useState({ aPlus: "", a: "", b: "" });
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Simulate "Live Database Lookup"
    const timer = setTimeout(() => {
        setExamples({
            aPlus: POOL_APLUS[Math.floor(Math.random() * POOL_APLUS.length)],
            a: POOL_A[Math.floor(Math.random() * POOL_A.length)],
            b: POOL_B[Math.floor(Math.random() * POOL_B.length)],
        });
        setIsScanning(false);
    }, 1200); // 1.2s delay for effect

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <ClipboardCheck size={16}/> Standardized Asset Matrix (2026)
            </h3>
            {isScanning && (
                <div className="flex items-center gap-2 text-[10px] text-blue-600 font-mono animate-pulse">
                    <RefreshCw size={12} className="animate-spin"/> SYNCING WAREHOUSE DB...
                </div>
            )}
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="text-xs text-slate-400 font-bold uppercase border-b border-slate-200 tracking-wider bg-slate-50/30">
                    <tr>
                        <th className="px-6 py-4">Grade Designation</th>
                        <th className="px-6 py-4">Cosmetic Condition</th>
                        <th className="px-6 py-4">Functional Status</th>
                        <th className="px-6 py-4">Packaging & Accessories</th>
                        <th className="px-6 py-4 text-right">Live Reference</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                    
                    {/* Grade A+ */}
                    <tr className="hover:bg-emerald-50/30 transition-colors group">
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 flex items-center justify-center bg-emerald-100 text-emerald-700 font-black rounded-lg text-sm shadow-sm border border-emerald-200">A+</span>
                                <div>
                                    <strong className="text-slate-900 block">Factory Overstock</strong>
                                    <span className="text-[10px] uppercase text-emerald-600 font-bold">Pristine</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-5">Flawless. No scratches, dents, or signs of usage.</td>
                        <td className="px-6 py-5">
                            <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs"><ShieldCheck size={12}/> 100% Functional</span>
                            <div className="text-xs text-slate-400 mt-1">Battery Health: 100%</div>
                        </td>
                        <td className="px-6 py-5 text-xs">Original Retail Box (Sealed) + Original Accessories</td>
                        <td className="px-6 py-5 text-right font-mono text-slate-900">
                            {isScanning ? <span className="text-slate-300 animate-pulse">Scanning...</span> : examples.aPlus}
                        </td>
                    </tr>

                    {/* Grade A */}
                    <tr className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-700 font-black rounded-lg text-sm shadow-sm border border-blue-200">A</span>
                                <div>
                                    <strong className="text-slate-900 block">Carrier Return / 14-Day</strong>
                                    <span className="text-[10px] uppercase text-blue-600 font-bold">Like New</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-5">Near mint. Micro-scratches visible only under bright light.</td>
                        <td className="px-6 py-5">
                            <span className="flex items-center gap-1.5 text-blue-600 font-bold text-xs"><ShieldCheck size={12}/> 100% Functional</span>
                            <div className="text-xs text-slate-400 mt-1">Battery Health: &gt;95%</div>
                        </td>
                        <td className="px-6 py-5 text-xs">Open Retail Box or High-Quality White Box</td>
                        <td className="px-6 py-5 text-right font-mono text-slate-900">
                            {isScanning ? <span className="text-slate-300 animate-pulse">Scanning...</span> : examples.a}
                        </td>
                    </tr>

                    {/* Grade B */}
                    <tr className="hover:bg-amber-50/30 transition-colors group">
                        <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 flex items-center justify-center bg-amber-100 text-amber-700 font-black rounded-lg text-sm shadow-sm border border-amber-200">B</span>
                                <div>
                                    <strong className="text-slate-900 block">Corporate Lease / Used</strong>
                                    <span className="text-[10px] uppercase text-amber-600 font-bold">Good</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-5">Visible wear. Light scratches on screen/body. No cracks.</td>
                        <td className="px-6 py-5">
                            <span className="flex items-center gap-1.5 text-slate-600 font-bold text-xs"><ShieldCheck size={12}/> 100% Functional</span>
                            <div className="text-xs text-slate-400 mt-1">Battery Health: &gt;80%</div>
                        </td>
                        <td className="px-6 py-5 text-xs">Generic Bulk Packaging (Bubble Bag)</td>
                        <td className="px-6 py-5 text-right font-mono text-slate-900">
                            {isScanning ? <span className="text-slate-300 animate-pulse">Scanning...</span> : examples.b}
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
        
        {/* Disclaimer Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <AlertCircle className="text-slate-400 shrink-0 mt-0.5" size={14}/>
            <p>
                <strong>Definition of DOA:</strong> "Dead on Arrival" includes devices that do not power on, have cracked screens (unless Grade C/D), or iCloud/FRP locks. 
                DOA claims must be filed within 72 hours of shipment receipt.
            </p>
        </div>
    </div>
  );
}