// src/pages/OTPPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import { FaArrowRight } from "react-icons/fa";

// --- ANIMATED NETWORK BACKGROUND ---
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

export default function OTPPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

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
      const res = await fetch(`${API_BASE_URL}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Verification failed");

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
      const res = await fetch(`${API_BASE_URL}/users/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resend failed");
      setResendCooldown(60);
    } catch (err) {
      setError(err.message);
    }
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
        
        <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
          <NetworkCanvas />
          <div className="relative z-10 p-12 text-white max-w-lg text-center">
            
            {/* --- START UPDATE: Replaced Shield Icon with Logo & Brand Name --- */}
            <div className="flex flex-col items-center mb-8">
               <img 
                 src="/logo192.png" 
                 alt="BambooMall Logo" 
                 className="w-24 h-24 object-contain mb-5 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]"
               />
               <h1 className="text-5xl font-extrabold tracking-tight mb-2">
                 Bamboo<span className="text-emerald-500">Mall</span>
               </h1>
               <div className="text-lg font-semibold text-emerald-200/80 tracking-widest uppercase mt-2">
                 Security Check
               </div>
            </div>

            <p className="text-slate-300 text-lg leading-relaxed">
              We take your account security seriously.<br/>
              Please verify your identity to continue.
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 pointer-events-none" />
        </div>

        {/* --- MOBILE TOP: BRANDING AREA --- */}
        <div className="lg:hidden flex-shrink-0 flex flex-col justify-center items-center h-[30vh] p-8 text-center">
             {/* UPDATE: Reduced padding (p-3 -> p-2) and replaced Lock icon with Logo */}
             <div className="mb-4 p-2 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-white/20 animate-bounce-slow">
               <img 
                 src="/logo192.png" 
                 alt="BambooMall Logo" 
                 className="w-20 h-20 object-contain drop-shadow-lg" 
               />
             </div>
             
             <h1 className="text-3xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">
               Verify Identity
             </h1>
             <p className="text-emerald-200 text-sm font-medium tracking-wide opacity-80 max-w-xs mx-auto">
               Secure your BambooMall account.
             </p>
        </div>

        {/* --- RIGHT/BOTTOM: OTP FORM CARD --- */}
        <div className="flex-1 flex flex-col bg-white rounded-t-[2.5rem] lg:rounded-none shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.3)] lg:shadow-none overflow-hidden animate-slideUp">
          
          <div className="flex-1 flex flex-col justify-center px-8 py-10 lg:px-16 lg:py-12 max-w-md mx-auto w-full">
            
            {/* Desktop-only Header */}
            <div className="hidden lg:block text-center mb-8">
               <h2 className="text-3xl font-bold text-slate-900">Enter OTP Code</h2>
            </div>

            {/* Mobile-only Sub-header inside card */}
            <div className="lg:hidden text-center mb-8">
               <h2 className="text-2xl font-bold text-slate-900">Enter Code</h2>
            </div>

            <p className="text-center text-slate-500 text-sm mb-8">
               We sent a 6-digit code to <br/>
               <span className="font-bold text-slate-800 text-base">{email}</span>
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex justify-center group">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="block w-full text-center px-4 py-5 text-4xl font-mono tracking-[0.5em] bg-gray-50 border border-gray-100 rounded-2xl text-slate-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-sm hover:bg-gray-100/50"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center animate-pulse">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-emerald-500/30 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : (
                  <>
                    Verify & Login
                    <FaArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
               <p className="text-sm text-slate-400 mb-3">Didn't receive code?</p>
               <button
                 onClick={handleResend}
                 disabled={resendCooldown > 0}
                 className={`text-sm font-bold transition-colors ${
                    resendCooldown > 0 
                    ? "text-slate-400 cursor-not-allowed" 
                    : "text-emerald-600 hover:text-emerald-700 hover:underline"
                 }`}
               >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}