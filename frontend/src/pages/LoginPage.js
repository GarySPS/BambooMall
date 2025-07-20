import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { ReactComponent as BambooLogo } from "../components/logo.svg";
import { API_BASE_URL } from "../config";  // <--- ADD THIS LINE

export default function LoginPage() {
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useUser();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!userOrEmail.trim() || !password) return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {  // <--- FIXED LINE
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userOrEmail.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data.user); // Save full user object to context
      if (data.user.is_admin) navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError(err.message);
    }
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
  className="bg-white shadow-2xl rounded-2xl px-5 py-7 max-w-xs w-full flex flex-col gap-4 relative"
>
  {/* Logo + BambooMall */}
  <div className="flex flex-col items-center gap-0 mb-1">
    <BambooLogo className="w-20 h-20 mb-0" />
    <span className="text-2xl font-extrabold text-green-700 font-display tracking-wide mt-[-6px]">
      BambooMall
    </span>
  </div>

  {/* Inputs */}
  <input
    type="text"
    autoComplete="username"
    placeholder="Username or Email"
    value={userOrEmail}
    onChange={e => setUserOrEmail(e.target.value)}
    className="border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
    required
  />
  <input
    type="password"
    autoComplete="current-password"
    placeholder="Password"
    value={password}
    onChange={e => setPassword(e.target.value)}
    className="border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
    required
  />

  {/* Error Message */}
  {error && (
    <div className="text-red-600 text-xs text-center">{error}</div>
  )}

  {/* Login Button */}
  <button
    type="submit"
    className="bg-green-600 text-white font-bold rounded-lg py-2 text-base hover:bg-green-700 transition"
  >
    Login
  </button>
  {/* Signup Button */}
  <button
    type="button"
    onClick={() => navigate("/signup")}
    className="border border-green-500 text-green-700 font-bold rounded-lg py-2 text-base hover:bg-green-50 transition mb-2"
  >
    Sign Up
  </button>
  {/* Forgot Password (bottom left corner) */}
  <span
    className="absolute left-5 bottom-3 text-xs text-gray-400 hover:text-green-600 cursor-pointer"
    onClick={() => navigate("/forgot")}
  >
    Forgot password?
  </span>
</form>

    </div>
  );
}
