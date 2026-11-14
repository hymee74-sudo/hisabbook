const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(express.json({ limit: '2mb' }));
const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGODB_URI;
const APP_PASSWORD = process.env.APP_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
if (!MONGODB_URI || !APP_PASSWORD || !JWT_SECRET) {
  console.error('Missing MONGODB_URI, APP_PASSWORD or JWT_SECRET environment variable.');
  process.exit(1);
}

const dataSchema = new mongoose.Schema({ key: { type: String, unique: true }, entries: { type: Array, default: [] }, activeUser: { type: String, default: 'u1' }, updatedAt: { type: Date, default: Date.now } }, { versionKey: false });
const HisabData = mongoose.model('HisabData', dataSchema);

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Login required' }); }
}

app.post('/api/login', (req, res) => {
  if (!req.body || req.body.password !== APP_PASSWORD) return res.status(401).json({ error: 'Password galat hai' });
  const token = jwt.sign({ app: 'hisabbook' }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

app.get('/api/entries', auth, async (req, res) => {
  try {
    const doc = await HisabData.findOne({ key: 'main' }).lean();
    res.json({ entries: doc?.entries || [], activeUser: doc?.activeUser || 'u1' });
  } catch (e) { res.status(500).json({ error: 'Database read failed' }); }
});

app.put('/api/entries', auth, async (req, res) => {
  try {
    const entries = req.body?.entries;
    if (!Array.isArray(entries) || entries.length > 50000) return res.status(400).json({ error: 'Invalid entries data' });
    await HisabData.findOneAndUpdate({ key: 'main' }, { $set: { entries, activeUser: req.body.activeUser === 'u2' ? 'u2' : 'u1', updatedAt: new Date() } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json({ ok: true, count: entries.length });
  } catch (e) { res.status(500).json({ error: 'Database save failed' }); }
});

app.get('/api/health', (req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

mongoose.connect(MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log(`HisabBook server listening on ${PORT}`));
}).catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
