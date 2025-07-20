import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import BalancePage from "./pages/BalancePage";
import ProfilePage from "./pages/ProfilePage";
import NewsPage from "./pages/NewsPage";
import AboutUsPage from "./pages/AboutUsPage";
import Navbar from "./components/Navbar";
import MembershipPage from "./pages/MembershipPage";
import BlogPage from "./pages/BlogPage";
import FAQPage from "./pages/FAQPage";
import { UserProvider } from "./contexts/UserContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OTPPage from "./pages/OTPPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import PrivateRoute from "./components/PrivateRoute";

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
  const hideNavbarRoutes = ["/login", "/signup", "/otp", "/forgot"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname) || location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}
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

        {/* --- MAIN SITE ROUTES (PROTECTED) --- */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/balance" element={<BalancePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/faq" element={<FAQPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}
