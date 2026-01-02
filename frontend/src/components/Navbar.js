//src>components>Navbar.js

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaShoppingCart, FaUser, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { ReactComponent as Logo } from "./logo.svg";
import { useUser } from "../contexts/UserContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "News", href: "/news" },
  { name: "Balance", href: "/balance" },
  { name: "Membership", href: "/membership" },
  { name: "About Us", href: "/about-us" },
  { name: "FAQ", href: "/faq" }
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect for transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- ADMIN DASHBOARD NAVBAR ---
  if (location.pathname.startsWith("/admin")) {
    return (
      <nav className="fixed w-full top-0 left-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center"><Logo className="w-full h-full text-emerald-600" /></span>
            <span className="font-bold text-lg text-gray-800 tracking-wider">ADMIN PANEL</span>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold text-sm border border-red-100"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>
    );
  }

  // --- USER NAVBAR (Light / High Readability) ---
  return (
    <>
      <nav 
        className={`fixed w-full top-0 left-0 z-40 transition-all duration-300 border-b ${
          scrolled 
            ? "bg-white/95 backdrop-blur-md border-gray-200 shadow-md py-0" 
            : "bg-white/90 backdrop-blur-sm border-transparent py-2"
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
          
          {/* Top Row: Logo & Icons */}
          <div className="w-full md:w-auto flex items-center justify-between h-16">
            
            {/* Left: Mobile Menu */}
            <button
              className="flex items-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 md:hidden transition-colors"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <FaBars size={20} />
            </button>

            {/* Center: Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-10 h-10 flex items-center transition-transform group-hover:scale-110 duration-300">
                <Logo className="w-full h-full text-emerald-600" />
              </span>
              <span className="font-black text-xl tracking-tight text-gray-900 ml-1 font-serif">
                Bamboo<span className="text-emerald-600">Mall</span>
              </span>
            </Link>

            {/* Right: User & Cart (Mobile) */}
            <div className="flex items-center gap-3 md:hidden">
                <Link to="/cart" className="p-2 text-gray-600 hover:text-emerald-600 transition-colors relative">
                  <FaShoppingCart size={18} />
                </Link>
                {user && (
                  <Link to="/profile" className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
                    <FaUser size={12} />
                  </Link>
                )}
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1 h-16">
             {navLinks.map((link) => {
               const isActive = location.pathname === link.href;
               return (
                 <Link
                   key={link.name}
                   to={link.href}
                   className={`
                     relative px-4 py-2 text-sm font-bold tracking-wide transition-all duration-300 rounded-lg group
                     ${isActive ? "text-emerald-700 bg-emerald-50" : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"}
                   `}
                 >
                   {link.name}
                   <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100"}`} />
                 </Link>
               )
             })}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
             <Link 
               to="/cart" 
               className="group p-2.5 rounded-full bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 border border-gray-100 hover:border-emerald-200 transition-all duration-300"
             >
               <FaShoppingCart size={16} className="group-hover:scale-110 transition-transform" />
             </Link>
             
             {user ? (
               <Link
                 to="/profile"
                 className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all group"
               >
                 <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                    <FaUser />
                 </div>
                 <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700 truncate max-w-[100px]">{user.username}</span>
               </Link>
             ) : (
                <Link 
                  to="/login"
                  className="px-5 py-2 rounded-full bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                >
                  Login
                </Link>
             )}
          </div>

        </div>
      </nav>

      {/* Mobile Drawer (Light Theme) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-2xl transform ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-out`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <span className="font-bold text-lg text-gray-800">Menu</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-2">
          {user && (
             <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                   <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Welcome back</div>
                   <div className="text-gray-900 font-bold">{user.username}</div>
                </div>
             </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                 location.pathname === link.href 
                   ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                   : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => setDrawerOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-100 bg-white">
           {!user ? (
             <Link 
               to="/login"
               className="flex w-full items-center justify-center py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200"
               onClick={() => setDrawerOpen(false)}
             >
               Login / Sign Up
             </Link>
           ) : (
             <button 
                onClick={() => { logout(); setDrawerOpen(false); }}
                className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
             >
               <FaSignOutAlt /> Sign Out
             </button>
           )}
        </div>
      </div>

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      
      {/* Spacer for fixed nav */}
      <div className={`h-20 ${location.pathname === '/' ? 'hidden' : 'block'}`} />
    </>
  );
}