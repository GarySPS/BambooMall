import React, { useState } from "react";

const faqs = [
  {
    q: "How do I become a BambooMall member?",
    a: "Register an account and complete basic KYC. You'll unlock wallet recharge and can start reselling instantly."
  },
  {
    q: "How do discounts and VIP badges work?",
    a: "Every product has discount (1–20%). You earn extra discounts automatically when your wallet balance reaches VIP levels. Your badge updates instantly."
  },
  {
    q: "How do I earn profit from resale?",
    a: "When you buy, you pay the discounted price. Your profit preview is shown before confirming. Resale is simulated to show instant earnings in your wallet."
  },
  {
    q: "How do I contact support?",
    a: "Use WhatsApp or Telegram from our Support page. Real agents respond within 5–10 minutes during support hours."
  },
  {
    q: "What is BambooMall?",
    a: "BambooMall is a global B2C resale platform connecting you directly with top China factories. We offer premium Home & Living products at unbeatable factory-direct prices, backed by real-time wallet rewards and exclusive VIP membership benefits."
  },
  {
    q: "Is BambooMall licensed and safe to use?",
    a: "Yes. BambooMall is a fully licensed global platform, partnering with verified manufacturers and operating under strict compliance guidelines for user data and financial security."
  },
  {
    q: "How do I join BambooMall?",
    a: "Just register an account, verify your email, and complete a simple KYC process. Once verified, you can recharge your wallet and start reselling or shopping instantly."
  },
  {
    q: "How does the wallet system work?",
    a: "Your wallet supports instant top-ups via multiple payment channels. All transactions are securely processed, and your balance can be used to purchase or resell products anytime."
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept global payment options, including Alipay, WeChat Pay, USDT (Tether), and bank transfers. Local options are available in select regions."
  },
  {
    q: "How do I get VIP status and what are the benefits?",
    a: "VIP status is automatically unlocked when your wallet balance reaches certain levels. Each tier grants you extra discounts and an exclusive VIP badge. Your status and benefits update instantly as your balance changes."
  },
  {
    q: "Can I lose my VIP status?",
    a: "Your VIP status is based on your current wallet balance. If your balance drops below the required threshold, your badge and benefits adjust automatically."
  },
  {
    q: "Are all products authentic and new?",
    a: "Yes. Every product on BambooMall comes directly from certified factories and official suppliers. We guarantee all items are 100% authentic, brand new, and meet global quality standards."
  },
  {
    q: "What is the product warranty and return policy?",
    a: "Most products include a standard 1-year manufacturer warranty. If your item is defective or not as described, you can request a return or replacement within 7 days of delivery. Please check each product page for warranty details."
  },
  {
    q: "How does the resale system work?",
    a: "When you purchase at a factory-direct discount, you can choose to resell your item through our platform for an instant profit, previewed before you confirm. Your resale earnings are credited to your wallet immediately upon successful resale."
  },
  {
    q: "How do I track my orders?",
    a: "You can track all your orders and resales directly in your account dashboard. Shipping and resale status updates are provided in real time."
  },
  {
    q: "How fast is delivery?",
    a: "Delivery times vary by destination and supplier. Standard shipping usually takes 7–14 days for most regions. Real-time tracking and estimated delivery are provided on each order."
  },
  {
    q: "Is BambooMall available in my country?",
    a: "BambooMall ships to most countries worldwide. You can check availability and shipping fees during checkout."
  },
  {
    q: "How do I withdraw my wallet balance?",
    a: "You can request a withdrawal anytime via your account dashboard. Withdrawals are processed to your linked payment method, subject to standard processing times."
  },
  {
    q: "What should I do if my deposit or withdrawal is delayed?",
    a: "Deposits and withdrawals are usually processed within minutes, but some methods may take up to 24 hours. If you have any issues, our Support Team is available via WhatsApp and Telegram for fast assistance."
  },
  {
    q: "How are discounts calculated?",
    a: "Every product features a factory-set discount (1–20%). If you qualify for a VIP tier, you receive an additional bonus discount automatically applied at checkout. The total discount and your final price are always shown before you pay."
  },
  {
    q: "What is the VIP badge and how does it work?",
    a: "Your VIP badge appears next to your profile and in your account. It reflects your current tier and updates in real time as your wallet balance changes. Higher tiers unlock more benefits and an exclusive animated badge."
  },
  {
    q: "Is my data secure on BambooMall?",
    a: "Yes. We use industry-standard encryption and follow strict privacy protocols to protect your personal and financial information. We never share your data with third parties without your consent."
  },
  {
    q: "How do I contact customer support?",
    a: "You can reach our real Support Team via the Support page, WhatsApp, or Telegram. We respond within 5–10 minutes during support hours (09:00–22:00 CST, Monday–Saturday)."
  },
  {
    q: "Can I request a refund for a purchase?",
    a: "Yes. If you meet the return conditions (such as product defect or order issues), you can request a refund from your account dashboard. Refunds are usually processed within 3–5 business days."
  },
  {
    q: "Are there any limits on how much I can buy or resell?",
    a: "There is no limit on the number of items you can purchase or resell, as long as your wallet balance is sufficient. Bulk orders for certain items may require additional verification."
  },
  {
    q: "How do I know the suppliers are legitimate?",
    a: "All suppliers on BambooMall are verified and vetted through strict compliance and factory audits. We work only with trusted brands and manufacturers."
  },
  {
    q: "Do I need to pay customs or import taxes?",
    a: "Customs and import taxes may apply depending on your country. We recommend checking your local regulations. Most shipments include full documentation to speed up customs clearance."
  },
  {
    q: "Can I change or cancel my order after placing it?",
    a: "Orders can only be changed or canceled before they are processed by the factory. Please contact support immediately if you need to make changes."
  },
  {
    q: "How can I see my profit and resale history?",
    a: "Your account dashboard shows your total profit, detailed resale history, and order status at all times. You can export your earnings records for personal tracking."
  }
];

export default function FAQPage() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen px-2 pb-24">
      <div className="max-w-3xl mx-auto pt-14 pb-4 px-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-5 text-center drop-shadow-sm tracking-tight font-['Montserrat']">
          BambooMall FAQ
        </h1>
        <p className="text-center text-gray-600 mb-10 text-lg max-w-xl mx-auto">
          Everything you need to know about our platform, orders, wallet, VIP, and more.
        </p>
        <div className="premium-card shadow-2xl border border-green-100 animate-fade-in">
          <ul className="divide-y divide-green-50">
            {faqs.map((f, idx) => (
              <li key={idx}>
                <button
                  onClick={() => setOpen(open === idx ? null : idx)}
                  className="w-full flex items-start gap-4 text-left px-6 py-5 focus:outline-none transition-all duration-150 hover:bg-green-50 rounded-2xl"
                  aria-expanded={open === idx}
                >
                  <div className="flex-shrink-0 pt-1">
                    <svg
                      width="28" height="28" viewBox="0 0 24 24"
                      className={`transition-transform duration-300 ${open === idx ? "rotate-180" : ""} text-green-600`}
                      fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <span className="font-bold text-green-800 text-lg md:text-xl leading-snug font-['Montserrat']">
                    {f.q}
                  </span>
                </button>
                <div
                  className={`px-16 pb-5 text-gray-700 text-base transition-all duration-300 ease-in-out ${
                    open === idx
                      ? "max-h-96 opacity-100 scale-100"
                      : "max-h-0 opacity-0 scale-95 overflow-hidden"
                  }`}
                  style={{ willChange: "max-height, opacity, transform" }}
                >
                  {f.a}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-14 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} BambooMall &mdash; Factory Direct, Global Resale.
        </div>
      </div>
    </div>
  );
}
