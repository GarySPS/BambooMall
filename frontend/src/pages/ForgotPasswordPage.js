import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  // Countdown for resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP
  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep(2);
      setInfo("OTP sent! Check your email.");
      setResendCooldown(60);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setStep(3);
      setInfo("OTP verified. Set your new password.");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // Step 2: Resend OTP
  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    setError("");
    setInfo("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resend failed");
      setInfo("OTP resent! Check your email.");
      setResendCooldown(60);
    } catch (err) {
      setError(err.message);
    }
  }

  // Step 3: Reset Password
  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp_code: otp,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setInfo("Password changed! You may now log in.");
      setTimeout(() => navigate("/login"), 1200);
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
        className="bg-white shadow-2xl rounded-2xl px-5 py-7 max-w-xs w-full flex flex-col gap-4"
        onSubmit={
          step === 1
            ? handleSendOtp
            : step === 2
            ? handleVerifyOtp
            : handleResetPassword
        }
      >
        <h2 className="text-2xl font-extrabold text-green-700 mb-1 tracking-wide text-center">
          Forgot Password
        </h2>

        {/* Step 1: Email */}
        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border rounded-lg px-3 py-2 text-base"
              required
              autoFocus
            />
            <button
              type="submit"
              className="bg-green-600 text-white font-bold rounded-lg py-2 text-base hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <div className="text-center text-xs text-gray-500 mt-1">
              Back to{" "}
              <span
                className="text-green-700 hover:underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </div>
          </>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <>
            <div className="text-center text-gray-600 text-xs mb-1">
              Please enter the 6-digit code sent to
              <br />
              <span className="font-bold text-green-800">{email}</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              className="border rounded-lg px-3 py-2 text-base text-center tracking-widest font-mono"
              required
              autoFocus
            />
            <button
              type="submit"
              className="bg-green-600 text-white font-bold rounded-lg py-2 text-base hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <div className="text-center text-xs text-gray-500 mt-1">
              Didn't get the code?{" "}
              <span
                onClick={handleResendOtp}
                className={`text-green-700 hover:underline cursor-pointer ${
                  resendCooldown > 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend"}
              </span>
            </div>
            <div className="text-center text-xs text-gray-500 mt-1">
              <span
                className="text-green-700 hover:underline cursor-pointer"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setInfo("");
                }}
              >
                Back to Email
              </span>
            </div>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="border rounded-lg px-3 py-2 text-base"
              minLength={6}
              required
              autoFocus
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="border rounded-lg px-3 py-2 text-base"
              minLength={6}
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white font-bold rounded-lg py-2 text-base hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? "Saving..." : "Change Password"}
            </button>
          </>
        )}

        {(error || info) && (
          <div
            className={`text-xs text-center rounded py-2 px-2 ${
              error
                ? "bg-red-100 text-red-600"
                : "bg-green-50 text-green-700"
            }`}
          >
            {error || info}
          </div>
        )}
      </form>
    </div>
  );
}
