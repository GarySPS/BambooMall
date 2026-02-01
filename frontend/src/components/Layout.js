// src/components/Layout.js
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { FaBars, FaGlobeAsia } from "react-icons/fa";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* --- MOBILE COMMAND BAR (Visible only on small screens) --- */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-lg border-b border-slate-800">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white shadow-blue-900/50">
                <FaGlobeAsia />
            </div>
            <span className="font-bold tracking-tight text-sm">BambooMall SCM</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* --- SIDEBAR (Responsive) --- */}
      {/* Pass the state to control visibility on mobile */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* --- CONTENT AREA --- */}
      {/* md:pl-64 pushes content right ONLY on desktop. w-full ensures it fits. */}
      <div className="flex-1 transition-all duration-300 md:pl-64 w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
             {children}
        </div>
      </div>

      {/* --- MOBILE OVERLAY (Backdrop) --- */}
      {/* Closes sidebar when clicking outside on mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}