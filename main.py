"""Nail Art Catalog — FastAPI + SQLite + Jinja2."""
import hashlib
import os
from datetime import datetime
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from itsdangerous import URLSafeTimedSerializer
from database import get_db, init_db

app = FastAPI(title="Nail Studio Catalog")
templates = Jinja2Templates(directory=os.path.join(os.path.dirname(__file__), "templates"))

SECRET = os.environ.get("SECRET_KEY", "nailart-secret-change-me-2026")
serializer = URLSafeTimedSerializer(SECRET)

# Helpers
def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def format_price(price: int) -> str:
    """Format 150000 -> 'Rp 150.000'"""
    return "Rp {:,}".format(price).replace(",", ".")

def make_token(admin_id: int, username: str) -> str:
    return serializer.dumps({"id": admin_id, "u": username})

def verify_token(token: str):
    try:
        data = serializer.loads(token, max_age=86400)  # 24h
        return data
    except Exception:
        return None

def get_admin(request: Request):
    """Return admin dict or None from session cookie."""
    token = request.cookies.get("admin_session")
    if not token:
        return None
    return verify_token(token)

# Init DB on startup
@app.on_event("startup")
def startup():
    init_db()

# --- PUBLIC API ---
@app.get("/api/designs")
def api_designs():
    conn = get_db()
    rows = conn.execute("SELECT * FROM designs WHERE is_active = 1 ORDER BY id").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["price_formatted"] = format_price(d["price"])
        result.append(d)
    return JSONResponse(result)

@app.get("/api/designs/{design_id}")
def api_design(design_id: int):
    conn = get_db()
    r = conn.execute("SELECT * FROM designs WHERE id = ?", (design_id,)).fetchone()
    conn.close()
    if not r:
        raise HTTPException(404, "Design not found")
    d = dict(r)
    d["price_formatted"] = format_price(d["price"])
    return JSONResponse(d)

@app.get("/api/categories")
def api_categories():
    conn = get_db()
    rows = conn.execute(
        "SELECT category, COUNT(*) as count FROM designs WHERE is_active = 1 GROUP BY category ORDER BY category"
    ).fetchall()
    conn.close()
    return JSONResponse([dict(r) for r in rows])

# --- PUBLIC PAGES ---
@app.get("/", response_class=HTMLResponse)
def catalog(request: Request):
    return templates.TemplateResponse(request=request, name="catalog.html")

# --- ADMIN ---
@app.get("/admin/login", response_class=HTMLResponse)
def admin_login_page(request: Request, error: str = ""):
    if get_admin(request):
        return RedirectResponse("/admin", status_code=302)
    return templates.TemplateResponse(request=request, name="admin_login.html", context={"error": error})

@app.post("/admin/login")
def admin_login(request: Request, username: str = Form(...), password: str = Form(...)):
    conn = get_db()
    admin = conn.execute("SELECT * FROM admins WHERE username = ?", (username,)).fetchone()
    conn.close()
    if not admin or admin["password_hash"] != hash_pw(password):
        return templates.TemplateResponse(request=request, name="admin_login.html", context={"error": "Username atau password salah"})
    token = make_token(admin["id"], admin["username"])
    resp = RedirectResponse("/admin", status_code=302)
    resp.set_cookie("admin_session", token, httponly=True, max_age=86400)
    return resp

@app.get("/admin/logout")
def admin_logout():
    resp = RedirectResponse("/admin/login", status_code=302)
    resp.delete_cookie("admin_session")
    return resp

@app.get("/admin", response_class=HTMLResponse)
def admin_dashboard(request: Request):
    admin = get_admin(request)
    if not admin:
        return RedirectResponse("/admin/login", status_code=302)
    conn = get_db()
    designs = conn.execute("SELECT * FROM designs ORDER BY id").fetchall()
    categories = conn.execute(
        "SELECT category, COUNT(*) as count FROM designs GROUP BY category ORDER BY category"
    ).fetchall()
    conn.close()
    return templates.TemplateResponse(request=request, name="admin.html", context={
        "admin": admin,
        "designs": [dict(d) for d in designs],
        "categories": [dict(c) for c in categories],
        "format_price": format_price,
    })

@app.post("/admin/designs")
def create_design(
    request: Request,
    name: str = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    price: int = Form(0),
    duration: str = Form(""),
    durability: str = Form(""),
    image_url: str = Form(""),
    badge: str = Form(""),
    is_active: int = Form(1),
):
    admin = get_admin(request)
    if not admin:
        raise HTTPException(401)
    badge_val = badge if badge else None
    conn = get_db()
    conn.execute(
        "INSERT INTO designs (name, category, description, price, duration, durability, image_url, badge, is_active) VALUES (?,?,?,?,?,?,?,?,?)",
        (name, category, description, price, duration, durability, image_url, badge_val, is_active),
    )
    conn.commit()
    conn.close()
    return RedirectResponse("/admin", status_code=302)

@app.post("/admin/designs/{design_id}/edit")
def edit_design(
    design_id: int,
    request: Request,
    name: str = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    price: int = Form(0),
    duration: str = Form(""),
    durability: str = Form(""),
    image_url: str = Form(""),
    badge: str = Form(""),
    is_active: int = Form(1),
):
    admin = get_admin(request)
    if not admin:
        raise HTTPException(401)
    badge_val = badge if badge else None
    conn = get_db()
    conn.execute(
        "UPDATE designs SET name=?, category=?, description=?, price=?, duration=?, durability=?, image_url=?, badge=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        (name, category, description, price, duration, durability, image_url, badge_val, is_active, design_id),
    )
    conn.commit()
    conn.close()
    return RedirectResponse("/admin", status_code=302)

@app.post("/admin/designs/{design_id}/delete")
def delete_design(design_id: int, request: Request):
    admin = get_admin(request)
    if not admin:
        raise HTTPException(401)
    conn = get_db()
    conn.execute("DELETE FROM designs WHERE id = ?", (design_id,))
    conn.commit()
    conn.close()
    return RedirectResponse("/admin", status_code=302)

@app.post("/admin/designs/{design_id}/toggle")
def toggle_design(design_id: int, request: Request):
    admin = get_admin(request)
    if not admin:
        raise HTTPException(401)
    conn = get_db()
    conn.execute("UPDATE designs SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (design_id,))
    conn.commit()
    conn.close()
    return RedirectResponse("/admin", status_code=302)
