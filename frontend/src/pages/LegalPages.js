// src/pages/LegalPages.js

import React from 'react';

// Common Header for Legal Docs
const LegalHeader = ({ title, effectiveDate }) => (
  <div className="mb-10 border-b border-slate-200 pb-6">
    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase mb-2">
      {title}
    </h1>
    <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
      <span>LAST UPDATED: {effectiveDate}</span>
      <span className="text-emerald-600 font-bold">STATUS: ACTIVE</span>
    </div>
  </div>
);

// --- 1. TERMS OF SALE (Friendly & Clear) ---
export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-700 font-sans p-8 md:p-16 max-w-5xl mx-auto animate-fade-in">
      <LegalHeader title="Terms of Sale" effectiveDate="January 1, 2026" />

      <div className="space-y-8 text-sm leading-relaxed max-w-3xl">
        <div className="bg-slate-50 p-4 border border-slate-200 rounded text-sm text-slate-600 mb-8">
           <strong>Welcome to BambooMall.</strong> We sell authentic ex-factory surplus goods directly to consumers. 
           By purchasing from our store, you agree to the following terms regarding shipping, quality, and returns.
        </div>
        
        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1. Product Origin (Ex-Factory)</h3>
            <p>
              Our products are sourced directly from factory surplus, overstock, and clearance lines. This allows us to offer significantly lower prices.
              Please note:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
              <li>Items are 100% authentic and new unless otherwise marked (e.g., "Open Box").</li>
              <li>Some items may come in plain packaging (white box) rather than retail packaging to save on shipping costs.</li>
              <li>Quantities are limited. Once an item is sold out, we may not be able to restock it.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">2. Payments & Pricing</h3>
            <p>
              We accept major credit cards and recognized digital wallets. All transactions are processed securely via encrypted gateways.
              We do not store your full credit card information on our servers.
            </p>
        </section>

        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">3. Returns & Refunds</h3>
            <p>
              We want you to be happy with your deal.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
              <li><strong>Quality Guarantee:</strong> If an item arrives damaged or incorrect, contact us within 7 days for a full refund or replacement.</li>
              <li><strong>Change of Mind:</strong> Due to our low-margin ex-factory pricing, we generally do not accept returns for "change of mind" unless specified on the product page.</li>
            </ul>
        </section>

        <div className="mt-12 p-6 bg-slate-50 border border-slate-200 text-xs text-slate-500 font-mono">
          <p>Questions about your order? Contact us at support@bamboomall.store</p>
        </div>
      </div>
    </div>
  );
};

// --- 2. PRIVACY POLICY (Standard Ecommerce) ---
export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-700 font-sans p-8 md:p-16 max-w-5xl mx-auto animate-fade-in">
      <LegalHeader title="Privacy Policy" effectiveDate="January 1, 2026" />

      <div className="space-y-8 text-sm leading-relaxed max-w-3xl">
        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1. Information We Collect</h3>
            <p>
              We collect only the information necessary to process your order and deliver your goods:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
              <li>Shipping address and contact details (email/phone).</li>
              <li>Order history and preferences.</li>
              <li>Payment details (processed securely by our payment partners).</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">2. How We Use Your Data</h3>
            <p>
              Your privacy is important. We use your data strictly for:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
              <li>Processing and tracking your orders.</li>
              <li>Sending order updates and tracking numbers.</li>
              <li>Improving our website experience.</li>
            </ul>
             <p className="mt-2 font-medium">We do NOT sell your personal data to third-party advertisers.</p>
        </section>

        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">3. Data Security</h3>
            <p>
              We use industry-standard SSL encryption to protect your data during transmission. Your account information is password-protected for your privacy and security.
            </p>
        </section>
      </div>
    </div>
  );
};