// src/pages/ForgotPasswordPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { 
  FaGlobe,
  FaArrowRight, 
  FaShieldAlt,
  FaKey,
  FaExclamationTriangle,
  FaServer,
  FaBuilding,
  FaCheckCircle,
  FaLock // Added missing import
} from "react-icons/fa";

// --- NETWORK BACKGROUND (Milky White Theme) ---
const NetworkCanvas = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];
    let animationFrameId; 
    
    const getParticleCount = () => window.innerWidth < 768 ? 30 : 50;
    const connectionDistance = 120;
    const speed = 0.25; 

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
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
        // Dark particles for light background
        ctx.fillStyle = "rgba(148, 163, 184, 0.6)"; 
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      particles = [];
      const count = getParticleCount();
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
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
            ctx.strokeStyle = `rgba(71, 85, 105, ${0.15 - (distance / connectionDistance) * 0.1})`; 
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", () => {
      resize();
      init();
    });
    
    init();
    animate();
    
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-slate-50" />;
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
  const [focusedField, setFocusedField] = useState(null);

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
    <div className="min-h-screen font-sans bg-slate-50 relative flex flex-col overflow-y-auto selection:bg-blue-500/30">
      
      {/* 1. BACKGROUND */}
      <NetworkCanvas />

      {/* 2. HEADER - Dark Background for consistency */}
      <div className="relative z-20 bg-slate-900 border-b border-slate-800 py-2 px-4 flex justify-between items-center text-[10px] md:text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <FaGlobe className="text-blue-500" />
          <span className="font-mono">SECURE RECOVERY PROTOCOL: TLS 1.3</span>
        </span>
        <span className="flex items-center gap-2">
          <FaLock className="text-emerald-500" />
          <span className="font-mono tracking-wider">SYSTEM ID: RECOV-99</span>
        </span>
      </div>

      {/* 3. CONTENT */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 py-10 sm:p-6">
        
        {/* Title Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-900 rounded-lg shadow-lg shadow-blue-900/20 mb-3 border border-blue-400/20">
             <FaShieldAlt className="text-white text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recovery Terminal</h2>
          
          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2 mt-2">
             <span className={`h-1 w-8 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-slate-300"}`}></span>
             <span className={`h-1 w-8 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-slate-300"}`}></span>
             <span className={`h-1 w-8 rounded-full ${step >= 3 ? "bg-blue-600" : "bg-slate-300"}`}></span>
          </div>
        </div>

        {/* Card - DARK MODE */}
        <div className="w-full max-w-md bg-slate-900 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden group">
            
            {/* Decoration: Top shine */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>

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
                <div className={`space-y-1 transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Corporate ID / Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FaBuilding className={`text-sm transition-colors ${focusedField === 'email' ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="block w-full pl-10 pr-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all font-mono"
                      placeholder="agent@company.com"
                    />
                  </div>
                </div>
              )}

              {/* --- STEP 2: OTP INPUT --- */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 text-center">
                     Token dispatched to: <span className="font-mono font-bold text-white block mt-1">{email}</span>
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
                       className="block w-full text-center px-4 py-4 text-2xl font-mono tracking-[0.5em] bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all"
                       required
                       autoFocus
                      />
                  </div>
                </div>
              )}

              {/* --- STEP 3: NEW PASSWORD --- */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className={`space-y-1 transition-all duration-200 ${focusedField === 'newPass' ? 'scale-[1.01]' : ''}`}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Access Key</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <FaKey className={`text-sm transition-colors ${focusedField === 'newPass' ? 'text-blue-400' : 'text-slate-500'}`} />
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onFocus={() => setFocusedField('newPass')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all font-mono tracking-widest"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className={`space-y-1 transition-all duration-200 ${focusedField === 'confirmPass' ? 'scale-[1.01]' : ''}`}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Access Key</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <FaCheckCircle className={`text-sm transition-colors ${focusedField === 'confirmPass' ? 'text-blue-400' : 'text-slate-500'}`} />
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onFocus={() => setFocusedField('confirmPass')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="block w-full pl-10 pr-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all font-mono tracking-widest"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {(error || info) && (
                <div className={`text-xs p-3 rounded-lg border flex items-center gap-2 ${
                  error 
                    ? "bg-red-900/20 border-red-500/30 text-red-400" 
                    : "bg-blue-900/20 border-blue-500/30 text-blue-400"
                }`}>
                  {error && <FaExclamationTriangle className="flex-shrink-0" />}
                  {info && <FaServer className="flex-shrink-0" />}
                  <span>{error || info}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden flex items-center justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg shadow-blue-900/20 text-sm font-bold text-white bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all transform active:scale-[0.98]"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                <span className="relative z-10 flex items-center gap-2">
                   {loading ? (
                     <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                     </>
                   ) : (
                     <>
                       {step === 1 ? "Initiate Recovery" : step === 2 ? "Verify Token" : "Update Access Key"}
                       {!loading && <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                     </>
                   )}
                </span>
              </button>
            </form>

            {/* Footer Actions */}
            <div className="mt-6 pt-5 border-t border-white/5 text-center space-y-3">
               {step === 2 && (
                 <button
                   onClick={handleResendOtp}
                   disabled={resendCooldown > 0}
                   className={`text-xs font-bold uppercase tracking-wide block w-full ${
                      resendCooldown > 0 ? "text-slate-500 cursor-not-allowed" : "text-blue-400 hover:text-blue-300"
                   }`}
                 >
                    {resendCooldown > 0 ? `Retry in ${resendCooldown}s` : "Regenerate Token"}
                 </button>
               )}
               
               <button onClick={() => navigate("/login")} className="text-slate-500 text-xs font-semibold hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto uppercase tracking-wider">
                  Return to Login Terminal
               </button>
            </div>

        </div>

        {/* ICP Footer */}
        <div className="mt-8 text-center">
             <p className="text-[10px] text-slate-500 font-mono">
               BambooMall Supply Chain Management (Shenzhen) Co., Ltd.<br/>
               Unauthorized recovery attempts are logged.
             </p>
        </div>

      </div>
    </div>
  );
}