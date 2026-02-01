// src/pages/LegalPages.js

import React from 'react';

// Common Header for Legal Docs
const LegalHeader = ({ title, docId }) => (
  <div className="mb-10 border-b border-slate-200 pb-6">
    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase mb-2">
      {title}
    </h1>
    <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
      <span>DOC ID: {docId}</span>
      <span>EFFECTIVE: 2026-01-01</span>
      <span className="text-emerald-600 font-bold">STATUS: ACTIVE</span>
    </div>
  </div>
);

// --- 1. TERMS OF SERVICE (The Trade Agreement) ---
export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-700 font-sans p-8 md:p-16 max-w-5xl mx-auto animate-fade-in">
      <LegalHeader title="Master Service Agreement" docId="MSA-2026-CN" />

      <div className="space-y-8 text-sm leading-relaxed max-w-3xl">
        <div className="bg-slate-50 p-4 border border-slate-200 rounded text-xs font-mono mb-8">
           <strong>PREAMBLE:</strong> This Master Service Agreement ("Agreement") is executed between <strong>BambooMall Supply Chain Management (Shenzhen) Co., Ltd.</strong> ("Platform") and the registered Entity ("Partner"). 
           By accessing the Terminal, the Partner acknowledges that they are a qualified commercial entity capable of executing cross-border asset acquisitions.
        </div>
        
        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1. Nature of Inventory (Ex-Works)</h3>
            <p>
              All assets listed on the Platform are classified as <strong>Ex-Works (EXW) Liquidation Stock</strong>. 
              The Partner acknowledges that:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
              <li>All allocations are final upon settlement execution.</li>
              <li>"Projected Margins" are estimates based on historical spot prices in the destination market (North America / EU).</li>
              <li>The Platform acts as a clearinghouse and assumes no liability for downstream market volatility.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">2. Settlement & Clearing</h3>
            <p>
              Settlements are executed via the <strong>BambooMall Clearing Ledger</strong>. 
              Fiat currency transfers (SWIFT/SEPA) are subject to a T+3 clearance period. 
              Digital Asset settlements (USDC/USDT) are cleared T+0 (Instant). 
              The Partner agrees to indemnify the Platform against any FX slippage during the clearing window.
            </p>
        </section>

        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">3. Dispute Resolution</h3>
            <p>
              Any dispute arising from this Agreement shall be submitted to the <strong>Shenzhen Court of International Arbitration (SCIA)</strong>. 
              The arbitration shall be conducted in English and Chinese. The arbitral award is final and binding.
            </p>
        </section>

        <div className="mt-12 p-6 bg-blue-50 border border-blue-100 text-xs text-blue-900 font-mono">
          <p className="mb-2 font-bold">DIGITAL SIGNATURE:</p>
          <p>By initializing a session, the Partner affixs their digital signature to this Agreement under the Electronic Signature Law of the PRC.</p>
        </div>
      </div>
    </div>
  );
};

// --- 2. PRIVACY POLICY (Data Protection) ---
export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-700 font-sans p-8 md:p-16 max-w-5xl mx-auto animate-fade-in">
      <LegalHeader title="Data Sovereignty Policy" docId="DSP-GDPR-CN" />

      <div className="space-y-8 text-sm leading-relaxed max-w-3xl">
        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1. Data Collection Scope</h3>
            <p>
              To comply with <strong>Anti-Money Laundering (AML)</strong> and <strong>Know Your Customer (KYC)</strong> regulations, 
              BambooMall SCM collects the following entity data:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
              <li>Corporate Registration Documents (Business License / Articles of Inc.)</li>
              <li>Ultimate Beneficial Owner (UBO) Identity Verification.</li>
              <li>Transactional Meta-data (Wallet Addresses, IBANs, IP Geolocation).</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">2. Cross-Border Data Transfer</h3>
            <p>
              The Partner acknowledges that operational data is stored on secure servers located in the <strong>Hong Kong Special Administrative Region (SAR)</strong>. 
              Data transfer protocols adhere to the <em>Personal Information Protection Law (PIPL)</em> of the PRC and GDPR standards for EU entities.
            </p>
        </section>

        <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">3. Regulatory Disclosure</h3>
            <p>
              BambooMall SCM reserves the right to disclose transactional records to the <strong>State Administration of Foreign Exchange (SAFE)</strong> 
              upon formal request, solely for the purpose of verifying cross-border capital flows exceeding $50,000 USD.
            </p>
        </section>
      </div>
    </div>
  );
};