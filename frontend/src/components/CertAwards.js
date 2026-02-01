// src/components/CertAwards.js

import React, { useState } from "react";
import { FaSearchPlus, FaTimes } from "react-icons/fa";

// Main badge medals
const badges = [
  { img: "/iso.png", label: "ISO 9001:2015" },
  { img: "/verified.png", label: "Verified Exporter" },
  { img: "/security.png", label: "Cyber Security" },
  { img: "/safety.png", label: "Global Trade" },
];

// Real certificate images
const certImgs = [
  { img: "/1.jpg", alt: "GLA Membership Certificate" },
  { img: "/2.jpg", alt: "Environmental Management System" },
  { img: "/3.jpg", alt: "Quality Management Approval" }
];

export default function CertAwards() {
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <section className="w-full">
      
      {/* 1. BADGES ROW */}
      <div className="grid grid-cols-4 gap-4 mb-12 border-b border-slate-800 pb-8">
        {badges.map((badge, i) => (
          <div key={i} className="flex flex-col items-center group">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center p-2 rounded-full bg-slate-900 border border-slate-800 group-hover:border-emerald-900/50 group-hover:bg-emerald-900/10 transition-all duration-300">
                <img
                    src={badge.img}
                    alt={badge.label}
                    className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                />
            </div>
            <div className="text-[9px] text-center text-slate-500 uppercase font-bold mt-3 tracking-wide group-hover:text-slate-300">
              {badge.label}
            </div>
          </div>
        ))}
      </div>

      {/* 2. CERTIFICATES GRID */}
      <div>
          <div className="flex justify-between items-end mb-4">
             <h4 className="text-xs font-bold text-white uppercase tracking-widest">
                Verification Documents
             </h4>
             <span className="text-[10px] text-slate-500 italic">Click to Inspect</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {certImgs.map((cert, idx) => (
                <div
                key={idx}
                onClick={() => setSelectedCert(cert)}
                className="relative group cursor-zoom-in bg-slate-900 p-2 rounded border border-slate-700 hover:border-blue-500 transition-colors"
                >
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
                    <FaSearchPlus className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" size={24} />
                </div>
                
                <img
                    src={cert.img}
                    alt={cert.alt}
                    className="w-full h-48 object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="mt-2 text-[10px] text-center text-slate-400 font-mono truncate px-2">
                    {cert.alt}
                </div>
                </div>
            ))}
          </div>
      </div>

      <div className="text-[9px] text-slate-600 text-center mt-6 font-mono">
         * Authenticity verified by CNCAS (China National Accreditation Service). Last Audit: JAN 2026.
      </div>

      {/* 3. INSPECTION MODAL */}
      {selectedCert && (
        <div 
            className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in"
            onClick={() => setSelectedCert(null)}
        >
            <button 
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                onClick={() => setSelectedCert(null)}
            >
                <FaTimes size={32} />
            </button>
            
            <div 
                className="relative max-w-4xl w-full max-h-full overflow-auto rounded shadow-2xl bg-white"
                onClick={e => e.stopPropagation()} // Prevent close when clicking image
            >
                <img 
                    src={selectedCert.img} 
                    alt={selectedCert.alt} 
                    className="w-full h-auto block"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs font-mono py-2 text-center">
                    DOCUMENT PREVIEW // {selectedCert.alt.toUpperCase()}
                </div>
            </div>
        </div>
      )}

    </section>
  );
}