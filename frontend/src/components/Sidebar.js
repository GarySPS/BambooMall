import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Award, 
  Newspaper, 
  BookOpen, 
  Shield, 
  LogOut, 
  Globe, 
  X, 
  Server,
  UserCheck,
  Clock,
  AlertCircle
} from "lucide-react";

export default function Sidebar({ isOpen, closeSidebar }) {
  const { user, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Terminal Overview", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Master Manifest", path: "/products", icon: <Package size={20} /> },
    { name: "Active Allocations", path: "/cart", icon: <ShoppingCart size={20} /> },
    { name: "Treasury & Funds", path: "/balance", icon: <DollarSign size={20} /> },
    { name: "Partner Status", path: "/membership", icon: <Award size={20} /> },
    { name: "Corporate News", path: "/news", icon: <Newspaper size={20} /> }, 
    { name: "Operational Manual", path: "/faq", icon: <BookOpen size={20} /> },
    { name: "Legal & Compliance", path: "/compliance", icon: <Shield size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusDisplay = () => {
    if (!user) return { label: "GUEST", color: "text-slate-500", icon: null };
    if (user.kyc_status === 'approved') return { label: "VERIFIED AGENT", color: "text-emerald-400", icon: <UserCheck size={18} className="text-emerald-400"/> };
    if (user.kyc_status === 'pending') return { label: "REVIEW PENDING", color: "text-amber-400", icon: <Clock size={18} className="text-amber-400"/> };
    return { label: "UNVERIFIED ENTITY", color: "text-red-400", icon: <AlertCircle size={18} className="text-red-400"/> };
  };

  const status = getStatusDisplay();

  return (
    <>
      <div className={`
        w-72 bg-slate-900 h-screen fixed left-0 top-0 text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl z-50 font-sans
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}>
        
        {/* 1. BRANDING - Bigger & Clearer */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
              <Globe size={24} />
            </div>
            <div>
              <h1 className="text-white font-bold tracking-tight text-xl leading-none">BambooMall</h1>
              <div className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mt-1 font-bold">SCM Portal v2.4</div>
            </div>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* 2. USER ID CARD - Solid Look */}
        {user && (
          <div className="px-5 py-6">
            <Link 
              to="/profile" 
              onClick={closeSidebar} 
              className="block bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-all group shadow-sm"
            >
               <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 bg-slate-900 rounded-lg border border-slate-700 ${user.kyc_status === 'approved' ? 'text-emerald-400' : ''}`}>
                      {status.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-bold text-white truncate">{user.username}</span>
                    <span className={`text-[10px] font-bold tracking-wider ${status.color}`}>VIEW PROFILE</span>
                  </div>
               </div>
               <div className="pt-3 border-t border-slate-700/50 text-xs text-slate-400 font-mono flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span>ID:</span>
                    <span className="text-slate-200">{user.short_id ? `AGT-${user.short_id}` : "PENDING"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STATUS:</span>
                    <span className={`${status.color} font-bold`}>{status.label}</span>
                  </div>
               </div>
            </Link>
          </div>
        )}

        {/* 3. NAVIGATION - Bigger Text (text-base) & Solid Active State */}
        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar} 
                className={`flex items-center gap-4 px-5 py-3.5 rounded-lg text-base font-bold transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1"
                }`}
              >
                <span className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 4. SYSTEM STATUS - RESTORED FULL VERSION */}
        <div className="p-6 border-t border-slate-800 bg-slate-900">
           {/* Restored USDC/CNY Row */}
           <div className="flex justify-between border-b border-slate-800 pb-3 mb-3 text-xs font-mono">
              <span className="text-slate-500">USDC/CNY</span>
              <span className="text-emerald-500 font-bold">7.24 ↑</span>
           </div>
           
           {/* Restored System Status Row */}
           <div className="flex justify-between items-center text-xs font-mono mb-4">
              <span className="flex items-center gap-2 text-slate-500">
                <Server size={14} /> System Status
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> ONLINE
              </span>
           </div>

           <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/30 py-3 rounded-lg transition-all text-xs font-bold uppercase tracking-widest"
           >
              <LogOut size={16} /> Terminate Session
           </button>
        </div>

      </div>
    </>
  );
}