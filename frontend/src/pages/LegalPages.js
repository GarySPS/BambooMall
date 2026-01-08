import React from 'react';
import './Legal.css';

// --- 1. TERMS OF SERVICE ---
export const TermsPage = () => {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1 className="legal-title">Terms of Service</h1>
        <p className="last-updated">Last Updated: January 8, 2026</p>
      </div>

      <div className="legal-section">
        <p>Welcome to BambooMall. These Terms and Conditions govern your use of our website and services. As a direct-from-factory marketplace, we operate under specific wholesale and resale protocols.</p>
        
        <h2>1. Agreement to Terms</h2>
        <p>By accessing BambooMall, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.</p>

        <h2>2. Factory Direct & Wholesale Nature</h2>
        <p>BambooMall connects buyers directly with manufacturers in China. By purchasing, you acknowledge:</p>
        <ul>
          <li>Products are shipped directly from origin factories (Cross-border shipping).</li>
          <li>Packaging may be minimal to reduce environmental impact and shipping costs.</li>
          <li>Bulk orders may be subject to customs duties in your destination country, which are the buyer's responsibility unless stated otherwise.</li>
        </ul>

        <h2>3. Accounts</h2>
        <p>When you create an account with us, you must provide information that is accurate, complete, and current. Failure to do so constitutes a breach of the Terms.</p>

        <h2>4. Returns & Refunds</h2>
        <p>Due to the international nature of our logistics, returns are accepted only for:</p>
        <ul>
          <li>Items arrived damaged (proof required within 48 hours).</li>
          <li>Incorrect item received.</li>
        </ul>
        <p>We do not offer "change of mind" returns for wholesale batches.</p>

        <h2>5. Intellectual Property</h2>
        <p>The Service and its original content, features, and functionality are and will remain the exclusive property of BambooMall and its licensors.</p>
        
        <div className="contact-highlight">
          <strong>Questions?</strong> Contact our Legal Team at <a href="mailto:legal@bamboomall.store">legal@bamboomall.store</a>
        </div>
      </div>
    </div>
  );
};

// --- 2. PRIVACY POLICY ---
export const PrivacyPage = () => {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="last-updated">Last Updated: January 8, 2026</p>
      </div>

      <div className="legal-section">
        <p>BambooMall ("us", "we", or "our") operates the bamboomall.store website. This page informs you of our policies regarding the collection, use, and disclosure of personal data.</p>

        <h2>1. Information Collection</h2>
        <p>We collect several different types of information for various purposes to provide and improve our Service to you:</p>
        <ul>
          <li><strong>Personal Data:</strong> Email address, First and last name, Phone number, Address, State, Province, ZIP/Postal code, City.</li>
          <li><strong>Payment Data:</strong> We do not store full credit card details. All transactions are processed via secure third-party gateways.</li>
        </ul>

        <h2>2. Use of Data</h2>
        <p>BambooMall uses the collected data for various purposes:</p>
        <ul>
          <li>To process and ship factory-direct orders.</li>
          <li>To notify you about changes to our Service.</li>
          <li>To provide customer care and support.</li>
          <li>To monitor the usage of the Service.</li>
        </ul>

        <h2>3. Data Security</h2>
        <p>The security of your data is important to us. We implement industry-standard SSL encryption and secure server protocols to protect your information.</p>
      </div>
    </div>
  );
};

// --- 3. COOKIE POLICY ---
export const CookiePage = () => {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1 className="legal-title">Cookie Policy</h1>
        <p className="last-updated">Last Updated: January 8, 2026</p>
      </div>

      <div className="legal-section">
        <p>This Cookie Policy explains what cookies are, how we use them, and your choices regarding cookies.</p>

        <h2>1. What are Cookies?</h2>
        <p>Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you.</p>

        <h2>2. How BambooMall Uses Cookies</h2>
        <ul>
          <li><strong>Essential Cookies:</strong> Necessary for the operation of the site (e.g., keeping items in your cart).</li>
          <li><strong>Analytics Cookies:</strong> To help us understand how you use the site so we can improve the user experience.</li>
          <li><strong>Marketing Cookies:</strong> Used to track visitors across websites to display ads that are relevant.</li>
        </ul>

        <h2>3. Your Choices</h2>
        <p>If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer.</p>
      </div>
    </div>
  );
};