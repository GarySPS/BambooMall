// src/App.js

import React, { useEffect, Suspense, lazy } from "react"; 
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { UserProvider } from "./contexts/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- 1. KEEP CRITICAL PAGES STANDARD ---
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";

// --- 2. LAZY LOAD EVERYTHING ELSE ---
const CartPage = lazy(() => import("./pages/CartPage"));
const BalancePage = lazy(() => import("./pages/BalancePage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage")); // <--- ADD THIS LINE
const KYCVerificationPage = lazy(() => import("./pages/KYCVerificationPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MembershipPage = lazy(() => import("./pages/MembershipPage"));

const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const OTPPage = lazy(() => import("./pages/OTPPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const PrivateRoute = lazy(() => import("./components/PrivateRoute"));

const NewsPage = lazy(() => import("./pages/NewsPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));

// Legal Pages
const TermsPage = lazy(() => import("./pages/LegalPages").then(module => ({ default: module.TermsPage })));
const PrivacyPage = lazy(() => import("./pages/LegalPages").then(module => ({ default: module.PrivacyPage })));
const CookiePage = lazy(() => import("./pages/LegalPages").then(module => ({ default: module.CookiePage })));

// Admin Pages
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminUserPage = lazy(() => import("./pages/AdminUserPage"));
const AdminKYCPage = lazy(() => import("./pages/AdminKYCPage"));
const AdminDepositPage = lazy(() => import("./pages/AdminDepositPage"));
const AdminWithdrawPage = lazy(() => import("./pages/AdminWithdrawPage"));
const AdminOrderPage = lazy(() => import("./pages/AdminOrderPage"));


// --- LOADING SPINNER COMPONENT ---
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

function AppContent() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]); 

  const hideNavbarRoutes = ["/login", "/signup", "/otp", "/forgot"];
  const isAuthPage = hideNavbarRoutes.includes(location.pathname);
  const isAdmin = location.pathname.startsWith("/admin");

  const appStyle = {
    minHeight: "100vh",
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
      {!isAuthPage && !isAdmin && <Navbar />}
      
      <div className="flex-grow z-10 relative">
        <Suspense fallback={<PageLoader />}>
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

            {/* --- AUTH ROUTES --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/otp" element={<OTPPage />} />
            <Route path="/forgot" element={<ForgotPasswordPage />} />

            {/* --- LEGAL ROUTES --- */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookies" element={<CookiePage />} />

            {/* --- PUBLIC SHOP ROUTES --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/faq" element={<FAQPage />} />

            {/* --- PROTECTED ROUTES --- */}
            <Route element={<PrivateRoute />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/balance" element={<BalancePage />} />
              <Route path="/history" element={<HistoryPage />} /> {/* <--- ADD THIS ROUTE */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/kyc-verification" element={<KYCVerificationPage />} />
              <Route path="/membership" element={<MembershipPage />} />
            </Route>
          </Routes>
        </Suspense>
      </div>

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