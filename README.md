## Zooverse — Smart Zoo Management (Prototype)

This repository contains a prototype Smart Zoo Management system (backend API + React frontend). The frontend is optimized for Indian operations (INR pricing by default). The README below shows how to clone, run, and administer the system locally on Windows.

## Quick summary
- Backend: Flask + SQLAlchemy (SQLite by default). JWT auth via Flask-JWT-Extended.
- Frontend: Vite + React + Material UI.
- Features implemented: user auth, animals CRUD, health records, bookings (QR tickets), admin staff management, dynamic pricing rules (backend-driven), My Tickets page, admin animals UI, 3D preview placeholder.

## Prerequisites
- Windows 10/11
- Python 3.10+ (or 3.8+) installed. You can use the Microsoft Store Python or python.org installer.
- Node.js 18+ and npm
- Git

## Clone
Open PowerShell and run:

```powershell
cd C:\path\to\dev
git clone https://github.com/rutujapopkar/Zooverse.git
cd Zooverse
```

## Backend setup (Windows PowerShell)
1. Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install Python dependencies:

```powershell
pip install -r requirements.txt
```

3. Environment variables (optional):
- `DATABASE_URL` — SQLAlchemy URI (default: `sqlite:///zoo.db`)
- `JWT_SECRET_KEY` — secret key for JWT tokens (default in dev: `super-secret-change-me`)

You can set them in PowerShell for a session:

```powershell
$Env:JWT_SECRET_KEY = 'replace-with-secure-key'
$Env:DATABASE_URL = 'sqlite:///zoo.db'
```

4. Run the backend server (development):

```powershell
# From repo root
.\.venv\Scripts\python.exe -m backend.app
```

By default the Flask dev server will listen on http://127.0.0.1:5000.

Production note: on Windows consider using Waitress:

```powershell
.\.venv\Scripts\waitress-serve --listen=0.0.0.0:8000 --call backend.app:create_app
```

## Frontend setup (Windows PowerShell)
1. Install node dependencies:

```powershell
Set-Location -Path .\frontend
npm install --legacy-peer-deps
```

2. Start dev server:

```powershell
npm run dev
```

Vite will run and (if port 3000 is busy) auto-select another port like 3001. The frontend proxies `/api` to the backend (development) — confirm proxy config in `frontend/vite.config.js` if backend runs on a different host/port.

To build production assets:

```powershell
npm run build
```

## Seeding an admin user (quick)
With backend running, register and promote a user:

1. Register a user via API or the frontend register page: POST `/api/register` with `username` and `password`.
2. If you need admin access immediately, change the role in the database or use the staff endpoints (if you already have an admin). To change directly in SQLite (quick & dirty):

```powershell
# Use sqlite3 (or GUI). Example sqlite3 commands:
sqlite3 zoo.db
UPDATE user SET role='admin' WHERE username='youruser';
.quit
```

## Pricing rules (admin)
Dynamic pricing rules are stored in the backend table `pricing_rule`. Admin-only endpoints exist to manage them:
- POST `/api/pricing` — create rule (admin only)
- GET `/api/pricing` — list (admin only)
- PUT `/api/pricing/<id>` — update
- DELETE `/api/pricing/<id>` — delete

Fields supported:
- `name`, `start_date`, `end_date` (ISO YYYY-MM-DD), `days` (CSV of 0-6, Monday=0), `start_time`, `end_time` (HH:MM), `adult_cents`, `child_cents`, `currency`, `priority`.

Example: create a weekend surcharge rule for Saturdays/Sundays (priority 10) with higher prices:

```powershell
# Assuming you have an admin token
curl -X POST http://127.0.0.1:5000/api/pricing -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"name":"Weekend Premium","days":"5,6","adult_cents":30000,"child_cents":15000,"currency":"INR","priority":10}'
```

Prices are stored as integer smallest-units (paise for INR) in `adult_cents` and `child_cents`. When a booking is created without a price, the backend computes price using the highest-priority applicable rule.

## Notes & troubleshooting
- The frontend no longer shows any USD or $ signs — it defaults to INR.
- If you see `ImportError: attempted relative import with no known parent package` when running `app.py` directly, run the app as a module: `python -m backend.app` from repo root or use the waitress command above.
- If you change models, you can delete `zoo.db` and restart to recreate schema (development). For production, add proper migrations (Alembic).

## Development tips
- To run backend tests (if present):

```powershell
.\.venv\Scripts\Activate.ps1
pytest -q
```

- To inspect booking/pricing data quickly, use SQLite browser or `sqlite3` CLI.

## Next improvements you can add
- Real payment gateway integration for INR (e.g., Razorpay, Stripe INR flows).
- Formal DB migrations with Alembic.
- Role-based route guards and admin UI polishing.
- Serve the built frontend via the backend for simple deployment.

---
If you'd like, I can also add example seed scripts (create an admin user and a few pricing rules) and a Postman collection for easy API testing — tell me if you want that and I'll add it next.
