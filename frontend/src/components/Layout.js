import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, Globe } from "lucide-react"; // Using Lucide icons now
import { useUser } from "../contexts/UserContext"; // Import context to pass user to sidebar

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useUser(); // Get user data here to pass to Sidebar

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* --- MOBILE COMMAND BAR --- */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-lg border-b border-slate-800">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white shadow-blue-900/50">
                <Globe size={18} />
            </div>
            <span className="font-bold tracking-tight text-sm">BambooMall SCM</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeSidebar={() => setIsSidebarOpen(false)} 
        user={user} // Passing user data for the profile card
      />

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 transition-all duration-300 md:pl-64 w-full bg-slate-50/50 min-h-screen">
        <div className="p-3 md:p-6 w-full"> 
             {children}
        </div>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}