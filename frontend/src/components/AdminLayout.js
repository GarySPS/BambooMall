import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const navLinks = [
  { to: "/admin/users", label: "Users" },
  { to: "/admin/kyc", label: "KYC" },
  { to: "/admin/deposit", label: "Deposit" },
  { to: "/admin/withdraw", label: "Withdraw" },
  { to: "/admin/orders", label: "Orders" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f2e5c0]">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-green-600 text-white p-2 rounded-xl shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars size={22} />
      </button>

      {/* Sidebar */}
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-white shadow-2xl p-6 flex-col gap-4 z-10">
        <div className="mb-8 text-2xl font-bold text-green-900 tracking-tight">
          🐼 BambooMall Admin
        </div>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              "block rounded-xl px-4 py-2 font-semibold transition " +
              (isActive
                ? "bg-green-600 text-white shadow"
                : "hover:bg-green-100 text-green-900")
            }
          >
            {link.label}
          </NavLink>
        ))}
        <a
          href="/"
          className="mt-auto text-center bg-red-100 hover:bg-red-300 text-red-700 px-4 py-2 rounded-xl font-bold transition"
        >
          Exit Admin
        </a>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl p-6 flex flex-col gap-4 transition-transform duration-200"
            style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-2xl font-bold text-green-900 tracking-tight">🐼 BambooMall Admin</span>
              <button
                className="text-green-900 bg-green-100 hover:bg-green-200 rounded-full p-1"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <FaTimes size={22} />
              </button>
            </div>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  "block rounded-xl px-4 py-2 font-semibold transition " +
                  (isActive
                    ? "bg-green-600 text-white shadow"
                    : "hover:bg-green-100 text-green-900")
                }
                onClick={() => setSidebarOpen(false)} // Close drawer on nav
              >
                {link.label}
              </NavLink>
            ))}
            <a
              href="/"
              className="mt-auto text-center bg-red-100 hover:bg-red-300 text-red-700 px-4 py-2 rounded-xl font-bold transition"
              onClick={() => setSidebarOpen(false)}
            >
              Exit Admin
            </a>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
