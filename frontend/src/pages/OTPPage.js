// src/pages/OTPPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import { FaShieldAlt, FaLock, FaGlobe, FaServer, FaExclamationCircle } from "react-icons/fa";

// --- NETWORK BACKGROUND (The "Slate/Blue" Corporate Version) ---
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

  // Generate a fake "Session ID" on mount to look technical
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
    <div className="min-h-screen font-sans bg-slate-900 relative flex flex-col">
      
      {/* --- COMPLIANCE HEADER --- */}
      <div className="bg-blue-950 text-slate-400 text-[10px] md:text-xs py-1 px-4 flex justify-between items-center border-b border-slate-800 z-50">
        <span className="flex items-center gap-2">
          <FaGlobe size={10} />
          <span className="font-mono">SECURE CONNECTION: NODE-SZ-04</span>
        </span>
        <span className="flex items-center gap-2">
          <FaLock size={10} />
          <span className="font-mono tracking-wider">SESSION ID: {sessionId}</span>
        </span>
      </div>

      <div className="flex-1 flex relative">
        {/* --- LEFT: TECHNICAL INFO (Desktop Only) --- */}
        <div className="hidden lg:flex w-7/12 relative bg-slate-900 items-center justify-center overflow-hidden border-r border-slate-800">
          <NetworkCanvas />
          <div className="relative z-10 p-12 max-w-xl">
             <div className="border border-blue-900/50 bg-slate-800/80 p-6 rounded backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4 text-blue-400">
                   <FaServer className="text-xl"/>
                   <h3 className="text-sm font-bold uppercase tracking-widest">Authentication Protocol</h3>
                </div>
                <div className="space-y-3 font-mono text-xs text-slate-400">
                   <p className="flex justify-between border-b border-slate-700 pb-1">
                      <span>Status:</span> <span className="text-amber-500">Awaiting Token</span>
                   </p>
                   <p className="flex justify-between border-b border-slate-700 pb-1">
                      <span>Encryption:</span> <span className="text-slate-200">AES-256-GCM</span>
                   </p>
                   <p className="flex justify-between border-b border-slate-700 pb-1">
                      <span>User Endpoint:</span> <span className="text-slate-200">{email}</span>
                   </p>
                   <p className="flex justify-between">
                      <span>Time Remaining:</span> <span className="text-slate-200">Session Valid</span>
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT: THE OTP TERMINAL --- */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50 relative">
          <div className="w-full max-w-sm">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-900 mb-4">
                 <FaShieldAlt size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Two-Factor Verification</h2>
              <p className="text-slate-500 text-xs mt-2 px-4">
                A 6-digit security token has been dispatched to the registered corporate email endpoint.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2">
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
                  className="block w-full text-center px-4 py-4 text-3xl font-mono tracking-[0.5em] bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all shadow-inner"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-red-600 text-xs bg-red-50 p-2 rounded border border-red-200 flex items-center justify-center gap-2">
                  <FaExclamationCircle />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all"
              >
                {loading ? "Verifying Token..." : "Authenticate Session"}
              </button>
            </form>

            <div className="mt-8 text-center">
               <p className="text-xs text-slate-400 mb-2">Token not received?</p>
               <button
                 onClick={handleResend}
                 disabled={resendCooldown > 0}
                 className={`text-xs font-bold uppercase tracking-wide ${
                   resendCooldown > 0 
                   ? "text-slate-400 cursor-not-allowed" 
                   : "text-blue-900 hover:underline"
                 }`}
               >
                 {resendCooldown > 0 ? `Retry in ${resendCooldown}s` : "Regenerate Token"}
               </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-6 w-full text-center">
             <p className="text-[10px] text-slate-300">Unauthorized access attempts are monitored.</p>
          </div>
        </div>
      </div>
    </div>
  );
}