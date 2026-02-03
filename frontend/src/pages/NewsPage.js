// src/pages/NewsPage.js

import React, { useEffect, useState } from "react";
import { 
  FaRegNewspaper, 
  FaGlobeAsia, 
  FaClock, 
  FaExternalLinkAlt, 
  FaSpinner, 
  FaSatelliteDish,
  FaChartBar,
  FaArrowRight,
  FaWifi
} from "react-icons/fa";

// Read backend API URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://bamboomall-backend.onrender.com/api";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
    
    fetch(`${API_BASE_URL}/news`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNews(data);
        } else if (data && Array.isArray(data.news)) {
          setNews(data.news);
        } else {
          setNews([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("News Fetch Error:", err);
        setNews([]);
        setLoading(false);
      });
  }, []);

  // Helper for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pb-24 animate-fade-in bg-slate-50/50">
      
      {/* 1. STRATEGIC HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto pt-10 pb-8 px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Title Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="px-2 py-0.5 rounded bg-blue-900 text-white text-[10px] font-bold uppercase tracking-widest">
                    V.3.0.1
                 </span>
                 <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <FaSatelliteDish /> Global Feed
                 </span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight font-sans">
                Strategic Intelligence
              </h1>
              <p className="text-slate-500 mt-2 font-medium max-w-2xl text-sm leading-relaxed">
                Real-time aggregation of macro-economic indicators, supply chain disruptions, and retail sector arbitrage opportunities.
              </p>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded p-3 self-start md:self-end">
               <div className="text-right border-r border-slate-200 pr-4">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Uplink Latency</div>
                  <div className="text-sm font-bold text-slate-700 font-mono">12ms</div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Stream Status</div>
                  <div className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-2 font-mono">
                     LIVE <FaWifi className="animate-pulse"/>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTELLIGENCE GRID */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 pt-10">
        
        {loading ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-slate-400">
             <div className="relative">
               <FaSpinner className="animate-spin text-4xl text-blue-900 mb-4" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-900 rounded-full animate-ping"></div>
               </div>
             </div>
             <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Establishing Secure Uplink...</span>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-24 bg-white border border-dashed border-slate-300 rounded-lg shadow-sm">
             <FaRegNewspaper className="mx-auto text-4xl text-slate-200 mb-4" />
             <h3 className="text-slate-800 font-bold mb-1">No Intelligence Reports</h3>
             <p className="text-slate-400 text-sm font-mono">System is currently scanning for new signals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {news.map((post, i) => (
              <a
                href={post.link}
                key={i}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full relative"
              >
                {/* Image Section */}
                <div className="relative h-56 bg-slate-900 overflow-hidden border-b border-slate-100">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback Icon */}
                  <div className={`absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-600 ${post.image ? 'hidden' : 'flex'}`}>
                    <FaChartBar size={32} />
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60"></div>
                  
                  {/* Top Badge: Source */}
                  <div className="absolute top-4 left-4">
                     <span className="px-2 py-1 bg-blue-600/90 text-white text-[9px] font-bold uppercase tracking-widest rounded shadow-sm backdrop-blur-md flex items-center gap-1">
                        <FaGlobeAsia size={8} /> {post.source || "Global Wire"}
                     </span>
                  </div>

                  {/* Bottom Badge: Time */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/90">
                     <span className="flex items-center gap-1.5 text-[10px] font-mono font-medium bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                        <FaClock size={10} /> {formatDate(post.date) || "LIVE"}
                     </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow relative">
                  {/* Decorative Accent Line */}
                  <div className="absolute top-0 left-6 w-10 h-0.5 bg-blue-600"></div>

                  <h3 className="text-xl font-bold font-serif text-slate-900 leading-snug mb-3 line-clamp-3 group-hover:text-blue-800 transition-colors mt-2">
                    {post.title}
                  </h3>
                  
                  {/* Abstract Visual Placeholder */}
                  <div className="space-y-2 mb-6 opacity-30">
                    <div className="h-1 bg-slate-400 rounded w-full"></div>
                    <div className="h-1 bg-slate-400 rounded w-5/6"></div>
                  </div>

                  <div className="flex-grow"></div>

                  {/* Footer */}
                  <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                     <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        Ref: {Math.random().toString(36).substring(7).toUpperCase()}
                     </span>
                     <div className="flex items-center gap-2 text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
                        Read Briefing <FaArrowRight size={10} />
                     </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}