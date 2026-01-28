// src/pages/AdminUserPage.js

import React, { useEffect, useState, useMemo } from "react";
import { 
  FaTrashAlt, 
  FaUserShield, 
  FaUser, 
  FaPhone, 
  FaIdCard, 
  FaMapMarkerAlt, 
  FaSearch, 
  FaBoxOpen,
  FaEnvelope
} from "react-icons/fa";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin`;

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, verified, pending, unverified

  // --- DATA FETCHING ---
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/users`);
        let data = await res.json();
        if (!Array.isArray(data)) data = [];
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // --- HANDLERS ---
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure to delete this user and all related data? This cannot be undone.")) return;
    try {
        await fetch(`${API_URL}/users/${userId}`, { method: "DELETE" });
        setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
        alert("Failed to delete user");
    }
  };

  // --- FILTER LOGIC ---
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Status Filter
      if (statusFilter !== "all") {
        const kyc = u.kycStatus || "unverified";
        if (statusFilter === "verified" && kyc !== "approved") return false;
        if (statusFilter === "pending" && kyc !== "pending") return false;
        if (statusFilter === "unverified" && (kyc === "approved" || kyc === "pending")) return false;
      }

      // 2. Search Filter
      const searchLower = searchTerm.toLowerCase();
      return (
        (u.username || "").toLowerCase().includes(searchLower) ||
        (u.email || "").toLowerCase().includes(searchLower) ||
        (u.short_id || "").toString().includes(searchLower) ||
        (u.full_name || "").toLowerCase().includes(searchLower)
      );
    });
  }, [users, statusFilter, searchTerm]);

  // --- RENDER HELPERS ---
  const KYCBadge = ({ status }) => {
    const styles = {
      approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
      rejected: "bg-rose-100 text-rose-700 border-rose-200",
      unverified: "bg-slate-100 text-slate-500 border-slate-200",
    };
    const style = styles[status] || styles.unverified;
    const label = status === "approved" ? "Verified" : (status || "Unverified");
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style} uppercase tracking-wide`}>
        {label}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 min-h-screen font-inter bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
               <FaUserShield size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">User Management</h2>
              <p className="text-sm text-slate-500">Manage accounts, balances, and permissions</p>
            </div>
          </div>
          
           {/* Stats Bubble */}
           <div className="flex gap-3">
             <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm">
                <span className="text-slate-500">Total Users:</span> 
                <span className="font-bold text-slate-800 ml-1">{users.length}</span>
             </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center">
          {/* Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-lg w-full lg:w-auto overflow-x-auto">
            {[
              { id: "all", label: "All Users" },
              { id: "verified", label: "Verified" },
              { id: "pending", label: "KYC Pending" },
              { id: "unverified", label: "Unverified" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, ID, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-64">Account Info</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-64">Personal Details</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Balance</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">KYC Status</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <FaBoxOpen size={48} className="mb-3 opacity-20" />
                          <p className="text-lg font-medium text-slate-600">No users found</p>
                          <p className="text-sm">Try changing filters or search terms.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        
                        {/* 1. Account Info */}
                        <td className="px-4 py-4 align-top">
                           <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <FaUser />
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{u.username}</div>
                                <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {u.short_id}</div>
                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                  <FaEnvelope size={10} /> {u.email}
                                </div>
                              </div>
                            </div>
                        </td>

                        {/* 2. Personal Details */}
                        <td className="px-4 py-4 align-top">
                          {(u.full_name || u.phone || u.id_number || u.address) ? (
                              <div className="space-y-1.5">
                                  {u.full_name && (
                                    <div className="text-sm font-bold text-slate-700">{u.full_name}</div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                      <FaIdCard className="text-blue-400" /> 
                                      <span className="font-mono">{u.id_number || "-"}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                      <FaPhone className="text-emerald-500" /> 
                                      <span className="font-mono">{u.phone || "-"}</span>
                                  </div>
                                  {u.address && (
                                    <div className="flex items-start gap-1 text-[11px] text-slate-500 leading-tight max-w-[180px]">
                                        <FaMapMarkerAlt className="text-rose-400 shrink-0 mt-0.5" /> 
                                        {u.address}
                                    </div>
                                  )}
                              </div>
                          ) : (
                              <span className="text-slate-300 text-xs italic bg-slate-50 px-2 py-1 rounded">No profile data</span>
                          )}
                        </td>

                        {/* 3. Balance */}
                        <td className="px-4 py-4 align-top">
                           <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 font-mono font-bold w-fit">
                              ${u.balance !== undefined ? Number(u.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) : "0.00"}
                           </div>
                        </td>

                        {/* 4. KYC Status */}
                        <td className="px-4 py-4 align-top">
                           <KYCBadge status={u.kycStatus} />
                        </td>

                        {/* 5. Signup Date */}
                        <td className="px-4 py-4 align-top text-slate-500 text-xs font-mono">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                        </td>

                        {/* 6. Action */}
                        <td className="px-4 py-4 align-middle text-center">
                          <button
                            className="group flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm w-full max-w-[100px] mx-auto"
                            onClick={() => handleDeleteUser(u.id)}
                            title="Delete User"
                          >
                            <FaTrashAlt className="group-hover:scale-110 transition-transform" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}