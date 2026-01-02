//src>pages>AboutUsPage.js

import React, { useState } from "react";
import {
  FaShieldAlt,
  FaIndustry,
  FaGlobeAsia,
  FaMedal,
  FaChartBar,
  FaUserFriends,
  FaBuilding,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaTelegramPlane,
  FaMapMarkerAlt
} from "react-icons/fa";
import CertAwards from "../components/CertAwards";

export default function AboutUsPage() {
  const [tab, setTab] = useState("about");

  return (
    <div className="min-h-screen w-full bg-[#151516] text-gray-100 font-sans relative overflow-x-hidden selection:bg-emerald-500/30 pb-24">
      
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          background: `url('/balance.png') center top / cover no-repeat` 
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/80 via-[#151516]/90 to-[#151516] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto pt-16 px-4">
        
        {/* Header / Tabs */}
        <div className="flex flex-col items-center mb-10">
           <h1 className="text-4xl md:text-5xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 tracking-wide mb-8 drop-shadow-sm text-center">
             BAMBOOMALL
           </h1>

           <div className="flex p-1 bg-zinc-800/80 backdrop-blur-md rounded-xl border border-white/5 shadow-lg">
             {['about', 'contact'].map((t) => (
               <button
                 key={t}
                 onClick={() => setTab(t)}
                 className={`py-2 px-8 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                   tab === t 
                     ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20" 
                     : "text-zinc-400 hover:text-white hover:bg-white/5"
                 }`}
               >
                 {t}
               </button>
             ))}
           </div>
        </div>

        {/* --- About Tab --- */}
        {tab === "about" && (
          <div className="animate-fade-in flex flex-col gap-8">
            
            {/* Intro Card */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400"></div>
               <h2 className="text-2xl font-bold text-white mb-4">The New Standard for B2B Sourcing</h2>
               <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl mx-auto">
                 <strong className="text-emerald-400">BambooMall</strong> connects entrepreneurs directly to Asia’s most trusted factories. 
                 We remove the barriers, risks, and middlemen, giving you transparent access to the supply chain.
               </p>
            </div>

            {/* Certificate Section - UPDATED TO LIGHT PREMIUM CARD for Maximum Visibility */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-yellow-400/50 shadow-[0_0_40px_rgba(250,204,21,0.15)] group bg-gradient-to-b from-white to-orange-50">
               {/* Light Background Texture */}
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('/certi.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)' }}></div>
               
               <div className="relative z-10 p-8 min-h-[380px] flex flex-col items-center justify-center">
                  {/* Container for awards - Dark text inside CertAwards will show up perfectly on this light bg */}
                  <div className="w-full filter drop-shadow-sm">
                     <CertAwards />
                  </div>
                  
                  <div className="mt-8 text-center">
                    <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-yellow-600/30 text-yellow-800 text-xs font-bold uppercase tracking-widest shadow-lg">
                      <FaMedal className="text-yellow-600" /> Officially Audited & Licensed
                    </span>
                  </div>
               </div>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
               {[
                 { icon: <FaShieldAlt />, title: "Licensed & Audited", desc: "Operated under BambooMall Commerce (Shenzhen). Every supplier is verified for legal status." },
                 { icon: <FaIndustry />, title: "Factory Direct", desc: "No brokers, no markups. Real prices directly from the manufacturer floor." },
                 { icon: <FaGlobeAsia />, title: "Global Access", desc: "Low MOQs (5+ units). Perfect for resellers, TikTok shops, and new brands." },
                 { icon: <FaMedal />, title: "Quality Inspected", desc: "Every single shipment passes our in-house checks before export." },
                 { icon: <FaChartBar />, title: "All-in-One Dashboard", desc: "Track orders, wallet, and membership tiers in one transparent view." },
                 { icon: <FaUserFriends />, title: "Private Support", desc: "Confidential, multi-language support whenever you need it." }
               ].map((item, idx) => (
                 <div key={idx} className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:bg-zinc-800/60 transition-colors group">
                    <div className="text-3xl text-emerald-500 mb-4 bg-emerald-500/10 w-fit p-3 rounded-xl group-hover:scale-110 transition-transform">{item.icon}</div>
                    <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>

            {/* Vision Block */}
            <div className="bg-gradient-to-br from-emerald-900/20 to-zinc-900 border border-emerald-500/20 rounded-3xl p-8 text-center relative overflow-hidden">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
               <h3 className="text-xl font-bold text-emerald-400 mb-4 tracking-tight uppercase">Our Vision</h3>
               <p className="text-zinc-300 text-lg font-light leading-relaxed">
                 We believe the next era of global business is powered by direct connection and real trust.
                 <br/><br/>
                 <span className="font-bold text-white">BambooMall bridges Asia’s real factories with the new generation of global sellers. Fast. Reliable. Personal.</span>
               </p>
            </div>

            {/* Footer / Company Details */}
            <div className="text-center space-y-4 pt-4 border-t border-white/5">
               <div className="inline-flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest font-bold">
                 <FaBuilding /> BambooMall Commerce (Shenzhen) Ltd.
               </div>
               <p className="text-xs text-zinc-600 font-mono max-w-lg mx-auto leading-relaxed">
                 Room 501, Building 3, No. 1188, Nanshan Avenue, Nanshan District, Shenzhen, China 518052
                 <br/>
                 <span className="opacity-70">Lic: 91440300MA5FP7W02K | VAT: 440300112233445</span>
               </p>
               <p className="text-[10px] text-zinc-700 italic">
                 *All products displayed are for demo purposes.
               </p>
            </div>

          </div>
        )}

        {/* --- Contact Tab --- */}
        {tab === "contact" && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-2 text-center">Get in Touch</h2>
              <p className="text-zinc-400 text-center mb-8">
                Commercial cooperation, partnerships, or support.<br/>
                <span className="text-emerald-400 font-bold">8am – 10pm (GMT+6:30) • Mon-Sat</span>
              </p>

              <div className="space-y-4">
                <a
                  href="https://wa.me/8613800138000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-1"
                >
                  <FaWhatsapp className="text-2xl" /> WhatsApp Support
                </a>
                
                <a
                  href="https://t.me/bamboomall_support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1"
                >
                  <FaTelegramPlane className="text-2xl" /> Telegram Chat
                </a>

                <a
                  href="mailto:support@bamboomall.com"
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-zinc-300 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all"
                >
                  <FaEnvelope className="text-xl" /> support@bamboomall.com
                </a>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                 <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-950/30">
                    <FaPhoneAlt className="text-emerald-500 mt-1 shrink-0" />
                    <div>
                       <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Phone</div>
                       <div className="text-white font-mono text-lg">+86 138-0013-8000</div>
                    </div>
                 </div>

                 <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-950/30">
                    <FaMapMarkerAlt className="text-emerald-500 mt-1 shrink-0" />
                    <div>
                       <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Office</div>
                       <div className="text-zinc-300 text-sm leading-relaxed">
                          Room 501, Building 3, No. 1188, Nanshan Avenue,<br/>
                          Nanshan District, Shenzhen, Guangdong, China
                       </div>
                    </div>
                 </div>
              </div>

              <p className="mt-6 text-center text-xs text-zinc-600">
                All messages are confidential. We reply as quickly as possible.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}