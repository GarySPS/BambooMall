// src/pages/SignupPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
// Added icons to match Login style + Eye toggles
import { 
  FaShieldAlt, 
  FaGlobeAsia, 
  FaCheckCircle, 
  FaLock, 
  FaUser, 
  FaEnvelope, 
  FaShoppingBag, 
  FaArrowRight,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

// --- ANIMATED NETWORK BACKGROUND (Optimized Version) ---
const NetworkCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, particles = [], animationFrameId;
    
    const particleCount = 35; 
    const connectionDistance = 150;

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
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
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
      particles = Array.from({ length: particleCount }, () => new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 0.5;
      particles.forEach((p, index) => {
        p.update();
        p.draw();
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distSq = (p.x - p2.x) ** 2 + (p.y - p2.y) ** 2;
          if (distSq < connectionDistance ** 2) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(16, 185, 129, ${1 - Math.sqrt(distSq) / connectionDistance})`;
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

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  
  // UX: Toggle visibility for passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Registration failed");
      
      navigate("/otp", { state: { email } });
      
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    // Outer Wrapper: Emerald-950 for Mobile, White for Desktop
    <div className="min-h-screen font-sans selection:bg-emerald-200 bg-emerald-950 lg:bg-white relative">
      
      {/* --- MOBILE BACKGROUND LAYER (Hidden on Desktop) --- */}
      <div className="lg:hidden fixed inset-0 z-0 w-full h-full">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-black opacity-90" />
         {/* Decorative shapes */}
         <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 animate-pulse" />
         <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-teal-400 rounded-full blur-[120px] opacity-10" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen lg:flex-row">
        
        {/* --- DESKTOP LEFT: ANIMATED CANVAS --- */}
        <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
          <NetworkCanvas />
          <div className="relative z-10 p-12 text-white max-w-lg">
            
            <div className="flex items-center gap-4 mb-4">
               <img 
                 src="/logo192.png" 
                 alt="BambooMall Logo" 
                 className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform duration-300"
               />
               <h1 className="text-4xl font-extrabold tracking-tight">Join Bamboo<span className="text-emerald-500">Mall</span></h1>
            </div>
            
            <h2 className="text-2xl font-bold mb-6 text-slate-200">Start Sourcing Direct.</h2>
            <div className="space-y-4 text-slate-300">
               <div className="flex items-center gap-3"><FaCheckCircle className="text-emerald-500 flex-shrink-0"/> <span>Access 50,000+ Factories</span></div>
               <div className="flex items-center gap-3"><FaCheckCircle className="text-emerald-500 flex-shrink-0"/> <span>Wholesale Pricing</span></div>
               <div className="flex items-center gap-3"><FaCheckCircle className="text-emerald-500 flex-shrink-0"/> <span>24/7 Logistics Support</span></div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 pointer-events-none" />
        </div>

        {/* --- MOBILE TOP: BRANDING AREA --- */}
        <div className="lg:hidden flex-shrink-0 flex flex-col justify-center items-center h-[30vh] p-8 text-center">
             <div className="mb-4 p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-white/20">
               <FaShoppingBag className="w-8 h-8 text-emerald-300" />
             </div>
             <h1 className="text-3xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">
               Create Account
             </h1>
             <p className="text-emerald-200 text-sm font-medium tracking-wide opacity-80 max-w-xs mx-auto">
               Join thousands of global resellers.
             </p>
        </div>

        {/* --- RIGHT/BOTTOM: SIGNUP FORM CARD --- */}
        <div className="flex-1 flex flex-col bg-white rounded-t-[2.5rem] lg:rounded-none shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.3)] lg:shadow-none overflow-hidden animate-slideUp">
          
          <div className="flex-1 flex flex-col justify-center px-8 py-10 lg:px-16 lg:py-12 max-w-md mx-auto w-full">
            
            <div className="mb-8 text-center lg:text-left hidden lg:block">
              <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
              <p className="mt-2 text-slate-500">Get started with your free business account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username Input */}
              <div className="space-y-2 group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Username / Business Name</label>
                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                    placeholder="Business Name"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2 group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2 group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
                    ) : (
                      <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2 group">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaCheckCircle className="h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="block w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirm ? (
                      <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
                    ) : (
                      <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
                    )}
                  </button>
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
                className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-emerald-500/30 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? "Creating Account..." : (
                  <>
                    Create Account
                    <FaArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <span onClick={() => navigate("/login")} className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer">
                Log In
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}