//src>routs>news.js

const express = require('express');
const Parser = require('rss-parser');
const router = express.Router();
const parser = new Parser({
  timeout: 5000, // FAST FAIL: Give up after 5 seconds if source is slow
});

// 1. CACHE SYSTEM: Store news here so we don't fetch every time
let newsCache = {
  data: [],
  lastFetch: 0
};
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour Cache

const sources = [
  { 
    name: "Supply Chain Dive", 
    url: "https://www.supplychaindive.com/feeds/news/",
    category: "Logistics"
  },
  { 
    name: "FreightWaves", 
    url: "https://www.freightwaves.com/feed",
    category: "Global Trade"
  },
  // COMMENTED OUT SLOW SOURCES causing your timeout
  // { 
  //   name: "China Briefing", 
  //   url: "https://www.china-briefing.com/news/feed/",
  //   category: "China Business"
  // },
  // {
  //   name: "Sourcing Journal",
  //   url: "https://sourcingjournal.com/feed/",
  //   category: "Retail Sourcing"
  // }
];

const RELEVANT_KEYWORDS = [
  "trade", "export", "import", "logistics", "supply chain", 
  "manufacturing", "freight", "cargo", "tariff", "china", 
  "factory", "production", "sourcing", "retail", "container", 
  "shipping", "port", "customs", "b2b", "e-commerce"
];

const isRelevant = (item) => {
  const text = `${item.title} ${item.content || ''} ${item.contentSnippet || ''}`.toLowerCase();
  return RELEVANT_KEYWORDS.some(keyword => text.includes(keyword));
};

router.get('/', async (req, res) => {
  try {
    // 2. CHECK CACHE FIRST
    const now = Date.now();
    if (newsCache.data.length > 0 && (now - newsCache.lastFetch < CACHE_DURATION)) {
      console.log('SERVING FROM CACHE (INSTANT LOAD)');
      return res.json(newsCache.data);
    }

    console.log('CACHE EXPIRED OR EMPTY. FETCHING FRESH NEWS...');
    let allNews = [];
    
    // Fetch from all sources in parallel
    const feedPromises = sources.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        
        const items = (feed.items || []).map(item => {
            let imageUrl = '';
            if (item.enclosure && item.enclosure.url) imageUrl = item.enclosure.url;
            else if (item["media:content"] && item["media:content"].$ && item["media:content"].$.url) imageUrl = item["media:content"].$.url;
            else if (item.content && item.content.match(/src="([^"]+)"/)) imageUrl = item.content.match(/src="([^"]+)"/)[1];

            return {
                title: item.title,
                link: item.link,
                date: item.pubDate,
                source: source.name,
                category: source.category,
                image: imageUrl,
                snippet: item.contentSnippet || item.content || ""
            };
        });

        return items;
      } catch (err) {
        console.error(`Skipping ${source.name} (Slow/Error):`, err.message);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    
    results.forEach(items => {
        allNews = allNews.concat(items);
    });

    const filteredNews = allNews
        .filter(isRelevant)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 24);

    // 3. UPDATE CACHE
    if (filteredNews.length > 0) {
      newsCache.data = filteredNews;
      newsCache.lastFetch = now;
    }

    res.json(newsCache.data);

  } catch (err) {
    console.error('NEWS ROUTE ERROR:', err);
    // If fail, return old cache if available
    if (newsCache.data.length > 0) return res.json(newsCache.data);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;