import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaBars, FaTimes, FaUserShield, FaUsers, FaShieldAlt, FaMoneyCheckAlt, FaExchangeAlt, FaClipboardList, FaSignOutAlt } from "react-icons/fa";

// Premium theme color variables
const colors = {
  primary: "#17604e",
  accent: "#ffd700",
  bg: "#f5f6fa",
  white: "#fff",
};

const navLinks = [
  { to: "/admin/users", label: "Users", icon: <FaUsers className="mr-2" /> },
  { to: "/admin/kyc", label: "KYC", icon: <FaShieldAlt className="mr-2" /> },
  { to: "/admin/deposit", label: "Deposit", icon: <FaMoneyCheckAlt className="mr-2" /> },
  { to: "/admin/withdraw", label: "Withdraw", icon: <FaExchangeAlt className="mr-2" /> },
  { to: "/admin/orders", label: "Orders", icon: <FaClipboardList className="mr-2" /> },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f5f6fa] font-inter">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-[#17604e] text-white p-3 rounded-full shadow-lg transition hover:scale-105 active:scale-95"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars size={22} />
      </button>

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 bg-white/80 backdrop-blur-xl shadow-2xl p-7 flex-col gap-4 rounded-tr-3xl rounded-br-3xl z-20 border-r border-green-100">
        {/* Logo & admin */}
        <div className="flex flex-col items-start gap-3 mb-10">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#17604e]/10 p-2 shadow">
              <FaUserShield className="text-[#17604e]" size={26} />
            </span>
            <span className="text-2xl font-extrabold text-[#17604e] tracking-tight select-none">
              BambooMall Admin
            </span>
          </div>
          <span className="text-xs font-semibold text-green-900/60 pl-1 tracking-widest">
            PREMIUM PANEL
          </span>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                "flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-base transition group " +
                (isActive
                  ? "bg-[#17604e] text-white shadow-lg scale-105"
                  : "hover:bg-[#e8f5ef] text-green-900 hover:text-[#17604e] active:bg-[#f1efe3]") +
                " focus:outline-none"
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        {/* Exit */}
        <a
          href="/"
          className="mt-auto flex items-center justify-center gap-2 bg-red-100 hover:bg-red-300 text-red-700 hover:text-white px-4 py-2 rounded-xl font-bold transition shadow active:scale-95 animate-bounce-slow"
          style={{ marginTop: "auto" }}
        >
          <FaSignOutAlt />
          Exit Admin
        </a>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="fixed top-0 left-0 z-50 h-full w-[84vw] max-w-xs bg-white/95 shadow-2xl p-7 flex flex-col gap-4 rounded-tr-3xl rounded-br-3xl border-r border-green-100 animate-slidein">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#17604e]/10 p-2 shadow">
                  <FaUserShield className="text-[#17604e]" size={24} />
                </span>
                <span className="text-xl font-extrabold text-[#17604e] tracking-tight">Admin</span>
              </div>
              <button
                className="text-[#17604e] bg-green-100 hover:bg-green-200 rounded-full p-1"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <FaTimes size={22} />
              </button>
            </div>
            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    "flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-base transition group " +
                    (isActive
                      ? "bg-[#17604e] text-white shadow"
                      : "hover:bg-[#e8f5ef] text-green-900 hover:text-[#17604e] active:bg-[#f1efe3]") +
                    " focus:outline-none"
                  }
                  onClick={() => setSidebarOpen(false)} // Close drawer on nav
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
            {/* Exit */}
            <a
              href="/"
              className="mt-auto flex items-center justify-center gap-2 bg-red-100 hover:bg-red-300 text-red-700 hover:text-white px-4 py-2 rounded-xl font-bold transition shadow active:scale-95"
              onClick={() => setSidebarOpen(false)}
            >
              <FaSignOutAlt />
              Exit Admin
            </a>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-3 md:p-8">
        <Outlet />
      </main>

      {/* Animations for mobile sidebar */}
      <style>{`
        @keyframes slidein {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(0); }
        }
        .animate-slidein { animation: slidein 0.22s cubic-bezier(0.77,0,0.18,1) both; }
        .animate-bounce-slow { animation: bounce 1.4s infinite; }
      `}</style>
    </div>
  );
}
