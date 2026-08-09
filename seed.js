const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

const db = new Database(path.join(__dirname, 'nailart.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS designs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    duration TEXT DEFAULT '',
    durability TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    badge TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

const hashPw = pw => crypto.createHash('sha256').update(pw).digest('hex');

try {
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hashPw('admin123'));
  console.log('[+] Admin: admin / admin123');
} catch { console.log('[~] Admin exists'); }

const count = db.prepare('SELECT COUNT(*) as c FROM designs').get().c;
if (count > 0) {
  console.log(`[~] ${count} designs exist, skip`);
  process.exit(0);
}

const designs = [
  ['Gel Polish', 'Rose Gold Gel', 'Gel polish warna rose gold dengan finishing glossy. Tahan hingga 3 minggu tanpa mengelupas. Cocok untuk tampilan elegan sehari-hari.', 150000, '45 menit', '3 minggu', 'https://picsum.photos/seed/roseGoldNail/500/375', 'populer'],
  ['Minimalis', 'Clean Girl Aesthetic', 'Nail art minimalis dengan warna nude dan aksen garis emas tipis. Tampilan clean yang cocok untuk semua acara.', 120000, '40 menit', '2 minggu', 'https://picsum.photos/seed/cleanGirlNail/500/375', null],
  ['French Tips', 'Classic French', 'French tips klasik dengan base sheer pink dan ujung putih bersih. Timeless, elegan, cocok untuk wedding atau formal event.', 180000, '50 menit', '3 minggu', 'https://picsum.photos/seed/classicFrenchTip/500/375', null],
  ['Nail Art', 'Floral Chrome', 'Nail art bunga dengan efek chrome yang memantulkan cahaya. Desain unik yang dibuat tangan, setiap nail pasti berbeda.', 250000, '60 menit', '2 minggu', 'https://picsum.photos/seed/floralChromeNail/500/375', 'baru'],
  ['Acrylic', 'Coffin Shape Ombre', 'Acrylic extension bentuk coffin dengan gradasi ombre pink ke putih. Tahan lama dan kuat, cocok untuk yang suka kuku panjang.', 300000, '90 menit', '4 minggu', 'https://picsum.photos/seed/coffinOmbreNail/500/375', null],
  ['Gel Polish', 'Burgundy Velvet', 'Gel polish warna burgundy dengan velvet matte finish. Cocok untuk tampilan bold dan sophisticated.', 160000, '45 menit', '3 minggu', 'https://picsum.photos/seed/burgundyVelvetNail/500/375', null],
];

const stmt = db.prepare('INSERT INTO designs (category, name, description, price, duration, durability, image_url, badge) VALUES (?,?,?,?,?,?,?,?)');
const tx = db.transaction(() => designs.forEach(d => stmt.run(...d)));
tx();
console.log(`[+] Seeded ${designs.length} designs`);
