// src/components/AdminLayout.js

import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { 
  FaBars, 
  FaTimes, 
  FaUserShield, 
  FaUsers, 
  FaShieldAlt, 
  FaMoneyCheckAlt, 
  FaExchangeAlt, 
  FaClipboardList, 
  FaSignOutAlt,
  FaChartPie 
} from "react-icons/fa";

// Navigation Configuration
const navLinks = [
  { to: "/admin/overview", label: "Overview", icon: <FaChartPie className="text-lg" /> },
  { to: "/admin/users", label: "Users", icon: <FaUsers className="text-lg" /> },
  { to: "/admin/kyc", label: "KYC", icon: <FaShieldAlt className="text-lg" /> },
  { to: "/admin/deposit", label: "Deposits", icon: <FaMoneyCheckAlt className="text-lg" /> },
  { to: "/admin/withdraw", label: "Withdrawals", icon: <FaExchangeAlt className="text-lg" /> },
  { to: "/admin/orders", label: "Orders", icon: <FaClipboardList className="text-lg" /> },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Helper to determine if link is active
  const isLinkActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <>
      {/* Logo Area */}
      <div className="flex flex-col items-start gap-3 mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5 shadow-sm border border-indigo-100">
            <FaUserShield className="text-[#17604e]" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-[#17604e] tracking-tight leading-none">
              BambooMall
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">
              Admin Panel
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navLinks.map((link) => {
          const active = isLinkActive(link.to);
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)} // Close on mobile click
              className={`
                flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-sm transition-all duration-200
                ${active 
                  ? "bg-[#17604e] text-white shadow-md shadow-green-900/10 translate-x-1" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#17604e]"
                }
              `}
            >
              <span className={`opacity-80 ${active ? "text-white" : ""}`}>{link.icon}</span>
              <span>{link.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Exit */}
      <div className="pt-4 mt-auto border-t border-slate-100">
        <a
          href="/"
          className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-4 py-2.5 rounded-xl font-bold transition-all text-sm group"
        >
          <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" />
          Exit Dashboard
        </a>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] font-inter">
      
      {/* --- MOBILE TOP BAR (New) --- */}
      {/* This prevents content from being hidden behind a floating button */}
      <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <FaBars size={20} />
          </button>
          <span className="font-bold text-[#17604e] tracking-tight">Admin Panel</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#17604e] flex items-center justify-center text-white text-xs font-bold shadow-sm">
          A
        </div>
      </div>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 shadow-xl shadow-slate-200/50 flex-col p-6 z-20 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* --- MOBILE DRAWER --- */}
      {sidebarOpen && (
        <div className="md:hidden relative z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Drawer Panel */}
          <aside className="fixed top-0 left-0 h-full w-[85vw] max-w-xs bg-white p-6 flex flex-col shadow-2xl animate-slide-in">
             <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                >
                  <FaTimes size={20} />
                </button>
             </div>
             <SidebarContent />
          </aside>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 min-w-0">
        {/* The Outlet renders the current page (Users, Deposits, etc.) */}
        <div className="h-full">
           <Outlet />
        </div>
      </main>

      {/* Inline Animation Styles for Mobile Drawer */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}