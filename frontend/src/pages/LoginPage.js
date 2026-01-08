//src>pages>LoginPage.js

import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function LoginPage() {
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // <--- Get 'user' from context to check status
  const { login, user } = useUser(); 
  const navigate = useNavigate();

  // <--- NEW: Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.is_admin) navigate("/admin");
      else navigate("/");
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!userOrEmail.trim() || !password) return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userOrEmail.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      
      login(data.user);
      // Navigation will be handled by the useEffect above or immediately here
      if (data.user.is_admin) navigate("/admin");
      else navigate("/");
      
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen w-full"
      style={{
        backgroundImage: "url('/bamboomalllogin.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Top Title */}
      <h1
        className="absolute top-16 left-1/2 -translate-x-1/2 w-full text-center font-extrabold select-none z-30"
        style={{
          fontSize: "clamp(2.8rem, 10vw, 4rem)",
          letterSpacing: "-1px",
          lineHeight: "1.05",
          maxWidth: "95vw",
          userSelect: "none"
        }}
      >
        <span style={{ color: "#16a34a", WebkitTextStroke: "2.5px white", textStroke: "2.5px white", textShadow: "0 2px 18px #fff" }}>
          Bamboo
        </span>
        <span style={{ color: "#bfa234", WebkitTextStroke: "2.5px white", textStroke: "2.5px white", textShadow: "0 2px 18px #fff", marginLeft: 4 }}>
          Mall
        </span>
      </h1>

      {/* Panda Image */}
      <img src="/bamboologin.png" alt="BambooMall Login" className="w-56 h-56 object-contain -mb-12 z-20" />

      {/* Login Card */}
      <form onSubmit={handleSubmit} className="z-20 bg-white shadow-2xl rounded-2xl px-5 py-7 max-w-xs w-full flex flex-col gap-4 items-center relative">
        
        {/* ... Keep your existing Inputs (Username/Password) ... */}
        <input
          type="text"
          autoComplete="username"
          placeholder="Username or Email"
          value={userOrEmail}
          onChange={(e) => setUserOrEmail(e.target.value)}
          className="border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 w-full"
          required
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 w-full"
          required
        />

        {/* Error */}
        {error && <div className="text-red-600 text-xs text-center w-full">{error}</div>}

        {/* Buttons */}
        <button type="submit" className="bg-green-600 text-white font-bold rounded-lg py-2 text-base hover:bg-green-700 transition w-full">
          Login
        </button>
        <button type="button" onClick={() => navigate("/signup")} className="border border-green-500 text-green-700 font-bold rounded-lg py-2 text-base hover:bg-green-50 transition mb-2 w-full">
          Sign Up
        </button>

        <span className="absolute left-5 bottom-3 text-xs text-gray-400 hover:text-green-600 cursor-pointer" onClick={() => navigate("/forgot")}>
          Forgot password?
        </span>
      </form>

      {/* --- NEW LEGAL LINKS FOR LOGIN PAGE --- */}
      <div className="absolute bottom-4 z-30 flex gap-6 text-xs text-white/80 font-medium">
        <span onClick={() => navigate("/terms")} className="cursor-pointer hover:text-white hover:underline drop-shadow-md">Terms</span>
        <span onClick={() => navigate("/privacy")} className="cursor-pointer hover:text-white hover:underline drop-shadow-md">Privacy</span>
        <span onClick={() => navigate("/cookies")} className="cursor-pointer hover:text-white hover:underline drop-shadow-md">Cookies</span>
      </div>
    </div>
  );
}