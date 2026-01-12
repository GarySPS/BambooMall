// src/App.js

import React, { useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import BalancePage from "./pages/BalancePage";
import KYCVerificationPage from "./pages/KYCVerificationPage";
import ProfilePage from "./pages/ProfilePage";
import NewsPage from "./pages/NewsPage";
import AboutUsPage from "./pages/AboutUsPage";
import Navbar from "./components/Navbar";
import MembershipPage from "./pages/MembershipPage";
import FAQPage from "./pages/FAQPage";
import { UserProvider } from "./contexts/UserContext";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OTPPage from "./pages/OTPPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Legal Pages
import { TermsPage, PrivacyPage, CookiePage } from "./pages/LegalPages";

// Admin Pages
import AdminLayout from "./components/AdminLayout";
import AdminUserPage from "./pages/AdminUserPage";
import AdminKYCPage from "./pages/AdminKYCPage";
import AdminDepositPage from "./pages/AdminDepositPage";
import AdminWithdrawPage from "./pages/AdminWithdrawPage";
import AdminOrderPage from "./pages/AdminOrderPage";

function AppContent() {
  const location = useLocation();
  
  // --- GLOBAL SCROLL TO TOP FIX ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]); 

  // Define routes where we want a clean look (No Navbar, No Footer)
  const hideNavbarRoutes = ["/login", "/signup", "/otp", "/forgot"];
  const isAuthPage = hideNavbarRoutes.includes(location.pathname);
  const isAdmin = location.pathname.startsWith("/admin");

  // --- LOGIC TO REMOVE BACKGROUND ON LOGIN PAGE ---
  const appStyle = {
    minHeight: "100vh",
    minWidth: "100vw",
    display: "flex",
    flexDirection: "column",
    backgroundImage: !isAuthPage ? "url('/profilebg.jpg')" : "none",
    backgroundColor: !isAuthPage ? "transparent" : "#fff",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundAttachment: "fixed",
    position: "relative",
  };

  return (
    <div style={appStyle}>
      {/* 1. NAVBAR (Hidden on Auth & Admin) */}
      {!isAuthPage && !isAdmin && <Navbar />}
      
      {/* 2. MAIN CONTENT */}
      <div className="flex-grow z-10 relative">
        <Routes>
          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminUserPage />} />
            <Route path="users" element={<AdminUserPage />} />
            <Route path="kyc" element={<AdminKYCPage />} />
            <Route path="deposit" element={<AdminDepositPage />} />
            <Route path="withdraw" element={<AdminWithdrawPage />} />
            <Route path="orders" element={<AdminOrderPage />} />
          </Route>

          {/* --- AUTH ROUTES (Public) --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />

          {/* --- LEGAL ROUTES (Public) --- */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiePage />} />

          {/* --- PUBLIC SHOP ROUTES (Accessible without login) --- */}
          {/* I moved these OUT of PrivateRoute so visitors can see them */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* --- PROTECTED ROUTES (Login Required) --- */}
          <Route element={<PrivateRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/balance" element={<BalancePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/kyc-verification" element={<KYCVerificationPage />} />
            <Route path="/membership" element={<MembershipPage />} />
          </Route>
        </Routes>
      </div>

      {/* 3. FOOTER (Hidden on Auth & Admin) */}
      {!isAdmin && !isAuthPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <ToastContainer position="top-center" autoClose={1800} />
        <AppContent />
      </Router>
    </UserProvider>
  );
}