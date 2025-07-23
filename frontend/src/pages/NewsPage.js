import React, { useEffect, useState } from "react";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => {
        // Log and adapt for both {news: []} and [] structures
        console.log("NEWS API:", data);
        if (Array.isArray(data)) {
          setNews(data);
        } else if (Array.isArray(data.news)) {
          setNews(data.news);
        } else {
          setNews([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setNews([]);
        setLoading(false);
      });
  }, []);


  return (
    <div className="min-h-screen px-2 pb-24">
      <div className="max-w-2xl mx-auto pt-14 pb-4 px-2">
        <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-6 text-center font-['Montserrat']">
          China Factory & Retail News
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Latest live headlines from the world’s top suppliers.
        </p>
        {loading ? (
          <div className="text-center text-green-600 py-8 text-lg">Loading news…</div>
        ) : (
          <div className="grid gap-7">
            {news.map((post, i) => (
              <a
                href={post.link}
                key={i}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white premium-card shadow-lg hover:shadow-2xl transition-shadow duration-200 group"
              >
                {post.image && (
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
                    <span>{post.source}</span>
                    <span>{post.date ? post.date.substr(0, 10) : ""}</span>
                  </div>
                  <h2 className="font-bold text-lg text-gray-900 group-hover:text-green-700">
                    {post.title}
                  </h2>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
