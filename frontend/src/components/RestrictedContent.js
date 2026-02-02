// src/components/RestrictedContent.js

import React from "react";
import { useUser } from "../contexts/UserContext";
import { Link } from "react-router-dom";
import { FaLock, FaIdCard, FaClock } from "react-icons/fa"; // Added FaClock for 'pending' state

export default function RestrictedContent({ children }) {
  const { user } = useUser();

  // --- LOGIC FIX ---
  // 1. "Approved" = Can see content
  // We strictly check kyc_status. Being email 'verified' is not enough for products.
  if (user && user.kyc_status === 'approved') {
    return <>{children}</>;
  }

  // 2. Determine State for the Card (Pending vs Unverified)
  const isPending = user && user.kyc_status === 'pending';

  return (
    <div className="relative min-h-[60vh] w-full overflow-hidden rounded-lg bg-slate-50">
      
      {/* BLURRED BACKGROUND */}
      <div className="filter blur-lg opacity-40 pointer-events-none select-none h-full" aria-hidden="true">
        {children}
      </div>

      {/* OVERLAY CARD */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-2xl rounded max-w-md w-full text-center p-8 md:p-10 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-900"></div>

          {/* ICON CHANGE BASED ON STATUS */}
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
             {isPending ? <FaClock size={24} className="text-amber-600"/> : <FaLock size={24} />}
          </div>

          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest mb-3">
             {isPending ? "Verification In Progress" : "Partner Access Only"}
          </h2>
          
          <p className="text-slate-500 text-xs md:text-sm mb-8 leading-relaxed font-mono">
             {isPending 
               ? "Your documentation has been received and is currently under compliance review. Access will be granted upon approval."
               : "Access to wholesale pricing, live inventory, and wallet functions is reserved for verified procurement agents."
             }
          </p>

          {/* BUTTON: Hide if pending, Show if unverified */}
          {!isPending && (
            <Link 
              to="/kyc-verification" 
              className="inline-flex items-center gap-3 bg-blue-900 text-white px-8 py-4 rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              <FaIdCard />
              <span>Verify Identity</span>
            </Link>
          )}

          {/* PENDING BADGE */}
          {isPending && (
             <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-700 rounded border border-amber-200 text-xs font-bold uppercase tracking-widest">
                <span className="animate-pulse">●</span> Audit Active
             </div>
          )}

          <div className="mt-6 text-[10px] text-slate-400 uppercase tracking-wide">
             BambooMall Security Protocol
          </div>
        </div>
      </div>
    </div>
  );
}