import React, { useState } from "react";
import {
  FaShieldAlt,
  FaIndustry,
  FaGlobeAsia,
  FaMedal,
  FaChartBar,
  FaUserFriends,
} from "react-icons/fa";
import CertAwards from "../components/CertAwards";

export default function AboutUsPage() {
  const [tab, setTab] = useState("about");

  return (
    <div className="w-full min-h-screen bg-[#F2E5C0] pb-24">
      <div className="max-w-3xl mx-auto pt-16 px-4">
        <div className="flex gap-6 mb-8 justify-center">
          <button
            className={`py-2 px-6 rounded-t font-bold ${
              tab === "about" ? "bg-green-700 text-white" : "bg-green-100 text-green-700"
            }`}
            onClick={() => setTab("about")}
          >
            About
          </button>
          <button
            className={`py-2 px-6 rounded-t font-bold ${
              tab === "contact" ? "bg-green-700 text-white" : "bg-green-100 text-green-700"
            }`}
            onClick={() => setTab("contact")}
          >
            Contact
          </button>
        </div>
      </div>

      {/* --- About Tab --- */}
      {tab === "about" && (
        <>
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-3xl font-extrabold text-green-700 mb-4 tracking-tight">
              Welcome to BambooMall
            </h1>
            <p className="mb-7 text-lg text-gray-700 leading-relaxed">
              <b>BambooMall</b> is the new standard for global B2B wholesale, connecting small businesses and entrepreneurs directly to Asia’s most trusted factories—without the old barriers or risks.
            </p>
          </div>

          {/* ---- NovaChain-Style Certificate & Awards Section ---- */}
          <CertAwards />

          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4 mb-6 px-4">
            <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <FaShieldAlt className="text-green-600 text-2xl mt-1" />
              <div>
                <div className="font-bold text-green-900">
                  Officially Licensed & Audited
                </div>
                <div className="text-sm text-gray-700">
                  Operated under BambooMall Commerce (Shenzhen) Ltd., registered and licensed in China’s export capital. Every supplier is verified for legal and production status.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <FaIndustry className="text-green-600 text-2xl mt-1" />
              <div>
                <div className="font-bold text-green-900">Direct from Factory Floor</div>
                <div className="text-sm text-gray-700">
                  Work with original manufacturers—no brokers, no extra markups. Sourcing is transparent, prices are real, and every shipment is traceable to its source.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <FaGlobeAsia className="text-green-600 text-2xl mt-1" />
              <div>
                <div className="font-bold text-green-900">Built for International Small Business</div>
                <div className="text-sm text-gray-700">
                  Order as little as 5 units per product. Ideal for modern resellers, online shops, TikTok sellers, and entrepreneurs launching new brands.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <FaMedal className="text-green-600 text-2xl mt-1" />
              <div>
                <div className="font-bold text-green-900">Every Shipment Inspected</div>
                <div className="text-sm text-gray-700">
                  Each order passes our in-house and factory checks before export. We protect your business from fakes, mistakes, and surprises.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <FaChartBar className="text-green-600 text-2xl mt-1" />
              <div>
                <div className="font-bold text-green-900">All-in-One Dashboard</div>
                <div className="text-sm text-gray-700">
                  Your orders, wallet, membership level, and support—all visible at a glance. Simple, fast, and always transparent.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
              <FaUserFriends className="text-green-600 text-2xl mt-1" />
              <div>
                <div className="font-bold text-green-900">Global, Confidential Support</div>
                <div className="text-sm text-gray-700">
                  Our team answers with your relate language &amp; more. All chats are private, all issues handled—no matter where you are.
                </div>
              </div>
            </div>
          </div>

          {/* Vision / Highlighted Block */}
          <div className="max-w-3xl mx-auto bg-green-100 border border-green-200 rounded-xl p-5 mt-2 mb-6 text-green-900 text-base shadow-sm px-4">
            <span className="font-extrabold text-xl block mb-2 tracking-tight">
              Our Vision
            </span>
            <span>
              We believe the next era of global business is powered by direct connection, real trust, and technology that works for everyone.
              <br />
              <br />
              <span className="font-semibold">
                BambooMall bridges Asia’s real factories with the new generation of global sellers. Fast. Reliable. Personal.
              </span>
            </span>
          </div>
          <div className="max-w-3xl mx-auto mt-6 p-4 rounded bg-green-50 text-sm font-mono px-4">
            <b>BambooMall Commerce (Shenzhen) Ltd.</b>
            <br />
            Room 501, Building 3, No. 1188, Nanshan Avenue, Nanshan District, Shenzhen, Guangdong, China 518052
            <br />
            <span className="block mt-1 text-gray-500">
              Business License: 91440300MA5FP7W02K
              <br />
              VAT Number: 440300112233445
            </span>
          </div>
          <div className="max-w-3xl mx-auto mt-6 text-xs text-gray-400 px-4">
            *All products displayed are for demo/sample purposes in project mode. Final commercial launch includes official supplier verification and compliance.
          </div>
        </>
      )}

      {/* --- Contact Tab --- */}
      {tab === "contact" && (
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-green-700 mb-4 tracking-tight">
            Contact BambooMall
          </h1>
          <div className="mb-3 text-gray-700 text-base">
            Our support team is ready to help,{" "}
            <span className="font-bold text-green-800">
              8am – 10pm (GMT+6:30), Monday to Saturday
            </span>
            .<br />
            For commercial cooperation, global partnerships, or any questions—reach out!
          </div>

          <div className="flex flex-col gap-3 mt-6 mb-6">
            <a
              href="https://wa.me/8613800138000"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3 rounded-xl font-semibold text-white text-lg shadow transition bg-gradient-to-r from-green-500 to-green-600 hover:from-green-700 hover:to-green-800 focus:outline-none"
            >
              WhatsApp Support
            </a>
            <a
              href="https://t.me/bamboomall_support"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3 rounded-xl font-semibold text-white text-lg shadow transition bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 focus:outline-none"
            >
              Telegram Chat
            </a>
            <a
              href="mailto:support@bamboomall.com"
              className="w-full text-center py-3 rounded-xl font-semibold text-green-800 text-lg shadow transition bg-green-50 hover:bg-green-100 border border-green-300 focus:outline-none"
            >
              Email: support@bamboomall.com
            </a>
          </div>

          <div className="mb-2 flex flex-col gap-1">
            <div className="font-semibold text-gray-700">
              Phone:
              <span className="ml-2 text-green-800 font-bold">
                +86 138-0013-8000
              </span>
            </div>
            <div className="font-semibold text-gray-700">
              Office:
              <span className="ml-2 text-green-800">
                Room 501, Building 3, No. 1188, Nanshan Avenue,
                <br />
                Nanshan District, Shenzhen, Guangdong, China 518052
              </span>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-400">
            All messages are confidential. We reply as quickly as possible!
          </div>
        </div>
      )}
    </div>
  );
}
