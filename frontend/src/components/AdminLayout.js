import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const navLinks = [
  { to: "/admin/users", label: "Users" },
  { to: "/admin/kyc", label: "KYC" },
  { to: "/admin/deposit", label: "Deposit" },
  { to: "/admin/withdraw", label: "Withdraw" },
  { to: "/admin/orders", label: "Orders" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-[#f2e5c0]">
      {/* Sidebar */}
      <aside className="w-56 bg-white shadow-2xl p-6 flex flex-col gap-4">
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

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
