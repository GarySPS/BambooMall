// src/pages/SignupPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import { FaBuilding, FaGlobe, FaFileContract, FaLock, FaEnvelope, FaCheckCircle, FaArrowRight, FaShieldAlt } from "react-icons/fa";

// --- COMPONENT: ANIMATED NETWORK BACKGROUND (Matches Login Page) ---
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

// --- MAIN SIGNUP PAGE ---
export default function SignupPage() {
  const [username, setUsername] = useState(""); // Maps to Business Name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [license, setLicense] = useState(""); 
  const [focusedField, setFocusedField] = useState(null);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Access Keys do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Application failed");
      
      navigate("/otp", { state: { email } });
      
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50 relative flex flex-col overflow-y-auto selection:bg-blue-500/30">
      
      {/* 1. BACKGROUND */}
      <NetworkCanvas />

      {/* 2. HEADER - Dark Background for consistency with Login */}
      <div className="relative z-20 bg-slate-900 border-b border-slate-800 py-2 px-4 flex justify-between items-center text-[10px] md:text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <FaGlobe className="text-blue-500" />
          <span className="font-mono tracking-wide">VENDOR ONBOARDING // GLOBAL</span>
        </span>
        <span className="flex items-center gap-2">
          <FaShieldAlt className="text-emerald-500" />
          <span className="font-mono tracking-wider">KYC PROTOCOL ACTIVE</span>
        </span>
      </div>

      {/* 3. CONTENT */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 py-10 sm:p-6">
        
        {/* Title Section - Dark Text */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-900 rounded-lg shadow-lg shadow-blue-900/20 mb-3 border border-blue-400/20">
             <FaFileContract className="text-white text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Vendor Whitelist</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
            Due to export regulations, all new accounts require trade license verification.
          </p>
        </div>

        {/* Card - DARK MODE */}
        <div className="w-full max-w-md bg-slate-900 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden group">
            
            {/* Decoration: Top shine */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {/* Business Name */}
              <div className={`space-y-1 transition-all duration-200 ${focusedField === 'business' ? 'scale-[1.01]' : ''}`}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Registered Business Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FaBuilding className={`text-sm transition-colors ${focusedField === 'business' ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onFocus={() => setFocusedField('business')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all font-mono"
                    placeholder="e.g. Acme Imports LLC"
                  />
                </div>
              </div>

              {/* License (Fake Field) */}
              <div className={`space-y-1 transition-all duration-200 ${focusedField === 'license' ? 'scale-[1.01]' : ''}`}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Import License No. <span className="text-slate-600 lowercase font-normal">(optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FaGlobe className={`text-sm transition-colors ${focusedField === 'license' ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="text"
                    value={license}
                    onFocus={() => setFocusedField('license')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setLicense(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all font-mono"
                    placeholder="e.g. US-IMP-9920X"
                  />
                </div>
              </div>

              {/* Email */}
              <div className={`space-y-1 transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Procurement Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FaEnvelope className={`text-sm transition-colors ${focusedField === 'email' ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all font-mono"
                    placeholder="agent@company.com"
                  />
                </div>
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`space-y-1 transition-all duration-200 ${focusedField === 'pass' ? 'scale-[1.01]' : ''}`}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <FaLock className={`text-sm transition-colors ${focusedField === 'pass' ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <input
                        type="password"
                        required
                        value={password}
                        onFocus={() => setFocusedField('pass')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all font-mono tracking-widest"
                        placeholder="••••••••"
                    />
                    </div>
                </div>

                <div className={`space-y-1 transition-all duration-200 ${focusedField === 'confirm' ? 'scale-[1.01]' : ''}`}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Key</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <FaCheckCircle className={`text-sm transition-colors ${focusedField === 'confirm' ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <input
                        type="password"
                        required
                        value={confirm}
                        onFocus={() => setFocusedField('confirm')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all font-mono tracking-widest"
                        placeholder="••••••••"
                    />
                    </div>
                </div>
              </div>

              {error && (
                 <div className="text-red-400 text-xs bg-red-900/20 p-2.5 rounded-lg border border-red-500/30 flex items-start gap-2 animate-pulse">
                   <span>{error}</span>
                 </div>
              )}

              <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative group overflow-hidden flex items-center justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg shadow-blue-900/20 text-sm font-bold text-white bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all transform active:scale-[0.98]"
                >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                    <span className="flex items-center gap-2">
                    {loading ? "Verifying License..." : "Submit for Verification"}
                    {!loading && <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all translate-x-[-5px] group-hover:translate-x-0" />}
                    </span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center">
              <button
                onClick={() => navigate("/login")}
                className="text-slate-500 text-xs font-semibold hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                 Already verified? <span className="text-blue-400">Return to Login Terminal</span>
              </button>
            </div>
        </div>

        {/* Footer - Dark Text for light background */}
        <div className="mt-8 flex flex-col items-center space-y-2">
             <div className="flex items-center gap-4 text-slate-600 font-semibold">
               <FaShieldAlt className="text-emerald-700/70" />
               <span className="text-[10px] uppercase tracking-widest">Verified Authentic Inventory</span>
             </div>
             <p className="text-[9px] text-slate-600 font-mono text-center max-w-xs">
               ICP 2024-889X | Shenzhen Municipal Commerce Bureau Reg.<br/>
               All connections are monitored for quality assurance.
             </p>
        </div>

      </div>
    </div>
  );
}