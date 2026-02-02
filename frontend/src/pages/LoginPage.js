// src/pages/LoginPage.js

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { FaShieldAlt, FaGlobe, FaLock, FaKey, FaBuilding, FaExclamationTriangle } from "react-icons/fa";

// --- COMPONENT: ANIMATED NETWORK BACKGROUND (Modified for "Data Logistics" look) ---
const NetworkCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];
    let animationFrameId; 
    const particleCount = 45; 
    const connectionDistance = 120;
    const speed = 0.3; // Slower, heavier feel

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
        this.size = Math.random() * 1.5 + 0.5; // Smaller, precise dots
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
        ctx.fillStyle = "rgba(148, 163, 184, 0.5)"; // Slate-400
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
            // Blue-gray lines for corporate feel
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.5 - distance / connectionDistance})`;
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

// --- MAIN LOGIN PAGE COMPONENT ---
export default function LoginPage() {
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useUser(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.is_admin) navigate("/admin");
      else navigate("/");
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userOrEmail, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // If the server sends a specific error message, use it.
        // Otherwise, fallback to status text.
        throw new Error(data.error || `Server Error: ${res.statusText}`);
      }
      
      login(data.user);
      
    } catch (err) {
      // --- LOGIC: HANDLE CONNECTION ERRORS VS AUTH ERRORS ---
      
      // 1. Network / Server Down (Fetch failed to even reach the API)
      if (err.message === "Failed to fetch" || err.message.includes("NetworkError")) {
        setError("Uplink Failed: Unable to reach settlement server. Please try again later.");
      } 
      // 2. Specific Logic from Backend
      else {
        setError(err.message); 
      }
      
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen font-sans bg-slate-900 relative flex flex-col">
      
      {/* --- COMPLIANCE HEADER (The Banker Hook) --- */}
      <div className="bg-blue-950 text-slate-400 text-[10px] md:text-xs py-1 px-4 flex justify-between items-center border-b border-slate-800 z-50">
        <span className="flex items-center gap-2">
          <FaGlobe size={10} />
          <span className="font-mono">CROSS-BORDER SETTLEMENT: SAFE REG. 2026-CN-SZ APPLIES</span>
        </span>
        <span className="flex items-center gap-2">
          <FaLock size={10} />
          <span className="font-mono tracking-wider">TLS 1.3 ENCRYPTED // PORTAL ID: SZ-99</span>
        </span>
      </div>

      <div className="flex-1 flex relative">
        {/* --- LEFT: LOGISTICS VISUALS --- */}
        <div className="hidden lg:flex w-7/12 relative bg-slate-900 items-center justify-center overflow-hidden border-r border-slate-800">
          <NetworkCanvas />
          <div className="relative z-10 p-12 max-w-xl">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-blue-900/30 border border-blue-500/50 flex items-center justify-center rounded">
                  <FaBuilding className="text-blue-400 text-xl" />
               </div>
               <div>
                 <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Bamboo<span className="text-slate-400">Mall</span> <span className="text-xs align-top bg-slate-800 text-slate-400 px-1 py-0.5 rounded ml-1 font-mono">SCM</span></h1>
                 <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">Global Liquidation Network</p>
               </div>
            </div>

            <div className="space-y-6 text-slate-400 text-sm font-mono">
              <div className="flex items-start gap-4 p-4 bg-slate-800/50 border-l-2 border-blue-500">
                <FaShieldAlt className="mt-1 text-blue-500" />
                <div>
                  <h3 className="text-slate-200 font-bold mb-1">Restricted Access</h3>
                  <p>Authorized procurement agents only. All IP addresses are logged for settlement auditing.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/30 p-3 rounded border border-slate-700">
                    <span className="block text-xs text-slate-500 mb-1">Active Manifests</span>
                    <span className="text-xl text-slate-200 font-bold">14,209</span>
                </div>
                <div className="bg-slate-800/30 p-3 rounded border border-slate-700">
                    <span className="block text-xs text-slate-500 mb-1">Clearance Rate</span>
                    <span className="text-xl text-emerald-500 font-bold">99.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: THE LOGIN TERMINAL --- */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-50 relative">
          <div className="w-full max-w-sm">
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Agent Authentication</h2>
              <p className="text-slate-500 text-xs">Enter your Corporate ID to access the live manifest.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Corporate ID / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={userOrEmail}
                    onChange={(e) => setUserOrEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-all font-mono"
                    placeholder="agent@corp.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-all font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-xs bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                  <FaExclamationTriangle />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all"
              >
                {loading ? "Verifying Credentials..." : "Access Terminal"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-400 mb-2">New Procurement Partner?</p>
              <button onClick={() => navigate("/signup")} className="text-blue-900 text-sm font-bold hover:underline">
                Apply for Vendor Whitelist
              </button>
            </div>
          </div>

          {/* ICP Footer for the Banker */}
          <div className="absolute bottom-4 text-[10px] text-slate-400 text-center w-full px-6">
            <p>BambooMall Supply Chain Management (Shenzhen) Co., Ltd.</p>
            <p className="font-mono mt-1">ICP No. 2024-889X | Shenzhen Municipal Commerce Bureau Reg.</p>
          </div>
        </div>
      </div>
    </div>
  );
}