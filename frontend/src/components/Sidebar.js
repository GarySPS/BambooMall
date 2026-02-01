// src/components/Sidebar.js

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { 
  FaBoxOpen, 
  FaChartPie, 
  FaWallet, 
  FaShieldAlt, 
  FaSignOutAlt, 
  FaServer,
  FaGlobeAsia,
  FaUserSecret,
  FaCrown,
  FaClipboardList,
  FaInfoCircle,
  FaTimes // Added for mobile close button
} from "react-icons/fa";

// Receive props from Layout
export default function Sidebar({ isOpen, closeSidebar }) {
  const { user, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Terminal Overview", path: "/", icon: <FaChartPie /> },
    { name: "Master Manifest", path: "/products", icon: <FaBoxOpen /> },
    { name: "Active Allocations", path: "/cart", icon: <FaClipboardList /> },
    { name: "Treasury & Funds", path: "/balance", icon: <FaWallet /> },
    { name: "Partner Status", path: "/membership", icon: <FaCrown /> },
    { name: "Operational Manual", path: "/faq", icon: <FaInfoCircle /> },
    { name: "Legal & Compliance", path: "/compliance", icon: <FaShieldAlt /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Responsive Classes:
        - fixed, h-screen, left-0, top-0: Always fixed position.
        - z-50: Always on top.
        - transform transition-transform: Smooth slide animation.
        - -translate-x-full: Hidden by default on mobile.
        - md:translate-x-0: Always visible on desktop.
        - ${isOpen ? "translate-x-0" : ""}: Slide in when open on mobile.
      */}
      <div className={`
        w-64 bg-slate-900 h-screen fixed left-0 top-0 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl z-50 font-sans
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}>
        
        {/* 1. BRANDING & MOBILE CLOSE */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
              <FaGlobeAsia />
            </div>
            <div>
              <h1 className="text-white font-bold tracking-tight text-lg">BambooMall</h1>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">SCM Portal v2.4</div>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white">
            <FaTimes size={20} />
          </button>
        </div>

        {/* 2. USER ID CARD */}
        {user && (
          <div className="px-4 py-6">
            <Link 
              to="/profile" 
              onClick={closeSidebar} // Close on click (Mobile UX)
              className="block bg-slate-800/50 p-4 rounded border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800 hover:border-slate-600 transition-all group"
            >
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-slate-900 rounded border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                      <FaUserSecret className="text-emerald-500" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-mono text-white font-bold truncate">{user.username}</span>
                    <span className="text-[9px] text-emerald-500 font-bold tracking-tighter">VIEW PROFILE</span>
                  </div>
               </div>
               <div className="text-[10px] text-slate-500 font-mono pl-1">
                  ID: <span className="text-slate-300">{user.short_id || "PENDING"}</span>
                  <br />
                  STATUS: <span className="text-emerald-500 font-bold uppercase">Verified Agent</span>
               </div>
            </Link>
          </div>
        )}

        {/* 3. NAVIGATION */}
        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar} // Close on click (Mobile UX)
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? "bg-blue-900/30 text-blue-400 border-l-4 border-blue-500 shadow-inner" 
                    : "hover:bg-slate-800 hover:text-white border-l-4 border-transparent"
                }`}
              >
                <span className={`text-lg ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 4. SYSTEM STATUS */}
        <div className="p-6 border-t border-slate-800 text-xs font-mono space-y-3 bg-slate-900/50">
          <div className="flex justify-between border-b border-slate-800 pb-2">
             <span className="text-slate-500">USDC/CNY</span>
             <span className="text-emerald-500 font-bold">7.24 ↑</span>
          </div>
          <div className="flex justify-between items-center pt-1">
             <span className="flex items-center gap-2 text-slate-500">
               <FaServer size={10} /> System Status
             </span>
             <span className="flex items-center gap-1 text-emerald-500">
               <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               ONLINE
             </span>
          </div>
        </div>

        {/* 5. LOGOUT */}
        <div className="p-4 bg-slate-950">
          <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-900/20 hover:text-red-400 border border-slate-800 hover:border-red-900/30 text-slate-400 py-2.5 rounded transition-all text-xs font-bold uppercase tracking-wide"
          >
              <FaSignOutAlt /> Terminate Session
          </button>
        </div>

      </div>
    </>
  );
}