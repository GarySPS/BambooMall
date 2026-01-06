//src>pages>AdminUserPage.js

import React, { useEffect, useState } from "react";
import { FaTrashAlt, FaUserShield, FaUser, FaPhone, FaIdCard, FaMapMarkerAlt } from "react-icons/fa";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin`;

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure to delete this user and all related data?")) return;
    try {
        await fetch(`${API_URL}/users/${userId}`, { method: "DELETE" });
        setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
        alert("Failed to delete user");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-[#F2E5C0] to-[#e6f3ee] min-h-screen font-inter">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="rounded-full bg-[#17604e]/10 p-2 shadow">
            <FaUserShield className="text-[#17604e]" size={24} />
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#17604e] tracking-tight">
            User Management
          </h2>
        </div>

        {loading ? (
          <div className="w-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-4 text-green-900 font-semibold tracking-wide">Loading users…</span>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/70 backdrop-blur rounded-2xl shadow-xl border border-white/60">
            <table className="min-w-full divide-y divide-[#e3e9ef] text-sm">
              <thead>
                <tr className="bg-[#17604e]/90 text-white">
                  <th className="py-4 px-4 text-left font-bold rounded-tl-2xl">Account Info</th>
                  <th className="py-4 px-4 text-left font-bold">Personal Details</th>
                  <th className="py-4 px-4 text-left font-bold">KYC Status</th>
                  <th className="py-4 px-4 text-left font-bold">Signup Date</th>
                  <th className="py-4 px-4 text-left font-bold rounded-tr-2xl text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-8 font-semibold">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u.id} className={`${i % 2 === 0 ? "bg-white/80" : "bg-[#f7f7f7]/80"} hover:bg-white transition duration-150`}>
                      
                      {/* 1. Account Info */}
                      <td className="px-4 py-4 align-top">
                        <div className="font-bold text-gray-900 text-base">{u.username}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">ID: {u.short_id}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{u.email}</div>
                      </td>

                      {/* 2. Personal Details (FIXED LOGIC) */}
                      <td className="px-4 py-4 align-top">
                        {(u.full_name || u.phone || u.id_number || u.address) ? (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-800 font-bold text-xs">
                                    <FaUser className="text-gray-400" size={10} /> 
                                    {u.full_name || <span className="text-gray-400 italic font-normal">No Name</span>}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-xs">
                                    <FaIdCard className="text-blue-400" size={10} /> 
                                    {u.id_number || <span className="text-gray-300">-</span>}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 text-xs">
                                    <FaPhone className="text-green-400" size={10} /> 
                                    {u.phone || <span className="text-gray-300">-</span>}
                                </div>
                                {u.address && (
                                    <div className="flex items-start gap-2 text-gray-500 text-[10px] mt-1 italic leading-tight">
                                        <FaMapMarkerAlt className="text-red-400 shrink-0 mt-0.5" size={10} /> 
                                        {u.address}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span className="text-gray-300 text-xs italic">Not provided</span>
                        )}
                      </td>

                      {/* 3. KYC Status */}
                      <td className="px-4 py-4 align-top">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                            u.kycStatus === "approved"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : u.kycStatus === "pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {u.kycStatus || "Unverified"}
                        </span>
                      </td>

                      {/* 4. Signup Date */}
                      <td className="px-4 py-4 align-top text-gray-600 font-mono text-xs">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                      </td>

                      {/* 5. Action */}
                      <td className="px-4 py-4 align-middle text-center">
                        <button
                          className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm active:scale-95 w-full max-w-[100px] mx-auto"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <FaTrashAlt /> Delete
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
  );
}