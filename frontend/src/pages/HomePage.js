import React from 'react';
import { Link } from 'react-router-dom';
import FeaturedProductsCarousel from '../components/FeaturedProductsCarousel';
import AnimatedVipBadge from '../components/AnimatedVipBadge'; // If you have it
import { FaStar, FaBolt, FaCheckCircle, FaCrown, FaTiktok } from 'react-icons/fa';

const testimonials = [
  {
    name: "Jessica (VIP2 Member)",
    avatar: "/demo_avatar1.jpg", // ✅ Correct
    badge: "VIP2",
    text: "I started with just $1000, now I'm VIP2! Real factory prices and resale profits. Highly recommended.",
  },
  {
    name: "Json (VIP1 Member)",
    avatar: "/demo_avatar2.jpg", // ✅ Correct
    badge: "VIP1",
    text: "The VIP perks are real! Extra discounts on top of factory prices—BambooMall is my favorite.",
  },
  {
    name: "David (VIP0 Member)",
    avatar: "/demo_avatar3.jpg", // ✅ Correct
    badge: "VIP0",
    text: "Fast resale, quick profit, and real product quality. The membership badge looks so cool on my profile.",
  },
];


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">

      {/* Hero Banner */}
      <section className="py-20 text-center bg-green-700 text-white relative overflow-hidden">
        <div
  className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
  style={{ backgroundImage: "url('/hero-bg.png')" }}
></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg font-[Montserrat]">
            BambooMall
          </h1>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl mb-8 animate-fadein-slow font-[Inter]">
            Real Factory Goods. <span className="font-bold text-yellow-300">Exclusive Discounts</span>. <span className="text-yellow-100">Profitable Resale.</span>
          </p>
          <Link
            to="/products"
            className="mt-4 inline-block bg-white text-green-700 font-bold px-8 py-3 rounded-full shadow-xl hover:bg-yellow-100 hover:text-green-900 transition text-lg"
          >
            Start Reselling
          </Link>
        </div>
      </section>

      {/* Key Selling Points */}
      <section className="max-w-6xl mx-auto py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-7 flex flex-col items-center border border-green-100">
          <FaBolt className="text-3xl text-green-700 mb-2" />
          <h3 className="font-bold text-xl text-green-700 mb-2">Exclusive Factory Prices</h3>
          <p className="text-green-600 mb-4">Order direct from top factories—skip the middleman and maximize your resale profit.</p>
          <Link className="text-green-700 font-semibold hover:underline" to="/about-us">
            Learn More →
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-7 flex flex-col items-center border border-green-100">
          <FaCrown className="text-3xl text-yellow-400 mb-2" />
          <h3 className="font-bold text-xl text-green-700 mb-2">VIP Membership Perks</h3>
          <p className="text-green-600 mb-4">Level up as your wallet grows—get instant extra discounts and show off your animated VIP badge.</p>
          <Link className="text-green-700 font-semibold hover:underline" to="/membership">
            View VIP Levels →
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-7 flex flex-col items-center border border-green-100">
          <FaCheckCircle className="text-3xl text-green-700 mb-2" />
          <h3 className="font-bold text-xl text-green-700 mb-2">Instant Resale Profits</h3>
          <p className="text-green-600 mb-4">Buy, resell, and withdraw your profit instantly with our wallet-based simulation system.</p>
          <Link className="text-green-700 font-semibold hover:underline" to="/faq">
            How It Works →
          </Link>
        </div>
      </section>

      {/* Featured Product Carousel */}
      <section className="py-16 bg-green-100">
        <h2 className="text-center text-3xl font-bold text-green-700 mb-8">Featured Products</h2>
        <FeaturedProductsCarousel />
        <div className="text-center mt-8">
          <Link to="/products" className="inline-block bg-green-700 text-white px-6 py-2 rounded-full font-medium shadow hover:bg-green-800 transition">
            See All Products →
          </Link>
        </div>
      </section>

      {/* Video/Promo (optional: TikTok or real factory video) */}
      <section className="max-w-4xl mx-auto py-14 px-4">
        <div className="rounded-2xl bg-white shadow-lg p-4 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-shrink-0 w-full md:w-80 h-48 md:h-56 overflow-hidden rounded-xl bg-black flex items-center justify-center relative">
            {/* Replace below src with your actual promo video/TikTok embed or animated placeholder */}
            <iframe
              src="https://www.tiktok.com/embed/7364031572937630978"
              className="w-full h-full"
              allow="autoplay"
              title="BambooMall TikTok Demo"
            ></iframe>
            <FaTiktok className="absolute bottom-2 right-2 text-3xl text-white opacity-60" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-green-700 mb-2">See Our Real Factory Deals in Action!</h3>
            <p className="text-green-600 mb-4">Watch our video for a quick walkthrough of the BambooMall system and how VIP members profit more every day.</p>
            <Link to="/about-us" className="inline-block text-green-700 font-semibold hover:underline">
              More About BambooMall →
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="max-w-6xl mx-auto py-12 px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Link to="/products" className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 hover:bg-green-50 transition">
          <FaStar className="text-2xl text-green-700 mb-2" />
          <span className="font-semibold text-green-700">Products</span>
        </Link>
        <Link to="/membership" className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 hover:bg-green-50 transition">
          <FaCrown className="text-2xl text-yellow-400 mb-2" />
          <span className="font-semibold text-green-700">Membership</span>
        </Link>
        <Link to="/blog" className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 hover:bg-green-50 transition">
          <FaBolt className="text-2xl text-green-700 mb-2" />
          <span className="font-semibold text-green-700">Blog</span>
        </Link>
        <Link to="/faq" className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 hover:bg-green-50 transition">
          <FaCheckCircle className="text-2xl text-green-700 mb-2" />
          <span className="font-semibold text-green-700">FAQ</span>
        </Link>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-center text-3xl font-bold text-green-700 mb-8">Success Stories</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-green-100">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-16 h-16 rounded-full border-4 border-green-100 mb-3 object-cover"
              />
              <div className="flex items-center gap-2 mb-2">
                {/* AnimatedVipBadge (if available) */}
                {t.badge && <AnimatedVipBadge level={t.badge} />}
                <span className="font-semibold text-green-700">{t.name}</span>
              </div>
              <p className="text-green-600 text-center italic">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 text-center bg-green-600 text-white">
        <h2 className="text-4xl font-bold mb-4">Join BambooMall Today!</h2>
        <p className="text-lg mb-6">Become a VIP reseller and unlock extra profits. Your membership and wallet badge upgrade instantly as you deposit!</p>
        <Link
          to="/signup"
          className="inline-block bg-white text-green-700 font-bold px-8 py-3 rounded-full shadow hover:bg-yellow-100 hover:text-green-900 transition text-lg"
        >
          Sign Up & Start Reselling
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-green-700/60 text-sm">
        &copy; {new Date().getFullYear()} BambooMall. All rights reserved.
      </footer>
    </div>
  );
}
