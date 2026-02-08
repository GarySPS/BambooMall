//src>pages>AdminOverviewPage.js

import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  FaUsers, 
  FaShieldAlt, 
  FaMoneyCheckAlt, 
  FaExchangeAlt, 
  FaClipboardList, 
  FaChartLine,
  FaSpinner
} from "react-icons/fa";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin`;

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingKYC: 0,
    pendingDeposits: 0,
    pendingWithdraws: 0,
    pendingResales: 0,
    totalOrders: 0
  });

  // --- FETCH DATA FOR STATS ---
  useEffect(() => {
    async function fetchStats() {
      try {
        // FIX: Get Token
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        // FIX: Attach Token to Request
        const res = await fetch(`${API_URL}/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        let users = await res.json();
        if (!Array.isArray(users)) users = [];

        // Calculate Stats Client-Side
        let pendingDep = 0;
        let pendingWd = 0;
        let pendingResale = 0;
        let totalOrd = 0;

        users.forEach(u => {
          // Count Pending Transactions
          if (Array.isArray(u.wallet_transactions)) {
            u.wallet_transactions.forEach(tx => {
              if (tx.status === 'pending') {
                if (tx.type === 'deposit') pendingDep++;
                if (tx.type === 'withdraw') pendingWd++;
              }
            });
          }

          // Count Pending Orders/Resales
          if (Array.isArray(u.orders)) {
            totalOrd += u.orders.length;
            u.orders.forEach(o => {
               // Assuming "selling" or "pending" implies a resale request in your logic
               if (o.status === 'selling' || o.resale_status === 'pending') {
                 pendingResale++;
               }
            });
          }
        });

        setStats({
          totalUsers: users.length,
          pendingKYC: users.filter(u => u.kyc_status === 'pending').length, // FIX: kyc_status (DB field name)
          pendingDeposits: pendingDep,
          pendingWithdraws: pendingWd,
          pendingResales: pendingResale,
          totalOrders: totalOrd
        });

      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const dashboardItems = useMemo(() => [
    {
      to: "/admin/users",
      label: "User Base",
      count: stats.totalUsers,
      subLabel: "Total Accounts",
      icon: <FaUsers className="text-indigo-600 text-3xl" />,
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      text: "text-indigo-900",
      alert: false
    },
    {
      to: "/admin/kyc",
      label: "KYC Requests",
      count: stats.pendingKYC,
      subLabel: stats.pendingKYC === 1 ? "Pending Review" : "Pending Reviews",
      icon: <FaShieldAlt className="text-teal-600 text-3xl" />,
      bg: "bg-teal-50",
      border: "border-teal-100",
      text: "text-teal-900",
      alert: stats.pendingKYC > 0
    },
    {
      to: "/admin/deposits",
      label: "Deposits",
      count: stats.pendingDeposits,
      subLabel: "Pending Approval",
      icon: <FaMoneyCheckAlt className="text-emerald-600 text-3xl" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-900",
      alert: stats.pendingDeposits > 0
    },
    {
      to: "/admin/withdrawals",
      label: "Withdrawals",
      count: stats.pendingWithdraws,
      subLabel: "Pending Payout",
      icon: <FaExchangeAlt className="text-rose-600 text-3xl" />,
      bg: "bg-rose-50",
      border: "border-rose-100",
      text: "text-rose-900",
      alert: stats.pendingWithdraws > 0
    },
    {
      to: "/admin/orders",
      label: "Resale Orders",
      count: stats.pendingResales,
      subLabel: "Active / Resale",
      icon: <FaClipboardList className="text-amber-600 text-3xl" />,
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-900",
      alert: stats.pendingResales > 0 // Optional: Highlight if you want urgency on resales
    },
    {
      to: "/admin/orders", // Using same link, but different stat
      label: "Total Orders",
      count: stats.totalOrders,
      subLabel: "All Time",
      icon: <FaChartLine className="text-slate-500 text-3xl" />,
      bg: "bg-slate-50",
      border: "border-slate-200",
      text: "text-slate-700",
      alert: false
    },
  ], [stats]);

  return (
    <div className="min-h-screen bg-slate-50 font-inter p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-slate-500 mt-2">
            Welcome back, Admin. Here is what needs your attention today.
          </p>
        </div>

        {/* GRID */}
        {loading ? (
           <div className="flex justify-center items-center py-20">
             <FaSpinner className="animate-spin text-slate-300 text-4xl" />
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                className={`
                  relative group overflow-hidden rounded-2xl p-6 transition-all duration-200
                  bg-white border hover:shadow-xl hover:-translate-y-1
                  ${item.border}
                `}
              >
                {/* Alert Dot for Pending Items */}
                {item.alert && (
                  <span className="absolute top-4 right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${item.text} leading-none`}>
                      {item.count}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className={`font-bold text-lg text-slate-700 group-hover:${item.text.replace('900','600')} transition-colors`}>
                    {item.label}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mt-1">
                    {item.subLabel}
                  </p>
                </div>

                {/* Decorative background blur */}
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 ${item.bg.replace('bg-', 'bg-')}`} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}