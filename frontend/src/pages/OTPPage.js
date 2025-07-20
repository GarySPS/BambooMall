import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function OTPPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/users/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resend failed");
      setResendCooldown(60);
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
