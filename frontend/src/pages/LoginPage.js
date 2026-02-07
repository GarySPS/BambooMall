import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { FaShieldAlt, FaGlobe, FaLock, FaKey, FaBuilding, FaExclamationTriangle, FaCheckCircle, FaArrowRight } from "react-icons/fa";

// --- COMPONENT: ANIMATED NETWORK BACKGROUND (Unchanged) ---
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

// --- COMPONENT: STATS HUD (Unchanged) ---
const StatusHUD = () => (
  <div className="flex flex-row gap-3 mb-6 animate-pulse">
    <div className="flex-1 bg-slate-900 shadow-xl border border-slate-700/50 p-2.5 rounded flex items-center justify-between">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Manifests</span>
      <span className="text-sm text-slate-200 font-mono font-bold">14,209</span>
    </div>
    <div className="flex-1 bg-slate-900 shadow-xl border border-slate-700/50 p-2.5 rounded flex items-center justify-between">
      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Clearance Rate</span>
      <span className="text-sm text-emerald-400 font-mono font-bold">99.4%</span>
    </div>
  </div>
);

// --- MAIN LOGIN PAGE COMPONENT ---
export default function LoginPage() {
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
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
        throw new Error(data.error || `Server Error: ${res.statusText}`);
      }
      
      // --- SECURITY FIX START ---
      // We must save the token so api.js can use it for requests
      if (data.token) {
        localStorage.setItem("token", data.token);
      } else {
        console.warn("Security Warning: No token received from backend.");
      }
      // --- SECURITY FIX END ---

      login(data.user);
      
    } catch (err) {
      if (err.message === "Failed to fetch" || err.message.includes("NetworkError")) {
        setError("Uplink Failed: Unable to reach settlement server.");
      } else {
        setError(err.message); 
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50 relative flex flex-col overflow-hidden selection:bg-blue-500/30">
      <NetworkCanvas />
      
      {/* HEADER */}
      <div className="relative z-20 bg-slate-900 border-b border-slate-800 py-2 px-4 flex justify-between items-center text-[10px] md:text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <FaGlobe className="text-blue-500" />
          <span className="font-mono tracking-wide hidden sm:inline">SECURE GLOBAL GATEWAY // CN-SZ</span>
          <span className="font-mono tracking-wide sm:hidden">GATEWAY // CN-SZ</span>
        </span>
        <span className="flex items-center gap-2">
          <FaLock className="text-emerald-500" />
          <span className="font-mono tracking-wider">TLS 1.3 ENCRYPTED</span>
        </span>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        
        {/* LOGO */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-900 rounded-xl shadow-lg shadow-blue-900/20 mb-4 border border-blue-400/20">
            <FaBuilding className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Bamboo<span className="text-slate-500">Mall</span>
            <span className="align-top text-[10px] ml-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 font-mono">SCM</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium tracking-widest mt-2 uppercase">Factory Direct Liquidation Network</p>
        </div>

        {/* LOGIN CARD */}
        <div className="w-full max-w-md">
          <StatusHUD />

          <div className="bg-slate-900 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FaLock className="text-blue-400 text-sm" /> 
                Agent Access
              </h2>
              <p className="text-slate-400 text-xs mt-1">Authenticate credentials to view live inventory.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className={`space-y-1 transition-all duration-200 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Corporate ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FaBuilding className={`text-sm transition-colors ${focusedField === 'email' ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="text"
                    value={userOrEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setUserOrEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all font-mono"
                    placeholder="agent@corp.com"
                  />
                </div>
              </div>

              <div className={`space-y-1 transition-all duration-200 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FaKey className={`text-sm transition-colors ${focusedField === 'password' ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-800 transition-all font-mono tracking-widest"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex justify-end -mt-2">
                <button 
                  type="button" 
                  onClick={() => navigate("/forgot-password")}
                  className="text-[10px] text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-wider font-bold"
                >
                  Forgot Access Key?
                </button>
              </div>

              {error && (
                <div className="text-red-400 text-xs bg-red-900/20 p-3 rounded-lg border border-red-500/30 flex items-start gap-2 animate-pulse">
                  <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
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
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying Handshake...</span>
                    </>
                  ) : (
                    <>
                      <span>Initialize Session</span>
                      <FaCheckCircle className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-300" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500 mb-2">Unauthorized access is prohibited.</p>
              <button onClick={() => navigate("/signup")} className="text-blue-400 text-xs font-semibold hover:text-blue-300 transition-colors uppercase tracking-wider flex items-center justify-center gap-1 mx-auto">
                Request Vendor Whitelist <FaArrowRight />
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col items-center space-y-2">
             <div className="flex items-center gap-4 text-slate-500 font-semibold">
               <FaShieldAlt className="text-emerald-600" />
               <span className="text-[10px] uppercase tracking-widest">Verified Authentic Inventory</span>
             </div>
             <p className="text-[9px] text-slate-400 font-mono text-center max-w-xs">
               ICP 2024-889X | Shenzhen Municipal Commerce Bureau Reg.<br/>
               All connections are monitored for quality assurance.
             </p>
          </div>
        
        </div>
      </div>
    </div>
  );
}