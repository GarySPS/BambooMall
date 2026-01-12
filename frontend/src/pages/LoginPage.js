// src/pages/LoginPage.js

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
// Added FaEnvelope, FaEye, FaEyeSlash, FaShoppingBag for the new design
import { FaShieldAlt, FaGlobeAsia, FaCheckCircle, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaShoppingBag, FaArrowRight } from "react-icons/fa";

// --- COMPONENT: ANIMATED NETWORK BACKGROUND (Unchanged) ---
const NetworkCanvas = () => {
  // ... [Keep your existing NetworkCanvas code exactly as is] ...
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];
    let animationFrameId; 
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
      ctx.lineWidth = 0.5;
      particles.forEach((p, index) => {
        p.update();
        p.draw();
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy; 
          if (distSq < 22500) {
            const distance = Math.sqrt(distSq);
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
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />;
};

// --- MAIN LOGIN PAGE COMPONENT (Updated) ---
export default function LoginPage() {
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Added for the new UI
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
    // Outer Wrapper: Uses Emerald-950 for Mobile background, White for Desktop
    <div className="min-h-screen font-sans selection:bg-emerald-200 bg-emerald-950 lg:bg-white relative">
      
      {/* --- MOBILE BACKGROUND LAYER (Hidden on Desktop) --- */}
      <div className="lg:hidden fixed inset-0 z-0 w-full h-full">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-black opacity-90" />
         {/* Decorative shapes */}
         <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 animate-pulse" />
         <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-teal-400 rounded-full blur-[120px] opacity-10" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen lg:flex-row">
        
        {/* --- DESKTOP LEFT: ANIMATED CANVAS (Your original desktop view) --- */}
        <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
          <NetworkCanvas />
          <div className="relative z-10 p-12 text-white max-w-lg">
            
            <div className="flex items-center gap-4 mb-6">
               <img 
                 src="/logo192.png" 
                 alt="BambooMall Logo" 
                 className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform duration-300"
               />
               <h1 className="text-4xl font-extrabold tracking-tight">
                 Bamboo<span className="text-emerald-500">Mall</span>
               </h1>
            </div>

            <h2 className="text-3xl font-bold mb-6 leading-tight">
              The World's Factory, <br/> 
              <span className="text-emerald-400">Direct to Your Door.</span>
            </h2>
            <div className="space-y-4 text-slate-300 text-lg">
              <div className="flex items-center gap-3"><FaCheckCircle className="text-emerald-500" /><span>Verified Direct Manufacturers</span></div>
              <div className="flex items-center gap-3"><FaGlobeAsia className="text-emerald-500" /><span>Global Logistics Handling</span></div>
              <div className="flex items-center gap-3"><FaShieldAlt className="text-emerald-500" /><span>Escrow Payment Protection</span></div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-700 text-sm text-slate-400">
              <p>"BambooMall revolutionized how we source products. The margins are unbeatable."</p>
              <p className="mt-2 font-bold text-slate-200">— Global Resellers Assoc.</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 pointer-events-none" />
        </div>

        {/* --- MOBILE TOP: BRANDING AREA (New Premium Look) --- */}
        <div className="lg:hidden flex-shrink-0 flex flex-col justify-center items-center h-[35vh] p-8 text-center">
             {/* UPDATE: Reduced padding (p-4 -> p-2) and increased image size */}
             <div className="mb-6 p-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-white/20 transform transition-transform hover:scale-105 duration-500">
               <img 
                 src="/logo192.png" 
                 alt="BambooMall Logo" 
                 className="w-20 h-20 object-contain drop-shadow-lg" 
               />
             </div>
             
             <h1 className="text-4xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">
               Bamboo<span className="text-emerald-400">Mall</span>
             </h1>
             <p className="text-emerald-200 text-sm font-medium tracking-wide opacity-80 max-w-xs mx-auto">
               Premium shopping, delivered to your door.
             </p>
        </div>

        {/* --- RIGHT/BOTTOM: LOGIN FORM CARD (Unified) --- */}
        {/* On mobile: Rounded top corners, slides up over background. On Desktop: Full height white side. */}
        <div className="flex-1 flex flex-col bg-white rounded-t-[2.5rem] lg:rounded-none shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.3)] lg:shadow-none overflow-hidden animate-slideUp lg:animate-none">
          
          <div className="flex-1 flex flex-col justify-center px-8 py-10 lg:px-16 lg:py-12 max-w-md mx-auto w-full">
            
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-500 text-sm">Sign in to manage your orders and shipments.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="space-y-2 group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email or Username</label>
                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={userOrEmail}
                    onChange={(e) => setUserOrEmail(e.target.value)}
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-sm hover:bg-gray-100/50"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2 group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-sm hover:bg-gray-100/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
                    )}
                  </button>
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
                      Remember me
                    </label>
                  </div>
                  <div onClick={() => navigate("/forgot")} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer">
                    Forgot Password?
                  </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center animate-pulse">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-emerald-500/30 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    Sign In
                    <FaArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <span onClick={() => navigate("/signup")} className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer">
                Sign up
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}