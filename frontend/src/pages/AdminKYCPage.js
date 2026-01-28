// src/pages/AdminKYCPage.js

import React, { useEffect, useState, useMemo } from "react";
import { 
  FaShieldAlt, 
  FaCheck, 
  FaTimes, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaIdCard, 
  FaUser, 
  FaSearch, 
  FaBoxOpen,
  FaEnvelope
} from "react-icons/fa";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin`;
const KYC_API_URL = `${API_BASE_URL}/kyc`;

export default function AdminKYCPage() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // pending, approved, rejected, all

  // --- DATA FETCHING ---
  useEffect(() => {
    async function fetchKYC() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/users`);
        let usersData = await res.json();
        if (!Array.isArray(usersData)) usersData = [];

        const usersWithKYC = await Promise.all(
          usersData.map(async (u) => {
            let kycDocs = [];
            // Fetch docs for pending or approved reviews
            if (u.kycStatus === "pending" || u.kycStatus === "approved") {
              try {
                const r = await fetch(`${KYC_API_URL}?short_id=${u.short_id}`);
                const d = await r.json();
                kycDocs = Array.isArray(d.kyc_docs)
                  ? d.kyc_docs.map(doc => ({
                      ...doc,
                      doc_url: typeof doc.doc_url === "string"
                        ? doc.doc_url.replace(/[\r\n\s]+/g, "")
                        : ""
                    }))
                  : [];
              } catch (e) { console.error("Error fetching docs", e); }
            }
            return { ...u, kycDocs };
          })
        );
        // Initial Sort: Pending first
        usersWithKYC.sort((a, b) => (a.kycStatus === "pending" ? -1 : 1));
        setUsers(usersWithKYC);
      } catch (err) {
        console.error("Admin Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchKYC();
  }, []);

  // --- HANDLERS ---
  const handleApproveKYC = async (userId, approve) => {
    try {
      await fetch(`${API_URL}/kyc-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, approve }),
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, kycStatus: approve ? "approved" : "rejected" }
            : u
        )
      );
    } catch (error) {
      alert("Action failed. Check console.");
      console.error(error);
    }
  };

  // --- FILTER LOGIC ---
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Status Filter
      if (statusFilter !== "all") {
        const status = u.kycStatus || "unverified";
        if (statusFilter === "pending" && status !== "pending") return false;
        if (statusFilter === "approved" && status !== "approved") return false;
        if (statusFilter === "rejected" && status !== "rejected") return false;
        if (statusFilter === "unverified" && status !== "unverified") return false;
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
  const StatusBadge = ({ status }) => {
    const styles = {
      approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
      rejected: "bg-rose-100 text-rose-700 border-rose-200",
      unverified: "bg-slate-100 text-slate-500 border-slate-200",
    };
    const style = styles[status] || styles.unverified;
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${style} capitalize`}>
        {status || "Unverified"}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 min-h-screen font-inter bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-teal-100 p-2 text-teal-700">
               <FaShieldAlt size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">KYC Management</h2>
              <p className="text-sm text-slate-500">Verify user identities and documents</p>
            </div>
          </div>
          
          {/* Stats Bubble */}
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm">
             <span className="text-slate-500">Pending Requests:</span> 
             <span className="font-bold text-amber-600 ml-1">
               {users.filter(u => u.kycStatus === 'pending').length}
             </span>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center">
          {/* Tabs */}
          <div className="flex bg-slate-100/80 p-1 rounded-lg w-full lg:w-auto overflow-x-auto">
            {["pending", "approved", "rejected", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all capitalize whitespace-nowrap ${
                  statusFilter === tab
                    ? "bg-white text-teal-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
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
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading KYC data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-64">User Account</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-72">Identity Info</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Documents</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-16 text-center">
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
                        
                        {/* 1. User Account */}
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

                        {/* 2. Identity Info */}
                        <td className="px-4 py-4 align-top">
                          {u.full_name ? (
                            <div className="space-y-1.5">
                              <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                {u.full_name}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit">
                                <FaIdCard className="text-blue-400" /> 
                                <span className="font-mono">{u.id_number || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <FaPhone className="text-emerald-500" /> 
                                {u.phone || "N/A"}
                              </div>
                              {u.address && (
                                <div className="flex items-start gap-1 text-[11px] text-slate-500 leading-tight max-w-[200px]">
                                  <FaMapMarkerAlt className="text-rose-400 shrink-0 mt-0.5" /> 
                                  {u.address}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic bg-slate-50 px-2 py-1 rounded">
                              No profile data
                            </span>
                          )}
                        </td>

                        {/* 3. Status */}
                        <td className="px-4 py-4 align-top">
                          <StatusBadge status={u.kycStatus} />
                        </td>

                        {/* 4. Documents */}
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap gap-2">
                            {u.kycDocs?.length > 0 ? (
                              u.kycDocs.map((doc, idx) => (
                                <div key={idx} className="group relative">
                                  <img
                                    src={doc.doc_url}
                                    alt={doc.doc_type}
                                    className="w-14 h-14 rounded-lg border border-slate-200 shadow-sm object-cover cursor-zoom-in hover:scale-105 hover:shadow-md transition-all"
                                    onClick={() => setModal({ img: doc.doc_url, label: doc.name || doc.doc_type })}
                                  />
                                  <div className="opacity-0 group-hover:opacity-100 absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    {doc.name || doc.doc_type}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate-300 text-xs italic">No docs</span>
                            )}
                          </div>
                        </td>

                        {/* 5. Action */}
                        <td className="px-4 py-4 align-middle text-center">
                          {u.kycStatus === "pending" ? (
                            <div className="flex flex-col gap-2 max-w-[120px] mx-auto">
                              <button
                                onClick={() => handleApproveKYC(u.id, true)}
                                className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all"
                              >
                                <FaCheck /> Approve
                              </button>
                              <button
                                onClick={() => handleApproveKYC(u.id, false)}
                                className="flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all"
                              >
                                <FaTimes /> Reject
                              </button>
                            </div>
                          ) : u.kycStatus === "approved" ? (
                             <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-100 mx-auto w-fit">
                               <FaCheck size={10} /> Verified
                             </div>
                          ) : (
                             <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* IMAGE MODAL */}
        {modal && (
          <div 
            className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setModal(null)}
          >
            <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <button 
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition p-2"
                onClick={() => setModal(null)}
              >
                <FaTimes size={24} />
              </button>
              
              <div className="bg-white/10 px-4 py-1.5 rounded-full text-white font-medium text-sm mb-4 border border-white/20 backdrop-blur-md">
                Document: {modal.label}
              </div>
              
              <img 
                src={modal.img} 
                alt="Full View" 
                className="max-h-[85vh] w-auto rounded-lg shadow-2xl border border-white/10 bg-black" 
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}