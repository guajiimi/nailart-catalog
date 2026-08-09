# Nail Studio Catalog

Nail art catalog with admin dashboard. Svelte + Express + SQLite.

## Stack
- **Frontend:** Svelte (Vite)
- **Backend:** Express + better-sqlite3
- **DB:** SQLite

## Setup
```bash
npm install
cd frontend && npm install && npm run build && cd ..
node seed.js
node server.js
```

## PM2
```bash
pm2 start server.js --name nailart
pm2 save
```

## URL
- Catalog: `https://files.gracexz.my.id/nail/`
- Admin: `https://files.gracexz.my.id/nail/admin/login.html`
- API: `https://files.gracexz.my.id/nail/api/designs`

## Admin
- User: `admin`
- Pass: `admin123`
