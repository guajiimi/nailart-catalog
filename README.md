# Nail Studio Catalog

Full-stack nail art catalog with admin dashboard. FastAPI + SQLite + Jinja2.

## Features

- Public catalog with category filter, search, grid/list view
- Detail pane with WhatsApp booking CTA
- Admin dashboard with full CRUD
- SQLite database (no external dependencies)
- Mobile responsive

## Setup

```bash
pip install -r requirements.txt
python seed.py
uvicorn main:app --host 0.0.0.0 --port 8088
```

## Admin Login

- URL: `/admin/login`
- Username: `admin`
- Password: `admin123`

## API

- `GET /api/designs` — all active designs (JSON)
- `GET /api/designs/{id}` — single design
- `GET /api/categories` — category list with counts

## Stack

- Python 3.12+
- FastAPI + Uvicorn
- SQLite (WAL mode)
- Jinja2 templates
- Vanilla JS (no frameworks)
