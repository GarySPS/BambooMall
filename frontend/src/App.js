// src/App.js

import React, { useEffect, Suspense, lazy } from "react"; 
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- CORE LAYOUTS ---
import Layout from "./components/Layout"; 
import PrivateRoute from "./components/PrivateRoute";
import AdminLayout from "./components/AdminLayout"; 

// --- EAGER LOAD (Critical Path) ---
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";

// --- LAZY LOAD (Client Portal) ---
// Auth
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const OTPPage = lazy(() => import("./pages/OTPPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));

// Operational
const CartPage = lazy(() => import("./pages/CartPage"));
const BalancePage = lazy(() => import("./pages/BalancePage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const KYCVerificationPage = lazy(() => import("./pages/KYCVerificationPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MembershipPage = lazy(() => import("./pages/MembershipPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage")); 
const FAQPage = lazy(() => import("./pages/FAQPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Legal
const TermsPage = lazy(() => import("./pages/LegalPages").then(module => ({ default: module.TermsPage })));
const PrivacyPage = lazy(() => import("./pages/LegalPages").then(module => ({ default: module.PrivacyPage })));

// --- LAZY LOAD (Admin Control Room) ---
const AdminOverviewPage = lazy(() => import("./pages/AdminOverviewPage"));
const AdminUserPage = lazy(() => import("./pages/AdminUserPage"));
const AdminOrderPage = lazy(() => import("./pages/AdminOrderPage"));
const AdminDepositPage = lazy(() => import("./pages/AdminDepositPage"));
const AdminWithdrawPage = lazy(() => import("./pages/AdminWithdrawPage"));
const AdminKYCPage = lazy(() => import("./pages/AdminKYCPage"));

// --- UI COMPONENTS ---
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
      <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Establishing Secure Uplink...</div>
    </div>
  </div>
);

// Wrapper to apply padding inside the Sidebar Layout
const DashboardWrapper = () => (
  <Layout>
    <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto min-h-screen">
       <Outlet />
    </div>
  </Layout>
);

function AppContent() {
  const location = useLocation();
  
  // UX: Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]); 

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-900 selection:text-white">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          
          {/* --- 1. AUTH ROUTES (No Sidebar) --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />

          {/* --- 2. ADMIN ROUTES (God Mode) --- */}
          {/* Requires user.role === 'admin' check inside AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
             <Route index element={<AdminOverviewPage />} />
             <Route path="users" element={<AdminUserPage />} />
             <Route path="orders" element={<AdminOrderPage />} />
             <Route path="deposits" element={<AdminDepositPage />} />
             <Route path="withdrawals" element={<AdminWithdrawPage />} />
             <Route path="kyc" element={<AdminKYCPage />} />
          </Route>

          {/* --- 3. AGENT DASHBOARD (Sidebar Layout) --- */}
          <Route element={<DashboardWrapper />}>
            
            {/* Public Agent Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/compliance" element={<AboutUsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="*" element={<NotFoundPage />} />

            {/* Protected Agent Pages (Requires Login) */}
            <Route element={<PrivateRoute />}>
               <Route path="/cart" element={<CartPage />} />
               <Route path="/balance" element={<BalancePage />} />
               <Route path="/history" element={<HistoryPage />} />
               <Route path="/profile" element={<ProfilePage />} />
               <Route path="/kyc-verification" element={<KYCVerificationPage />} />
               <Route path="/membership" element={<MembershipPage />} />
            </Route>

          </Route>

        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <ToastContainer position="bottom-right" theme="colored" autoClose={3000} hideProgressBar={true} />
        <AppContent />
      </Router>
    </UserProvider>
  );
}