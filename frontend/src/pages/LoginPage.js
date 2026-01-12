// src/pages/LoginPage.js

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { FaShieldAlt, FaGlobeAsia, FaCheckCircle, FaLock } from "react-icons/fa";

// --- COMPONENT: ANIMATED NETWORK BACKGROUND (Optimized) ---
const NetworkCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];
    let animationFrameId; // To track and stop animation

    // OPTIMIZATION: Reduced from 60 to 35 for better performance
    const particleCount = 35; 
    const connectionDistance = 150;
    const speed = 0.5;

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
        this.size = Math.random() * 2 + 1;
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
        ctx.fillStyle = "rgba(16, 185, 129, 0.6)"; 
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
      
      // Optimization: Set line style once per frame instead of per line
      ctx.lineWidth = 0.5;
      
      particles.forEach((p, index) => {
        p.update();
        p.draw();
        
        // Draw connections
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy; // Distance squared avoids slow Math.sqrt
          
          // 150 * 150 = 22500
          if (distSq < 22500) {
            const distance = Math.sqrt(distSq); // Only calculate sqrt if needed for opacity
            ctx.beginPath();
            ctx.strokeStyle = `rgba(16, 185, 129, ${1 - distance / connectionDistance})`;
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

    // CLEANUP: Stop animation when component unmounts
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />;
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

    const cleanInput = userOrEmail.trim();

    if (!cleanInput || !password) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanInput, password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Login failed");
      
      login(data.user);
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex font-sans text-slate-800 bg-white">
      
      {/* --- LEFT SIDE: ANIMATED CANVAS --- */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <NetworkCanvas />
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-900/50">B</div>
             <h1 className="text-4xl font-extrabold tracking-tight">Bamboo<span className="text-emerald-500">Mall</span></h1>
          </div>
          
          <h2 className="text-3xl font-bold mb-6 leading-tight">
            The World's Factory, <br/> 
            <span className="text-emerald-400">Direct to Your Door.</span>
          </h2>
          
          <div className="space-y-4 text-slate-300 text-lg">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-emerald-500" />
              <span>Verified Direct Manufacturers</span>
            </div>
            <div className="flex items-center gap-3">
              <FaGlobeAsia className="text-emerald-500" />
              <span>Global Logistics Handling</span>
            </div>
            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-emerald-500" />
              <span>Escrow Payment Protection</span>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-700 text-sm text-slate-400">
            <p>"BambooMall revolutionized how we source products. The margins are unbeatable."</p>
            <p className="mt-2 font-bold text-slate-200">— Global Resellers Assoc.</p>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 pointer-events-none" />
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 text-center">
           <span className="text-2xl font-extrabold tracking-tight">Bamboo<span className="text-emerald-600">Mall</span></span>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-slate-500">Sign in to manage your orders and shipments.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-5">
              
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email or Username</label>
                <input
                  type="text"
                  required
                  value={userOrEmail}
                  onChange={(e) => setUserOrEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                  placeholder="name@company.com"
                />
              </div>
              
              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <FaLock className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
                  Keep me logged in
                </label>
              </div>

              <div className="text-sm">
                <span onClick={() => navigate("/forgot")} className="font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in to account"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
             <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-slate-200"></div>
             </div>
             <div className="relative flex justify-center text-sm">
               <span className="px-4 bg-white text-slate-500">New to BambooMall?</span>
             </div>
          </div>

          <button 
             onClick={() => navigate("/signup")}
             className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-lg bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
           >
             Create Business Account
           </button>
          
          <div className="pt-8 text-center text-xs text-slate-400 flex justify-center gap-6">
             <span onClick={() => navigate("/terms")} className="cursor-pointer hover:text-emerald-600 transition">Terms</span>
             <span onClick={() => navigate("/privacy")} className="cursor-pointer hover:text-emerald-600 transition">Privacy</span>
             <span onClick={() => navigate("/cookies")} className="cursor-pointer hover:text-emerald-600 transition">Cookies</span>
          </div>

        </div>
      </div>
    </div>
  );
}