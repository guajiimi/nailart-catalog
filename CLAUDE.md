# Nail Art Catalog — Full-Stack with Admin Dashboard

## Stack
- **Backend:** Python FastAPI + SQLite + Jinja2
- **Frontend:** Vanilla HTML/CSS/JS (existing design)
- **DB:** SQLite (no external dependencies)
- **Auth:** Simple session-based for admin

## Requirements

### 1. Database (SQLite)
Table `designs`:
- id INTEGER PRIMARY KEY
- category TEXT (Gel Polish, Acrylic, French Tips, Nail Art, Minimalis)
- name TEXT
- description TEXT
- price INTEGER (in Rupiah, no dots)
- duration TEXT (e.g. "45 menit")
- durability TEXT (e.g. "3 minggu")
- image_url TEXT
- badge TEXT nullable (populer, baru, or NULL)
- is_active BOOLEAN DEFAULT 1
- created_at TIMESTAMP
- updated_at TIMESTAMP

Table `admins`:
- id INTEGER PRIMARY KEY
- username TEXT UNIQUE
- password_hash TEXT

### 2. Public Pages
- `GET /` — Catalog page (the existing split-pane design from /var/www/nailart-sketches/003-split-pane/index.html)
  - Cards load from API endpoint `GET /api/designs`
  - All existing features: search, category filter, grid/list view, detail pane, WhatsApp CTA
  - Mobile responsive (existing CSS)
  
### 3. Admin Dashboard
- `GET /admin/login` — Login page
- `POST /admin/login` — Authenticate
- `GET /admin` — Dashboard with CRUD table
  - List all designs with edit/delete buttons
  - Add new design button
  - Each design: edit form (all fields)
  - Toggle active/inactive
  - Category management (list categories with counts)
- `POST /admin/designs` — Create
- `PUT /admin/designs/{id}` — Update
- `DELETE /admin/designs/{id}` — Delete

### 4. API Endpoints
- `GET /api/designs` — Public JSON (active only)
- `GET /api/designs/{id}` — Single design detail
- `GET /api/categories` — Category list with counts

### 5. Seed Data (6 existing designs)
```
Rose Gold Gel | Gel Polish | Rp 150.000 | 45 menit | 3 minggu | populer
Clean Girl Aesthetic | Minimalis | Rp 120.000 | 40 menit | 2 minggu
Classic French | French Tips | Rp 180.000 | 50 menit | 3 minggu
Floral Chrome | Nail Art | Rp 250.000 | 60 menit | 2 minggu | baru
Coffin Shape Ombre | Acrylic | Rp 300.000 | 90 menit | 4 minggu
Burgundy Velvet | Gel Polish | Rp 160.000 | 45 menit | 3 minggu
```

Default admin: admin / admin123

### 6. Project Structure
```
/root/nailart-catalog/
├── main.py              # FastAPI app entry
├── database.py          # SQLite setup + models
├── seed.py              # Seed data script
├── requirements.txt     # fastapi, uvicorn, jinja2, python-multipart, itsdangerous
├── templates/
│   ├── catalog.html     # Public catalog (adapted from existing HTML)
│   ├── admin_login.html # Admin login
│   └── admin.html       # Admin CRUD dashboard
├── static/
│   └── (if needed)
├── .gitignore
└── README.md
```

### 7. Design Guidelines
- Keep the existing elegant minimalist design language
- Admin dashboard should match the same aesthetic (warm beige/cream palette)
- Use Outfit font
- No emojis in code/UI
- Material/Linear clean aesthetic
- Icons via inline SVG (Lucide style)

### 8. Notes
- WA number placeholder: 6281234567890
- Images use picsum.photos seeded URLs as placeholders
- Price display in frontend: "Rp XXX.XXX" with dot separators
- Admin dashboard: also show price with dot separators
- Run: `uvicorn main:app --host 0.0.0.0 --port 8088`
