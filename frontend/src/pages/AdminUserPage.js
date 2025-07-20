import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:4000/api/admin";

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <table className="min-w-full bg-white rounded-xl shadow">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Short ID</th>
            <th>Username</th>
            <th>KYC Status</th>
            <th>Signup</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="font-mono text-xs">{u.id}</td>
              <td className="font-mono">{u.short_id}</td>
              <td>{u.username}</td>
              <td>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  u.kycStatus === "approved"
                    ? "bg-green-200 text-green-800"
                    : u.kycStatus === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : u.kycStatus === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-200 text-gray-700"
                }`}>
                  {u.kycStatus}
                </span>
              </td>
              <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
              <td>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-800"
                  onClick={() => handleDeleteUser(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
