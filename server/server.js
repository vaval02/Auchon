const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// In-memory data (initial subset copied from app defaults)
let categories = [
  { id: 'fruits-legumes', name: 'Fruits et légumes', products: [ { id: 6, name: 'Carottes' }, { id: 8, name: 'Pommes' }, { id: 9, name: 'Tomates' } ] },
  { id: 'epicerie', name: 'Épicerie', products: [ { id: 23, name: 'Pâtes' }, { id: 24, name: 'Riz' }, { id: 25, name: 'Sauce tomate' } ] },
  { id: 'produits-laitiers', name: 'Produits laitiers', products: [ { id: 18, name: 'Lait' }, { id: 19, name: 'Yaourt' } ] }
];

function levenshtein(a, b) {
  if (!a || !b) return (a || b) ? Math.max(a.length, b.length) : 0;
  a = a.toLowerCase(); b = b.toLowerCase();
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const lev = levenshtein(a, b);
  return 1 - lev / Math.max(a.length, b.length);
}

app.get('/categories', (req, res) => {
  res.json(categories.map(c => ({ id: c.id, name: c.name }))); 
});

app.get('/products', (req, res) => {
  const query = (req.query.q || '').trim();
  const results = [];
  categories.forEach(cat => {
    cat.products.forEach(p => results.push(Object.assign({}, p, { category: cat.id })));
  });
  if (!query) return res.json(results);
  const q = query.toLowerCase();
  const filtered = results.filter(p => p.name.toLowerCase().includes(q) || similarity(p.name, query) >= 0.75);
  res.json(filtered);
});

app.post('/products', (req, res) => {
  const { categoryId, name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  const category = categories.find(c => c.id === categoryId) || categories[0];
  const newId = Date.now();
  const product = { id: newId, name };
  category.products.push(product);
  res.json(product);
});

app.get('/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const candidates = [];
  categories.forEach(cat => cat.products.forEach(p => candidates.push(Object.assign({}, p, { category: cat.id }))));
  const scored = candidates.map(p => ({ score: similarity(p.name, q), product: p }));
  scored.sort((a,b) => b.score - a.score);
  res.json(scored.filter(s => s.score >= 0.5).map(s => s.product));
});

// Diagnostic report receiver: saves last report to disk and logs it
app.post('/report', (req, res) => {
  try {
    const payload = req.body || {};
    console.log('Received diagnostic report from client:', payload && payload.summary ? payload.summary : '(no summary)');
    const fs = require('fs');
    fs.writeFileSync('./server/last_report.json', JSON.stringify({ receivedAt: new Date().toISOString(), payload }, null, 2));
    res.json({ ok: true });
  } catch (err) {
    console.error('Error saving report', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Mock server running on http://localhost:${port}`));
