// src/components/Navbar.js
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaShoppingCart, FaUser, FaTimes } from "react-icons/fa";
import { ReactComponent as Logo } from "./logo.svg";
import { useUser } from "../contexts/UserContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "News", href: "/news" },
  { name: "Balance", href: "/balance" },
  { name: "Membership", href: "/membership" },
  { name: "About Us", href: "/about-us" },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" }
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // --- ADMIN DASHBOARD: Only show Logout ---
  if (location.pathname.startsWith("/admin")) {
    return (
      <nav className="fixed w-full top-0 left-0 z-30 bg-white/90 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-end h-16 px-4">
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="px-5 py-2 rounded-xl bg-red-100 text-red-700 font-bold text-lg hover:bg-red-200 transition"
          >
            Logout
          </button>
        </div>
        <div className="h-8" />
      </nav>
    );
  }

  // --- USER NAVBAR (Default) ---
  return (
    <>
      {/* Navbar */}
      <nav className="fixed w-full top-0 left-0 z-30 bg-white/90 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          {/* Left: Hamburger */}
          <button
            className="flex items-center p-2 rounded-lg hover:bg-gray-100 focus:outline-none md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <FaBars size={22} />
          </button>
          {/* Center: Logo */}
          <div className="flex-1 flex items-center justify-center md:justify-start">
            <Link to="/" className="flex items-center gap-2">
              <span className="w-16 h-16 flex items-center">
                <Logo className="w-full h-full" />
              </span>
              <span className="font-bold text-xl tracking-tight text-green-700 ml-1">BambooMall</span>
            </Link>
          </div>
          {/* Right: Icons & User */}
          <div className="flex items-center gap-3">
            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full">
              <FaShoppingCart size={18} />
            </Link>
            {user && (
              <Link
                to="/profile"
                className="bg-green-100 text-green-700 px-3 py-1 rounded-xl font-bold text-base flex items-center gap-2 hover:bg-green-200 transition hidden md:flex"
                style={{ minWidth: 85 }}
              >
                <FaUser /> {user.username}
              </Link>
            )}
            {/* No logout or login button here */}
          </div>
        </div>
{/* Desktop nav links */}
<div className="hidden md:flex justify-center gap-8 py-2 bg-white shadow">
  {navLinks.map((link) => (
    <Link
      key={link.name}
      to={link.href}
      className={`
        relative
        px-4 py-1
        text-lg
        font-bold
        tracking-wide
        rounded-xl
        transition
        duration-200
        font-montserrat
        text-gray-800
        hover:text-green-700
        hover:bg-green-50
        hover:shadow-lg
        before:content-[''] before:absolute before:-bottom-1 before:left-1/2 before:-translate-x-1/2
        before:w-0 before:h-0.5 before:bg-gradient-to-r before:from-green-400 before:to-green-700
        hover:before:w-8 hover:before:h-1 before:transition-all before:duration-300
      `}
      style={{ fontFamily: "Montserrat, Inter, sans-serif" }}
    >
      {link.name}
    </Link>
  ))}
</div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-white shadow-lg transform ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300`}
        style={{ transitionProperty: "transform" }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg">Browse BambooMall</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Close menu"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="py-2 px-3 rounded text-gray-700 font-medium hover:bg-green-100 hover:text-green-700 transition"
              onClick={() => setDrawerOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="my-2" />
          <Link to="/cart" className="py-2 px-3 flex items-center gap-2 rounded hover:bg-gray-100">
            <FaShoppingCart /> Cart
          </Link>
          {user && (
            <Link
              to="/profile"
              onClick={() => setDrawerOpen(false)}
              className="py-2 px-3 flex items-center gap-2 rounded hover:bg-gray-100 text-green-700 font-semibold"
            >
              <FaUser /> {user.username}
            </Link>
          )}
          {/* No logout or login in mobile drawer */}
        </nav>
      </div>
      {/* Overlay for Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30"
          onClick={() => setDrawerOpen(false)}
        ></div>
      )}
      {/* Add margin top to main content so it's not hidden behind navbar */}
      <div className="h-20"></div>
    </>
  );
}
