// src/components/RestrictedContent.js

import React from "react";
import { useUser } from "../contexts/UserContext";
import { FaLock, FaClock } from "react-icons/fa";

export default function RestrictedContent({ children }) {
  const { user } = useUser();

  if (user && user.kyc_status === 'approved') {
    return <>{children}</>;
  }

  const isPending = user && user.kyc_status === 'pending';

  return (
    <div className="relative min-h-[50vh] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      
      {/* BLURRED BACKGROUND */}
      <div className="filter blur-md opacity-30 pointer-events-none select-none h-full" aria-hidden="true">
        {children}
      </div>

      {/* CLEAN MINIMAL OVERLAY (Replaced the bulky card) */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md p-5 rounded-full shadow-sm mb-4 border border-slate-100">
          {isPending ? <FaClock size={32} className="text-amber-500 animate-pulse"/> : <FaLock size={32} className="text-slate-400" />}
        </div>
        
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest">
           {isPending ? "Audit in Progress" : "Ledger Locked"}
        </h2>
        
        <p className="text-slate-500 text-sm mt-2 font-mono text-center">
           {isPending 
             ? "Awaiting compliance approval." 
             : "Complete identity verification above to view."}
        </p>
      </div>
      
    </div>
  );
}