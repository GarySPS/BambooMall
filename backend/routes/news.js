const express = require('express');
const Parser = require('rss-parser');
const router = express.Router();
const parser = new Parser();

// TEST: Use BBC first to check everything works
const sources = [
  { name: "China Daily", url: "http://www.chinadaily.com.cn/rss/business_rss.xml" }
];

router.get('/', async (req, res) => {
  try {
    let allNews = [];
    for (const source of sources) {
      try {
        const feed = await parser.parseURL(source.url);
        console.log(`Fetched ${feed.items?.length || 0} items from ${source.name}`);
        const items = (feed.items || []).map(item => ({
          title: item.title,
          link: item.link,
          date: item.pubDate,
          source: source.name,
          image: (item.enclosure && item.enclosure.url) || '',
        }));
        allNews = allNews.concat(items);
      } catch (err) {
        console.error(`Failed to fetch ${source.name}:`, err.message);
      }
    }
    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(allNews.slice(0, 20));
  } catch (err) {
    console.error('NEWS ROUTE ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
