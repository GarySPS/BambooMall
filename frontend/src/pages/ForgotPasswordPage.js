// src/pages/ForgotPasswordPage.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { 
  FaLock, 
  FaEnvelope, 
  FaArrowRight, 
  FaCheckCircle, 
  FaEye, 
  FaEyeSlash
} from "react-icons/fa";

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

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Password visibility toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP
  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep(2);
      setInfo("OTP sent! Check your email.");
      setResendCooldown(60);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setStep(3);
      setInfo("OTP verified. Set your new password.");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  // Resend OTP Logic
  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    setError("");
    setInfo("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resend failed");
      setInfo("OTP resent! Check your email.");
      setResendCooldown(60);
    } catch (err) {
      setError(err.message);
    }
  }

  // Step 3: Reset Password
  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp_code: otp,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setInfo("Password changed! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false); // Stop loading only on error so success state persists briefly
    }
  }

  return (
    // Outer Wrapper: Emerald-950 for Mobile, White for Desktop
    <div className="min-h-screen font-sans selection:bg-emerald-200 bg-emerald-950 lg:bg-white relative">
      
      {/* --- MOBILE BACKGROUND LAYER --- */}
      <div className="lg:hidden fixed inset-0 z-0 w-full h-full">
         <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-black opacity-90" />
         <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 animate-pulse" />
         <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-teal-400 rounded-full blur-[120px] opacity-10" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen lg:flex-row">
        
        {/* --- DESKTOP LEFT: ANIMATED CANVAS --- */}
        <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
          <NetworkCanvas />
          <div className="relative z-10 p-12 text-white max-w-lg text-center">
            
            <div className="flex flex-col items-center mb-8">
               <img 
                 src="/logo192.png" 
                 alt="BambooMall Logo" 
                 className="w-24 h-24 object-contain mb-5 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]"
               />
               <h1 className="text-5xl font-extrabold tracking-tight mb-2">
                 Bamboo<span className="text-emerald-500">Mall</span>
               </h1>
            </div>

            <h1 className="text-4xl font-bold mb-4">Forgot Password?</h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Don't worry, it happens to the best of us.<br/>
              Follow the steps to recover your account.
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
               Recovery
             </h1>
             <p className="text-emerald-200 text-sm font-medium tracking-wide opacity-80 max-w-xs mx-auto">
               Reset your BambooMall password.
             </p>
        </div>

        {/* --- RIGHT/BOTTOM: FORM CARD --- */}
        <div className="flex-1 flex flex-col bg-white rounded-t-[2.5rem] lg:rounded-none shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.3)] lg:shadow-none overflow-hidden animate-slideUp">
          
          <div className="flex-1 flex flex-col justify-center px-8 py-10 lg:px-16 lg:py-12 max-w-md mx-auto w-full">
            
            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
               <h2 className="text-3xl font-bold text-slate-900">Reset Password</h2>
               <p className="mt-2 text-slate-500">Step {step} of 3</p>
            </div>

            <form 
              className="space-y-6"
              onSubmit={
                step === 1 ? handleSendOtp : 
                step === 2 ? handleVerifyOtp : 
                handleResetPassword
              }
            >
              
              {/* --- STEP 1: EMAIL INPUT --- */}
              {step === 1 && (
                <div className="space-y-2 group animate-fadeIn">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>
              )}

              {/* --- STEP 2: OTP INPUT --- */}
              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <p className="text-center text-sm text-slate-500">
                    Enter the code sent to <span className="font-bold text-slate-800">{email}</span>
                  </p>
                  <div className="flex justify-center group">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="block w-full text-center px-4 py-5 text-4xl font-mono tracking-[0.5em] bg-gray-50 border border-gray-100 rounded-2xl text-slate-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="text-center text-xs">
                    <span 
                       onClick={() => { setStep(1); setOtp(""); setError(""); }}
                       className="text-slate-400 hover:text-slate-600 cursor-pointer underline"
                    >
                      Change Email
                    </span>
                  </div>
                </div>
              )}

              {/* --- STEP 3: NEW PASSWORD --- */}
              {step === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  {/* New Password */}
                  <div className="space-y-2 group">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="block w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showNewPassword ? <FaEyeSlash className="text-gray-400"/> : <FaEye className="text-gray-400"/>}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2 group">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaCheckCircle className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="block w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                         {showConfirmPassword ? <FaEyeSlash className="text-gray-400"/> : <FaEye className="text-gray-400"/>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {(error || info) && (
                <div className={`text-sm p-3 rounded-lg border text-center animate-pulse ${
                  error ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                }`}>
                  {error || info}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-emerald-500/30 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                   <span className="flex items-center">
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Processing...
                   </span>
                ) : (
                  <>
                    {step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Reset Password"}
                    <FaArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Actions */}
            <div className="mt-8 text-center space-y-4">
               {step === 2 && (
                 <button
                   onClick={handleResendOtp}
                   disabled={resendCooldown > 0}
                   className={`text-sm font-bold transition-colors ${
                      resendCooldown > 0 ? "text-slate-400 cursor-not-allowed" : "text-emerald-600 hover:text-emerald-700 hover:underline"
                   }`}
                 >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
                 </button>
               )}
               
               <div>
                  <span onClick={() => navigate("/login")} className="text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer hover:underline">
                    Back to Login
                  </span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}