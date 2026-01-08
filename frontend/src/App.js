import React from "react";
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
import Footer from "./components/Footer"; // <--- Ensure this file exists in src/components/
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OTPPage from "./pages/OTPPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- NEW: Import Legal Pages ---
import { TermsPage, PrivacyPage, CookiePage } from "./LegalPages"; 

// --- Admin Layout & Pages ---
import AdminLayout from "./components/AdminLayout";
import AdminUserPage from "./pages/AdminUserPage";
import AdminKYCPage from "./pages/AdminKYCPage";
import AdminDepositPage from "./pages/AdminDepositPage";
import AdminWithdrawPage from "./pages/AdminWithdrawPage";
import AdminOrderPage from "./pages/AdminOrderPage";

// Helper for showing/hiding navbar
function AppContent() {
  const location = useLocation();
  
  // Define where the main Navbar/Footer should be hidden
  const hideNavbarRoutes = ["/login", "/signup", "/otp", "/forgot"];
  const isAuthPage = hideNavbarRoutes.includes(location.pathname);
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {/* 1. NAVBAR - Only show if NOT auth page and NOT admin */}
      {!isAuthPage && !isAdmin && <Navbar />}
      
      <div className="flex-grow"> {/* Ensures footer pushes to bottom */}
        <Routes>
          {/* --- ADMIN ROUTES WITH SIDEBAR --- */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminUserPage />} />
            <Route path="users" element={<AdminUserPage />} />
            <Route path="kyc" element={<AdminKYCPage />} />
            <Route path="deposit" element={<AdminDepositPage />} />
            <Route path="withdraw" element={<AdminWithdrawPage />} />
            <Route path="orders" element={<AdminOrderPage />} />
          </Route>

          {/* --- AUTH ROUTES (public) --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />

          {/* --- LEGAL ROUTES (public) --- */}
          {/* These must be public so new users can read them before joining */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiePage />} />

          {/* --- MAIN SITE ROUTES (PROTECTED) --- */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/balance" element={<BalancePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/kyc-verification" element={<KYCVerificationPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/faq" element={<FAQPage />} />
          </Route>
        </Routes>
      </div>

      {/* 2. FOOTER - Only show if NOT auth page and NOT admin */}
      {!isAdmin && !isAuthPage && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <ToastContainer position="top-center" autoClose={1800} />
        <div
          style={{
            minHeight: "100vh",
            minWidth: "100vw",
            backgroundImage: "url('/profilebg.jpg')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundAttachment: "fixed",
            position: "relative",
            display: "flex",         // <--- Added flex
            flexDirection: "column"  // <--- Added column to make footer stick properly
          }}
        >
          {/* --- Optional overlay for readability (uncomment if needed) --- */}
          {/* <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(255,255,255,0.85)", 
              zIndex: 0,
              pointerEvents: "none"
            }}
          /> */}
          
          {/* --- Your main app content --- */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <AppContent />
          </div>
        </div>
      </Router>
    </UserProvider>
  );
}