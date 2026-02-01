// src/pages/ForgotPasswordPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { 
  FaLock, 
  FaGlobe,
  FaArrowRight, 
  FaShieldAlt,
  FaKey,
  FaExclamationTriangle,
  FaServer
} from "react-icons/fa";

// --- NETWORK BACKGROUND (Corporate Slate Version) ---
const NetworkCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];
    let animationFrameId; 
    const particleCount = 40; 
    const connectionDistance = 120;
    const speed = 0.3;

    const resize = () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
      }
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.size = Math.random() * 1.5 + 0.5; 
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(148, 163, 184, 0.5)"; 
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 0.5;
      particles.forEach((p, index) => {
        p.update();
        p.draw();
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy; 
          if (distSq < 15000) {
            const distance = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.4 - distance / connectionDistance})`;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    init();
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 bg-slate-900" />;
};

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
      if (!res.ok) throw new Error(data.error || "Failed to initiate recovery protocol");
      setStep(2);
      setInfo("Security Token Dispatched to Corporate Email.");
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
      if (!res.ok) throw new Error(data.error || "Token Invalid");
      setStep(3);
      setInfo("Token Verified. Initialize New Access Key.");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // Resend OTP Logic
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
      setInfo("Token regenerated.");
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
      setError("Security Policy Violation: Key too short.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Key Mismatch Error.");
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
      setInfo("Access Key Updated. Redirecting to Terminal...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false); 
    }
  }

  return (
    <div className="min-h-screen font-sans bg-slate-900 relative flex flex-col">
      
      {/* --- COMPLIANCE HEADER --- */}
      <div className="bg-blue-950 text-slate-400 text-[10px] md:text-xs py-1 px-4 flex justify-between items-center border-b border-slate-800 z-50">
        <span className="flex items-center gap-2">
          <FaGlobe size={10} />
          <span className="font-mono">SECURE RECOVERY PROTOCOL: TLS 1.3</span>
        </span>
        <span className="flex items-center gap-2">
          <FaLock size={10} />
          <span className="font-mono tracking-wider">SYSTEM ID: RECOV-99</span>
        </span>
      </div>

      <div className="flex-1 flex relative">
        {/* --- LEFT: TECHNICAL VISUALS --- */}
        <div className="hidden lg:flex w-7/12 relative bg-slate-900 items-center justify-center overflow-hidden border-r border-slate-800">
          <NetworkCanvas />
          <div className="relative z-10 p-12 max-w-xl">
             <div className="border border-red-900/30 bg-slate-800/80 p-6 rounded backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4 text-red-400">
                   <FaShieldAlt className="text-xl"/>
                   <h3 className="text-sm font-bold uppercase tracking-widest">Credential Recovery</h3>
                </div>
                <div className="space-y-3 font-mono text-xs text-slate-400">
                   <p className="flex justify-between border-b border-slate-700 pb-1">
                      <span>Protocol:</span> <span className="text-slate-200">OAuth-Reset</span>
                   </p>
                   <p className="flex justify-between border-b border-slate-700 pb-1">
                      <span>Target:</span> <span className="text-slate-200">Access Key Rotation</span>
                   </p>
                   <div className="mt-4 p-2 bg-slate-900/50 rounded text-slate-500 italic">
                      "Unauthorized recovery attempts are logged and reported to SCM Compliance."
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT: THE FORM TERMINAL --- */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50 relative">
          <div className="w-full max-w-sm">
            
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Recovery Terminal</h2>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                 <span className={`px-2 py-0.5 rounded ${step >= 1 ? "bg-blue-900 text-white" : "bg-slate-200"}`}>ID</span>
                 <FaArrowRight size={10} />
                 <span className={`px-2 py-0.5 rounded ${step >= 2 ? "bg-blue-900 text-white" : "bg-slate-200"}`}>TOKEN</span>
                 <FaArrowRight size={10} />
                 <span className={`px-2 py-0.5 rounded ${step >= 3 ? "bg-blue-900 text-white" : "bg-slate-200"}`}>NEW KEY</span>
              </div>
            </div>

            <form 
              className="space-y-6"
              onSubmit={
                step === 1 ? handleSendOtp : 
                step === 2 ? handleVerifyOtp : 
                handleResetPassword
              }
            >
              
              {/* --- STEP 1: EMAIL INPUT --- */}
              {step === 1 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Corporate ID / Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="block w-full px-4 py-3 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-all font-mono"
                    placeholder="agent@company.com"
                  />
                </div>
              )}

              {/* --- STEP 2: OTP INPUT --- */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-900">
                    Token dispatched to: <span className="font-mono font-bold">{email}</span>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center block">Enter Security Token</label>
                     <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000 000"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="block w-full text-center px-4 py-4 text-2xl font-mono tracking-[0.5em] bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all"
                      required
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* --- STEP 3: NEW PASSWORD --- */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Access Key</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaKey className="text-slate-400 text-xs" />
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="block w-full pl-9 px-4 py-3 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-all font-mono"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirm Access Key</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaKey className="text-slate-400 text-xs" />
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="block w-full pl-9 px-4 py-3 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-all font-mono"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {(error || info) && (
                <div className={`text-xs p-2 rounded border flex items-center gap-2 ${
                  error ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-blue-700"
                }`}>
                  {error && <FaExclamationTriangle />}
                  {info && <FaServer />}
                  {error || info}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all uppercase tracking-wide"
              >
                {loading ? "Processing..." : (
                  <>
                    {step === 1 ? "Initiate Recovery" : step === 2 ? "Verify Token" : "Update Access Key"}
                  </>
                )}
              </button>
            </form>

            {/* Footer Actions */}
            <div className="mt-8 text-center space-y-4 pt-6 border-t border-slate-200">
               {step === 2 && (
                 <button
                   onClick={handleResendOtp}
                   disabled={resendCooldown > 0}
                   className={`text-xs font-bold uppercase tracking-wide ${
                      resendCooldown > 0 ? "text-slate-400 cursor-not-allowed" : "text-blue-900 hover:underline"
                   }`}
                 >
                    {resendCooldown > 0 ? `Retry in ${resendCooldown}s` : "Regenerate Token"}
                 </button>
               )}
               
               <div>
                  <button onClick={() => navigate("/login")} className="text-xs font-bold text-slate-500 hover:text-blue-900 uppercase tracking-wide">
                    Return to Login Terminal
                  </button>
               </div>
            </div>

          </div>
          
          {/* ICP Footer */}
          <div className="absolute bottom-4 text-[10px] text-slate-400 text-center w-full px-6">
            <p>BambooMall Supply Chain Management (Shenzhen) Co., Ltd.</p>
          </div>
        </div>
      </div>
    </div>
  );
}