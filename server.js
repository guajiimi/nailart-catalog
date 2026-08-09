const express = require('express');
const Database = require('better-sqlite3');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8088;
const SECRET = process.env.SECRET || 'nailart-secret-2026';
const BASE = '/nail';
const distDir = path.join(__dirname, 'frontend', 'dist');

const db = new Database(path.join(__dirname, 'nailart.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const hashPw = pw => crypto.createHash('sha256').update(pw).digest('hex');
const fmtPrice = p => 'Rp ' + Number(p).toLocaleString('id-ID').replace(/,/g, '.');
const makeToken = (id, user) => Buffer.from(JSON.stringify({ id, user, ts: Date.now() })).toString('base64');
const verifyToken = t => { try { return JSON.parse(Buffer.from(t, 'base64').toString()); } catch { return null; } };
const getAdmin = req => {
  const t = req.cookies.admin_session;
  if (!t) return null;
  const d = verifyToken(t);
  return d && Date.now() - d.ts < 86400000 ? d : null;
};

// === API ===
app.get(`${BASE}/api/designs`, (req, res) => {
  const rows = db.prepare('SELECT * FROM designs WHERE is_active = 1 ORDER BY id').all();
  res.json(rows.map(r => ({ ...r, price_formatted: fmtPrice(r.price) })));
});

app.get(`${BASE}/api/designs/:id`, (req, res) => {
  const r = db.prepare('SELECT * FROM designs WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json({ ...r, price_formatted: fmtPrice(r.price) });
});

app.get(`${BASE}/api/categories`, (req, res) => {
  res.json(db.prepare('SELECT category, COUNT(*) as count FROM designs WHERE is_active = 1 GROUP BY category ORDER BY category').all());
});

app.get(`${BASE}/api/admin/designs`, (req, res) => {
  if (!getAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const rows = db.prepare('SELECT * FROM designs ORDER BY id').all();
  res.json(rows.map(r => ({ ...r, price_formatted: fmtPrice(r.price) })));
});

app.get(`${BASE}/api/admin/me`, (req, res) => {
  const a = getAdmin(req);
  if (!a) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ username: a.user });
});

// === AUTH ===
app.post(`${BASE}/api/admin/login`, (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || admin.password_hash !== hashPw(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.cookie('admin_session', makeToken(admin.id, admin.username), { httpOnly: true, maxAge: 86400000, sameSite: 'lax' });
  res.json({ ok: true });
});

app.post(`${BASE}/api/admin/logout`, (req, res) => {
  res.clearCookie('admin_session');
  res.json({ ok: true });
});

// === CRUD ===
app.post(`${BASE}/api/admin/designs`, (req, res) => {
  if (!getAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { name, category, description, price, duration, durability, image_url, badge, is_active } = req.body;
  db.prepare(
    'INSERT INTO designs (name, category, description, price, duration, durability, image_url, badge, is_active) VALUES (?,?,?,?,?,?,?,?,?)'
  ).run(name, category, description || '', parseInt(price) || 0, duration || '', durability || '', image_url || '', badge || null, is_active == 0 ? 0 : 1);
  res.json({ ok: true });
});

app.put(`${BASE}/api/admin/designs/:id`, (req, res) => {
  if (!getAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { name, category, description, price, duration, durability, image_url, badge, is_active } = req.body;
  db.prepare(
    'UPDATE designs SET name=?, category=?, description=?, price=?, duration=?, durability=?, image_url=?, badge=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).run(name, category, description || '', parseInt(price) || 0, duration || '', durability || '', image_url || '', badge || null, is_active == 0 ? 0 : 1, req.params.id);
  res.json({ ok: true });
});

app.delete(`${BASE}/api/admin/designs/:id`, (req, res) => {
  if (!getAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  db.prepare('DELETE FROM designs WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.post(`${BASE}/api/admin/designs/:id/toggle`, (req, res) => {
  if (!getAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  db.prepare('UPDATE designs SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// === STATIC ===
app.use(BASE, express.static(distDir));

// SPA fallback — serve index.html for all non-API/non-file routes under /nail
app.use((req, res, next) => {
  if (req.path.startsWith(`${BASE}/api/`)) return next();
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(distDir, 'index.html'));
});

app.get('/', (req, res) => res.redirect(`${BASE}/`));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[+] Nail Studio :${PORT}${BASE}`);
});
