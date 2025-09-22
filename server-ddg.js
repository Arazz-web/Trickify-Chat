const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/api/search', async (req, res) => {
  try {
    const q = (req.body.query || '').trim();
    if (!q) return res.status(400).json({ error: 'query required' });

    const url = 'https://html.duckduckgo.com/html?q=' + encodeURIComponent(q);
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await resp.text();
    const $ = cheerio.load(html);

    const results = [];
    $('.result').each((i, el) => {
      if (i >= 8) return;
      const titleEl = $(el).find('a.result__a');
      const snippet = $(el).find('.result__snippet').text().trim();
      const title = titleEl.text().trim();
      const link = titleEl.attr('href');
      if (title && link) results.push({ title, snippet, link });
    });

    res.json({ query: q, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
