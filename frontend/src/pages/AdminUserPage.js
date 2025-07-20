import React, { useEffect, useState } from "react";
import { FaTrashAlt, FaUserShield } from "react-icons/fa";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/admin`;

export default function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const res = await fetch(`${API_URL}/users`);
      let data = await res.json();
      if (!Array.isArray(data)) data = [];
      setUsers(data);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure to delete this user and all related data?")) return;
    await fetch(`${API_URL}/users/${userId}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-[#F2E5C0] to-[#e6f3ee] min-h-screen font-inter">
      <div className="max-w-5xl mx-auto">
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
                  <th className="py-3 px-3 text-left font-bold rounded-tl-2xl">User ID</th>
                  <th className="py-3 px-3 text-left font-bold">Short ID</th>
                  <th className="py-3 px-3 text-left font-bold">Username</th>
                  <th className="py-3 px-3 text-left font-bold">KYC Status</th>
                  <th className="py-3 px-3 text-left font-bold">Signup</th>
                  <th className="py-3 px-3 text-left font-bold rounded-tr-2xl">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-8 font-semibold">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u.id}
                      className={`${
                        i % 2 === 0 ? "bg-white/80" : "bg-[#f7f7f7]/80"
                      } transition`}>
                      <td className="font-mono text-xs px-3 py-3">{u.id}</td>
                      <td className="font-mono px-3 py-3">{u.short_id}</td>
                      <td className="px-3 py-3">{u.username}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-1 rounded-2xl text-xs font-semibold shadow ${
                            u.kycStatus === "approved"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : u.kycStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                              : u.kycStatus === "rejected"
                              ? "bg-red-100 text-red-700 border border-red-300"
                              : "bg-gray-200 text-gray-700 border border-gray-300"
                          }`}
                        >
                          {u.kycStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow active:scale-95"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <FaTrashAlt />
                          Delete
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
