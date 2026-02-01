//src>pages>BlogPage.js

import React from "react";
import { CalendarDays, ArrowRightCircle } from "lucide-react";

// Always latest post first, sorted by date
const blogPosts = [
  {
    title: "The Importance of Customer Reviews",
    date: "July 18, 2025",
    content:
      "Learn why customer reviews matter and how positive feedback can drastically boost your sales performance.",
  },
  {
    title: "Top 5 Trending Products in July",
    date: "July 15, 2025",
    content:
      "Check out the hottest selling items this month and why customers love them. Grab these products before they're sold out!",
  },
  {
    title: "How to Make Profit with BambooMall",
    date: "July 12, 2025",
    content:
      "Learn tips & tricks on maximizing your earnings as a BambooMall reseller. From VIP upgrades to trending product picks, we’ve got you covered!",
  },
  {
    title: "Introducing VIP Badge System",
    date: "July 08, 2025",
    content:
      "Now you can unlock animated VIP badges and get extra discounts with wallet upgrades. See Membership page for details.",
  },
  {
    title: "Understanding the BambooMall Wallet",
    date: "July 05, 2025",
    content:
      "Everything you need to know about managing your wallet balance, making deposits, and utilizing funds effectively.",
  },
  {
    title: "BambooMall Success Stories",
    date: "July 02, 2025",
    content:
      "Read inspiring stories from resellers who turned their BambooMall journey into remarkable successes.",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-2 sm:px-6">
      <h1 className="text-4xl font-bold text-green-800 mb-2 text-center drop-shadow">
        BambooMall Blog
      </h1>
      <p className="text-lg text-gray-500 text-center mb-10">
        Tips, updates, and inspiring stories for every BambooMall member.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {blogPosts.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-24">
            <span className="text-2xl text-gray-400 mb-4">📝</span>
            <p className="text-gray-500 text-lg">Blog posts coming soon. Stay tuned!</p>
          </div>
        ) : (
          blogPosts.map((post, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-7 group flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-green-700 group-hover:text-green-800 transition-colors duration-200">
                    {post.title}
                  </h2>
                  <div className="flex items-center text-gray-400">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    <span className="text-sm">{post.date}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 line-clamp-3">
                  {post.content}
                </p>
              </div>
              <button
                className="inline-flex items-center text-green-700 opacity-60 cursor-not-allowed font-medium transition-colors duration-200"
                disabled
                aria-disabled
                title="Read More coming soon"
              >
                Read More <ArrowRightCircle className="w-5 h-5 ml-2" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
