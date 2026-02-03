//src>components>CertAwards.js

import React, { useState } from "react";
import {
  ShieldCheck,
  Award,
  CheckCircle,
  Fingerprint,
  Search,
  FileText,
  X
} from "lucide-react";

// --- Configuration ---

const badges = [
  { img: "/iso.png", label: "ISO 9001:2015", sub: "Quality Mgmt" },
  { img: "/verified.png", label: "Verified Exporter", sub: "CN-SZ-2024" },
  { img: "/security.png", label: "Cyber Security", sub: "Level 3 Safe" },
  { img: "/safety.png", label: "Global Trade", sub: "Certified" },
];

const certImgs = [
  { img: "/1.jpg", alt: "GLA Membership", id: "DOC-8892-GLA", issued: "2024.01.15" },
  { img: "/2.jpg", alt: "Env. Mgmt System", id: "DOC-1120-EMS", issued: "2023.11.30" },
  { img: "/3.jpg", alt: "Quality Approval", id: "DOC-4430-QMA", issued: "2024.02.10" }
];

export default function CertAwards() {
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <section className="w-full">
      
      {/* 1. COMPLIANCE LEDGER STRIP (The Dark Bar) */}
      <div className="relative overflow-hidden rounded-lg bg-slate-900 border border-slate-800 shadow-xl mb-10">
        {/* Background Tech Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Title Block */}
            <div className="p-6 md:w-1/5 flex flex-col justify-center bg-slate-950/50">
                <div className="flex items-center gap-2 text-emerald-500 mb-2">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Audited Status</span>
                </div>
                <h3 className="text-white font-serif text-lg leading-tight">Compliance<br/>Ledger</h3>
            </div>

            {/* Badges Flow */}
            <div className="flex-1 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {badges.map((badge, i) => (
                    <div key={i} className="flex flex-col items-center text-center group cursor-default">
                        {/* Hexagon/Circle Container */}
                        <div className="relative w-16 h-16 mb-3 transition-transform duration-300 group-hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full border border-slate-600 shadow-inner group-hover:border-amber-500/50 transition-colors"></div>
                            
                            {/* Fallback Icon if image fails */}
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 opacity-50">
                                <Award size={24} />
                            </div>

                            <img
                                src={badge.img}
                                alt={badge.label}
                                onError={(e) => e.currentTarget.style.display = 'none'} 
                                className="absolute inset-0 w-full h-full object-contain p-3 opacity-90 group-hover:opacity-100 z-10" 
                            />
                            
                            {/* Tiny Check Badge */}
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-slate-900 z-20">
                                <CheckCircle size={10} />
                            </div>
                        </div>
                        
                        <div className="space-y-0.5">
                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">
                                {badge.label}
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono">
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
          <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-2">
             <div className="flex items-baseline gap-3">
                 <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Fingerprint className="text-slate-400" size={16}/> Verification Assets
                 </h4>
                 <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-mono border border-slate-200">
                    PUBLIC ACCESS
                 </span>
             </div>
             <p className="text-[10px] text-slate-400 font-mono hidden md:block">
                SECURE DOCUMENT VIEWER // V.2.4
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certImgs.map((cert, idx) => (
                <div
                key={idx}
                onClick={() => setSelectedCert(cert)}
                className="group cursor-pointer bg-white rounded-sm border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-300"
                >
                    {/* Top Bar */}
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center group-hover:bg-blue-50/50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Award className="text-amber-600" size={14}/>
                            <span className="text-[10px] font-bold text-slate-700 uppercase">Original Scan</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 group-hover:text-blue-600">{cert.id}</span>
                    </div>

                    {/* Preview Area */}
                    <div className="w-full h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center p-4">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
                        
                        <FileText className="text-slate-300 absolute" size={48} />
                        
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
                            <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={8}/> Valid</span>
                        </div>
                    </div>
                </div>
            ))}
          </div>
      </div>

      {/* 3. THEATER MODE LIGHTBOX */}
      {selectedCert && (
        <div 
            className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200"
            onClick={() => setSelectedCert(null)}
        >
            <button 
                className="absolute top-6 right-6 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"
                onClick={() => setSelectedCert(null)}
            >
                <X size={20} />
            </button>
            
            <div className="flex flex-col items-center max-h-screen p-4">
                <div className="bg-white p-1 rounded shadow-2xl max-h-[85vh] overflow-hidden">
                    <img 
                        src={selectedCert.img} 
                        alt={selectedCert.alt}
                        className="max-h-[80vh] max-w-full object-contain"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
                <div className="mt-4 text-white font-mono text-sm tracking-widest">
                    {selectedCert.id} <span className="text-slate-500 mx-2">|</span> {selectedCert.alt}
                </div>
            </div>
        </div>
      )}

    </section>
  );
}