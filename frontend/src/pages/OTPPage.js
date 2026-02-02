// src/pages/OTPPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import { FaShieldAlt, FaLock, FaGlobe, FaExclamationCircle, FaServer, FaCheckCircle, FaArrowRight } from "react-icons/fa";

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

export default function OTPPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sessionId, setSessionId] = useState("");

  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "unknown_agent";

  useEffect(() => {
    const randomId = "SES-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    setSessionId(randomId);
  }, []);

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
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Token verification failed");

      if (data.user) {
         login(data.user);
         navigate("/");    
      } else {
         navigate("/login");
      }

    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResendCooldown(60);
    } catch (err) {
      setError(err.message);
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
          <span className="font-mono tracking-wide hidden sm:inline">SECURE GLOBAL GATEWAY // NODE-SZ-04</span>
          <span className="font-mono tracking-wide sm:hidden">NODE-SZ-04</span>
        </span>
        <span className="flex items-center gap-2">
          <FaLock className="text-emerald-500" />
          <span className="font-mono tracking-wider">SESSION: {sessionId}</span>
        </span>
      </div>

      {/* 3. CONTENT */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 py-10 sm:p-6">
        
        {/* Title Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-900 rounded-lg shadow-lg shadow-blue-900/20 mb-3 border border-blue-400/20">
             <FaShieldAlt className="text-white text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Two-Factor Verification</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
             A 6-digit security token has been dispatched to the registered endpoint.
          </p>
        </div>

        {/* Card - DARK MODE */}
        <div className="w-full max-w-md bg-slate-900 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden group">
            
            {/* Decoration: Top shine */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>

            {/* Technical Info Box (Inside the card for mobile) */}
            <div className="mb-6 bg-slate-800/50 border border-slate-700 rounded p-3 font-mono text-[10px] text-slate-400 space-y-1">
                 <p className="flex justify-between">
                   <span>STATUS:</span> <span className="text-amber-400 animate-pulse">AWAITING TOKEN</span>
                 </p>
                 <p className="flex justify-between">
                   <span>ENDPOINT:</span> <span className="text-slate-200 truncate max-w-[150px]">{email}</span>
                 </p>
                 <p className="flex justify-between">
                   <span>ENCRYPTION:</span> <span className="text-emerald-500">AES-256-GCM</span>
                 </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mb-3">
                  Enter Security Token
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000 000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="block w-full text-center px-4 py-4 text-3xl font-mono tracking-[0.5em] bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all shadow-inner"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs bg-red-900/20 p-3 rounded-lg border border-red-500/30 flex items-center justify-center gap-2 animate-pulse">
                  <FaExclamationCircle />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden flex items-center justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg shadow-blue-900/20 text-sm font-bold text-white bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all transform active:scale-[0.98]"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                <span className="flex items-center gap-2">
                   {loading ? "Verifying..." : "Authenticate Session"}
                   {!loading && <FaCheckCircle className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-300" />}
                </span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center">
               <button
                 onClick={handleResend}
                 disabled={resendCooldown > 0}
                 className={`text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 mx-auto ${
                   resendCooldown > 0 
                   ? "text-slate-500 cursor-not-allowed" 
                   : "text-blue-400 hover:text-blue-300 transition-colors"
                 }`}
               >
                 {resendCooldown > 0 ? (
                    <>Processing Request ({resendCooldown}s)</>
                 ) : (
                    <>Token not received? <span className="underline">Regenerate</span></>
                 )}
               </button>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center opacity-100">
             <p className="text-[10px] text-slate-500 font-mono">
               SESSION ID: {sessionId} <br/>
               Unauthorized access attempts are monitored and logged.
             </p>
        </div>

      </div>
    </div>
  );
}