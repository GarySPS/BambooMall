//src>components>CertAwards.js

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Award,
  CheckCircle,
  Fingerprint,
  Search,
  FileText,
  X,
  RefreshCw // Loading Icon
} from "lucide-react";

// --- YOUR CONFIGURATION ---
const badges = [
  { img: "/iso.png", label: "ISO 9001:2015", sub: "Quality Mgmt" },
  { img: "/verified.png", label: "Verified Exporter", sub: "CN-SZ-2024" },
  { img: "/security.png", label: "Cyber Security", sub: "Level 3 Safe" },
  { img: "/safety.png", label: "Global Trade", sub: "Certified" },
];

const certImgs = [
  { img: "/1.jpg", alt: "GLA Membership", id: "DOC-8892-GLA", issued: "2024.01.15", type: "Membership" },
  { img: "/2.jpg", alt: "Env. Mgmt System", id: "DOC-1120-EMS", issued: "2023.11.30", type: "ISO 14001" },
  { img: "/3.jpg", alt: "Quality Approval", id: "DOC-4430-QMA", issued: "2024.02.10", type: "ISO 9001" }
];

export default function CertAwards() {
  const [selectedCert, setSelectedCert] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Simulate "Live Audit" Effect on Load (Only affects the status text, not images)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000); // 2 second delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full">
      
      {/* 1. COMPLIANCE LEDGER STRIP */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-xl mb-10">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Title Block */}
            <div className="p-6 md:w-1/5 flex flex-col justify-center bg-slate-950/50">
                <div className="flex items-center gap-2 mb-2">
                    {isVerifying ? (
                        <RefreshCw size={14} className="text-blue-400 animate-spin" />
                    ) : (
                        <ShieldCheck size={14} className="text-emerald-500" />
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isVerifying ? 'text-blue-400' : 'text-emerald-500'}`}>
                        {isVerifying ? "Verifying Nodes..." : "Audited Status"}
                    </span>
                </div>
                <h3 className="text-white font-serif text-lg leading-tight">Compliance<br/>Ledger</h3>
            </div>

            {/* Badges Flow - FIXED SIZE & REMOVED BACKGROUND */}
            <div className="flex-1 p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {badges.map((badge, i) => (
                    <div key={i} className="flex flex-col items-center text-center group cursor-default">
                        
                        {/* Large Badge Container - No Background */}
                        <div className="relative w-24 h-24 mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                            
                            {/* The Badge Image - No Loading Overlay */}
                            <img
                                src={badge.img}
                                alt={badge.label}
                                onError={(e) => e.currentTarget.style.display = 'none'} 
                                className="w-full h-full object-contain drop-shadow-2xl" 
                            />

                            {/* Success Tick (Only shows after verification) */}
                            {!isVerifying && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1.5 border-4 border-slate-900 z-20 animate-in zoom-in duration-300 shadow-lg">
                                    <CheckCircle size={14} />
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-1">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">
                                {badge.label}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                                {badge.sub}
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* 2. VERIFICATION ASSETS (The Grid) */}
      <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 border-b border-slate-200 pb-2 gap-2">
             <div className="flex items-baseline gap-3">
                 <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Fingerprint className="text-slate-400" size={16}/> Verification Assets
                 </h4>
                 <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono border border-slate-200">
                    PUBLIC ACCESS
                 </span>
             </div>
             <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                SECURE DOCUMENT VIEWER // V.2.4
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certImgs.map((cert, idx) => (
                <div
                key={idx}
                onClick={() => setSelectedCert(cert)}
                className="group cursor-pointer bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-300"
                >
                    {/* Top Bar */}
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center group-hover:bg-blue-50/50 transition-colors rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <Award className="text-amber-600" size={14}/>
                            <span className="text-[10px] font-bold text-slate-700 uppercase">Original Scan</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 group-hover:text-blue-600">{cert.id}</span>
                    </div>

                    {/* Preview Area */}
                    <div className="w-full h-56 bg-slate-100 relative overflow-hidden flex items-center justify-center p-6">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
                        
                        {/* Fallback Icon if image missing */}
                        <FileText className="text-slate-300 absolute" size={48} />
                        
                        {/* Image */}
                        <img
                            src={cert.img}
                            alt={cert.alt}
                            onError={(e) => e.currentTarget.style.opacity = '0'} 
                            className="h-full w-auto object-contain shadow-md transition-transform duration-500 group-hover:scale-105 relative z-10"
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center z-20">
                             <div className="bg-white/90 backdrop-blur text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                                <Search size={12}/> INSPECT
                             </div>
                        </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-3">
                        <div className="text-xs font-bold text-slate-800 truncate mb-1">{cert.alt}</div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>Issued: {cert.issued}</span>
                            <span className={`flex items-center gap-1 ${isVerifying ? 'text-slate-400' : 'text-emerald-600'}`}>
                                {isVerifying ? <RefreshCw size={8} className="animate-spin"/> : <CheckCircle size={8}/>}
                                {isVerifying ? "Verifying..." : "Valid"}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
          </div>
      </div>

      {/* 3. LIGHTBOX (Theater Mode) */}
      {selectedCert && (
        <div 
            className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
            onClick={() => setSelectedCert(null)}
        >
            <button 
                className="absolute top-6 right-6 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"
                onClick={() => setSelectedCert(null)}
            >
                <X size={24} />
            </button>
            
            <div className="flex flex-col items-center max-h-screen p-4 w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white p-1 rounded shadow-2xl max-h-[85vh] overflow-hidden w-full flex justify-center bg-slate-100">
                    <img 
                        src={selectedCert.img} 
                        alt={selectedCert.alt}
                        className="max-h-[80vh] max-w-full object-contain"
                    />
                </div>
                <div className="mt-6 text-white font-mono text-sm tracking-widest flex items-center gap-4">
                    <span className="text-slate-500">DOC ID:</span> {selectedCert.id} 
                    <span className="text-slate-700">|</span> 
                    <span className="text-emerald-400">{selectedCert.type}</span>
                </div>
            </div>
        </div>
      )}

    </section>
  );
}