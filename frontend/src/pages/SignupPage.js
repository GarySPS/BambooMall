//src>pages>SignupPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useUser(); // <--- Get user status

  // <--- NEW: Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      navigate("/otp", { state: { email } });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen w-full"
      style={{
        backgroundImage: "url('/bamboomalllogin.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl px-5 py-7 max-w-xs w-full flex flex-col gap-4"
      >
        <h2 className="text-2xl font-extrabold text-green-700 mb-1 tracking-wide text-center">
          Sign Up BambooMall
        </h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="border rounded-lg px-3 py-2 text-base"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded-lg px-3 py-2 text-base"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded-lg px-3 py-2 text-base"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="border rounded-lg px-3 py-2 text-base"
          required
        />
        {error && (
          <div className="text-red-600 text-xs text-center">{error}</div>
        )}
        <button
          type="submit"
          className="bg-green-600 text-white font-bold rounded-lg py-2 text-base hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
        <div className="text-center text-xs text-gray-500 mt-1">
          Already have an account?{" "}
          <span
            className="text-green-700 hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Log In
          </span>
        </div>
      </form>
    </div>
  );
}