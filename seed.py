"""Seed database with initial nail art designs and default admin."""
import hashlib
from database import get_db, init_db

DESIGNS = [
    {
        "category": "Gel Polish",
        "name": "Rose Gold Gel",
        "description": "Gel polish warna rose gold dengan finishing glossy. Tahan hingga 3 minggu tanpa mengelupas. Cocok untuk tampilan elegan sehari-hari.",
        "price": 150000,
        "duration": "45 menit",
        "durability": "3 minggu",
        "image_url": "https://picsum.photos/seed/roseGoldNail/500/375",
        "badge": "populer",
    },
    {
        "category": "Minimalis",
        "name": "Clean Girl Aesthetic",
        "description": "Nail art minimalis dengan warna nude dan aksen garis emas tipis. Tampilan clean yang cocok untuk semua acara.",
        "price": 120000,
        "duration": "40 menit",
        "durability": "2 minggu",
        "image_url": "https://picsum.photos/seed/cleanGirlNail/500/375",
        "badge": None,
    },
    {
        "category": "French Tips",
        "name": "Classic French",
        "description": "French tips klasik dengan base sheer pink dan ujung putih bersih. Timeless, elegan, cocok untuk wedding atau formal event.",
        "price": 180000,
        "duration": "50 menit",
        "durability": "3 minggu",
        "image_url": "https://picsum.photos/seed/classicFrenchTip/500/375",
        "badge": None,
    },
    {
        "category": "Nail Art",
        "name": "Floral Chrome",
        "description": "Nail art bunga dengan efek chrome yang memantulkan cahaya. Desain unik yang dibuat tangan, setiap nail pasti berbeda.",
        "price": 250000,
        "duration": "60 menit",
        "durability": "2 minggu",
        "image_url": "https://picsum.photos/seed/floralChromeNail/500/375",
        "badge": "baru",
    },
    {
        "category": "Acrylic",
        "name": "Coffin Shape Ombre",
        "description": "Acrylic extension bentuk coffin dengan gradasi ombre pink ke putih. Tahan lama dan kuat, cocok untuk yang suka kuku panjang.",
        "price": 300000,
        "duration": "90 menit",
        "durability": "4 minggu",
        "image_url": "https://picsum.photos/seed/coffinOmbreNail/500/375",
        "badge": None,
    },
    {
        "category": "Gel Polish",
        "name": "Burgundy Velvet",
        "description": "Gel polish warna burgundy dengan velvet matte finish. Cocok untuk tampilan bold dan sophisticated.",
        "price": 160000,
        "duration": "45 menit",
        "durability": "3 minggu",
        "image_url": "https://picsum.photos/seed/burgundyVelvetNail/500/375",
        "badge": None,
    },
]

def seed():
    init_db()
    conn = get_db()

    # Seed admin
    pw_hash = hashlib.sha256("admin123".encode()).hexdigest()
    try:
        conn.execute("INSERT INTO admins (username, password_hash) VALUES (?, ?)", ("admin", pw_hash))
        print("[+] Admin created: admin / admin123")
    except Exception:
        print("[~] Admin already exists, skipping")

    # Seed designs
    existing = conn.execute("SELECT COUNT(*) FROM designs").fetchone()[0]
    if existing > 0:
        print(f"[~] {existing} designs already exist, skipping seed")
    else:
        for d in DESIGNS:
            conn.execute(
                "INSERT INTO designs (category, name, description, price, duration, durability, image_url, badge) VALUES (?,?,?,?,?,?,?,?)",
                (d["category"], d["name"], d["description"], d["price"], d["duration"], d["durability"], d["image_url"], d["badge"])
            )
        print(f"[+] Seeded {len(DESIGNS)} designs")

    conn.commit()
    conn.close()
    print("[+] Database ready: nailart.db")

if __name__ == "__main__":
    seed()
