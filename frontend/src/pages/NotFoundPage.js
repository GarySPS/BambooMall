// src/pages/NotFoundPage.js
import React from "react";
import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6 text-center">
      <div className="bg-slate-200 p-6 rounded-full mb-6 text-slate-400">
        <FaExclamationTriangle size={48} />
      </div>
      
      <h1 className="text-6xl font-black text-slate-900 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-slate-600 mb-4">Page Not Found</h2>
      
      <p className="text-slate-500 max-w-md mb-8">
        The requested resource could not be located on this server. It may have been moved or deleted.
      </p>

      <Link 
        to="/" 
        className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
      >
        <FaHome /> Return to Dashboard
      </Link>
    </div>
  );
}