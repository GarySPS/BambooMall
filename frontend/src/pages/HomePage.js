import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaBolt, FaCheckCircle, FaCrown, FaTiktok, FaPlus } from 'react-icons/fa';
import { fetchProducts } from '../utils/api';
import { getProductImage } from '../utils/image';

// --- 1. Factory Data ---
const factories = [
  {
    name: "Sunon Furniture Co., Ltd.",
    image: "/sunon.jpg",
    address: "No. 16, Jincheng Rd, Hangzhou, Zhejiang, China",
    info: "Leading office furniture manufacturer with 20+ years global export experience.",
  },
  {
    name: "KUKA Home",
    image: "/kuka.png",
    address: "No. 299, Huxi Rd, Haining, Zhejiang, China",
    info: "World-class upholstered furniture and sofas, OEM/ODM for global brands.",
  },
  {
    name: "Haier Smart Electronics",
    image: "/haier.png",
    address: "Haier Industrial Park, Qingdao, Shandong, China",
    info: "Top-rated smart appliances & IoT solutions factory.",
  },
  {
    name: "Gree Electric Appliances Inc.",
    image: "/gree.jpg",
    address: "No. 6, Xin'an Road, Zhuhai, Guangdong, China",
    info: "China’s largest air conditioner and smart electronics exporter.",
  },
  {
    name: "Midea Group",
    image: "/aa.png",
    address: "Midea Headquarters, Foshan, Guangdong, China",
    info: "Global leader in smart home appliances and robotics.",
  },
  {
    name: "Galanz Appliances",
    image: "/galanz.jpg",
    address: "Galanz Industrial Park, Foshan, Guangdong, China",
    info: "Microwaves, refrigerators, and home appliances innovator.",
  },
  {
    name: "TCL Technology",
    image: "/bb.png",
    address: "No. 22, Heung Yip Road, Huizhou, Guangdong, China",
    info: "Renowned factory for electronics, TVs, and panels.",
  },
  {
    name: "Opple Lighting",
    image: "/opple.png",
    address: "No. 1888, North Zhongshan Rd, Shanghai, China",
    info: "China’s #1 smart lighting and LED factory.",
  },
  {
    name: "Zhejiang Xilinmen Furniture",
    image: "/xilinmen.png",
    address: "Shaoxing, Zhejiang, China",
    info: "OEM/ODM mattress and bedding manufacturer.",
  },
];

export default function HomePage() {
  const [homeProducts, setHomeProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setHomeProducts(data.slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">

      {/* Hero Banner */}
      <section className="py-20 text-center bg-green-700 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
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

      {/* Key Selling Points (with same bg as hero/factory cards) */}
      <section className="max-w-6xl mx-auto py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4">
        {[
          {
            icon: <FaBolt className="text-3xl text-green-700 mb-2" />,
            title: "Direct-from-Factory Pricing",
            desc: "Secure exclusive pricing on brand-new products direct from the source. No hidden fees.",
            link: "/about-us",
            linkLabel: "How We Source →",
          },
          {
            icon: <FaCrown className="text-3xl text-yellow-400 mb-2" />,
            title: "VIP Profit Boosts",
            desc: "Grow your wallet, unlock new VIP tiers, and enjoy instant bonus discounts. See your status live!",
            link: "/membership",
            linkLabel: "Explore VIP Benefits →",
          },
          {
            icon: <FaCheckCircle className="text-3xl text-green-700 mb-2" />,
            title: "Fastest Resale System",
            desc: "Simulate instant resale profits, withdraw any time, and track your earnings with zero risk.",
            link: "/faq",
            linkLabel: "How It Works →",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="relative rounded-2xl shadow-xl overflow-hidden flex flex-col items-center border border-green-100"
            style={{
              backgroundImage: "url('/hero-bg.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: 265,
            }}
          >
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col items-center p-7 w-full">
              {item.icon}
              <h3 className="font-bold text-xl text-green-700 mb-2">{item.title}</h3>
              <p className="text-green-600 mb-4">{item.desc}</p>
              <Link className="text-green-700 font-semibold hover:underline" to={item.link}>
                {item.linkLabel}
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Promo Video */}
      <section className="max-w-4xl mx-auto py-14 px-4">
        <div className="rounded-2xl bg-white shadow-xl flex flex-col items-center gap-6 py-6 px-4">
          <div className="relative w-full md:w-[600px]">
            <video
              src="/bamboomall-tiktok-video.mp4"
              className="w-full rounded-xl shadow-lg"
              autoPlay
              loop
              muted
              playsInline
              controls
            />
            <FaTiktok className="absolute top-2 left-2 text-2xl text-white bg-black/50 rounded-full p-1" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-700 mb-2">See Our Real Factory Deals in Action!</h3>
            <p className="text-green-600 mb-4">
              Watch this video for a quick walkthrough of BambooMall and how VIP members profit more every day.
            </p>
            <Link to="/about-us" className="inline-block text-green-700 font-semibold hover:underline">
              More About BambooMall →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-green-50">
        <h2 className="text-center text-3xl font-bold text-green-700 mb-8">Top Factory Deals</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-6 flex flex-col items-center animate-pulse h-60" />
              ))
            : homeProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-white rounded-xl shadow group flex flex-col items-stretch pb-3"
                >
                  {Number(product.discount) > 0 && (
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded z-10 shadow">
                      -{product.discount}%
                    </span>
                  )}
                  <Link to={`/products/${product.id}`} className="flex-1 flex items-center justify-center px-1 pt-3">
                    <img
                      src={getProductImage(product)}
                      alt={product.title || "Product"}
                      className="object-contain w-24 h-24 transition-transform group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex flex-row items-center justify-between px-2 mt-2 mb-0.5">
                    <span className="font-extrabold text-green-700 text-lg">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <button
                      className="bg-green-100 hover:bg-green-600 hover:text-white text-green-700 rounded-full w-8 h-8 flex items-center justify-center shadow transition"
                    >
                      <FaPlus size={16} />
                    </button>
                  </div>
                  <Link to={`/products/${product.id}`} className="block px-2 text-xs text-gray-800 font-semibold line-clamp-2 leading-tight mt-1 hover:underline">
                    {product.title}
                  </Link>
                  {product.size && (
                    <div className="px-2 text-[10px] text-gray-400">{product.size}</div>
                  )}
                </div>
              ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/products" className="inline-block bg-green-700 text-white px-6 py-2 rounded-full font-medium shadow hover:bg-green-800 transition">
            See All Products →
          </Link>
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

      {/* --- China Factories Grid (matches hero bg & card effect) --- */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-center text-3xl font-bold text-green-700 mb-2">
          Trusted Partner Factories Across China
        </h2>
        <p className="text-center text-green-500 text-base mb-8">
          Every partner is a verified, high-volume exporter serving top brands worldwide.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {factories.map((f, i) => (
            <div
              key={i}
              className="relative rounded-2xl shadow-lg overflow-hidden flex flex-col items-center"
              style={{
                minHeight: '340px',
                backgroundImage: "url('/hero-bg.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1.5px solid #d1fae5'
              }}
            >
              <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />
              <div className="relative z-10 flex flex-col items-center p-6 w-full">
                <img
                  src={f.image}
                  alt={f.name}
                  className="w-28 h-28 object-cover rounded-2xl mb-3 border border-green-100 shadow"
                  style={{ background: '#f0fdf4' }}
                  onError={e => { e.target.onerror = null; e.target.src='/factory-default.png'; }}
                />
                <div className="font-bold text-green-800 text-lg mb-1 text-center">{f.name}</div>
                <div className="text-green-600 text-xs mb-2 text-center">{f.address}</div>
                <p className="text-green-600 text-center text-sm">{f.info}</p>
              </div>
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
