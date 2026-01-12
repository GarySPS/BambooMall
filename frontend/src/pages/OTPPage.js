// src/pages/OTPPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { API_BASE_URL } from "../config";
import { FaShieldAlt } from "react-icons/fa";

// --- REUSED: ANIMATED NETWORK BACKGROUND ---
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
         // Important: If data.token exists, you might want to save it to localStorage here too
         // localStorage.setItem('token', data.token);
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
    <div className="min-h-screen flex font-sans text-slate-800 bg-white">
      {/* LEFT SIDE: Canvas */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <NetworkCanvas />
        <div className="relative z-10 p-12 text-white max-w-lg text-center">
          <div className="inline-flex p-4 rounded-full bg-emerald-900/50 mb-6 backdrop-blur-sm border border-emerald-500/30">
            <FaShieldAlt className="text-4xl text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Security Check</h1>
          <p className="text-slate-300">We take your account security seriously.<br/>Please verify your identity to continue.</p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 pointer-events-none" />
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white relative">
         {/* Mobile Header */}
         <div className="lg:hidden absolute top-8 text-center">
           <span className="text-2xl font-extrabold tracking-tight">Bamboo<span className="text-emerald-600">Mall</span></span>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Enter OTP Code</h2>
            <p className="mt-4 text-slate-500 text-sm">
              We sent a 6-digit code to <br/>
              <span className="font-bold text-slate-800 text-base">{email}</span>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="flex justify-center">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                className="block w-full text-center px-4 py-4 text-3xl font-mono tracking-[0.5em] border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm placeholder:tracking-widest"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </form>

          <div className="text-center">
             <p className="text-sm text-slate-500 mb-2">Didn't receive code?</p>
             <button
               onClick={handleResend}
               disabled={resendCooldown > 0}
               className={`font-semibold text-emerald-600 hover:text-emerald-700 hover:underline ${resendCooldown > 0 ? "opacity-50 cursor-not-allowed no-underline" : ""}`}
             >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}