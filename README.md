git clone https://github.com/rutujapopkar/Zooverse.git
<h1 align="center">Zooverse – Smart Zoo Management Platform</h1>
<p align="center"><strong>Backend: Flask • Frontend: React (Vite + MUI) • Database: SQLite (dev)</strong></p>

---

## 1. Overview
Zooverse is a prototype zoo operations platform implementing:

- User registration & JWT authentication
- Role-based access (customer, admin, vet, staff)
- Animals CRUD (admin / vet)
- Image management & presence checks
- Ticket bookings with QR code generation
- Dynamic pricing logic (rules table)
- Admin dashboards & doctor dashboard
- Defensive frontend data normalization (pagination aware)

Designed for fast local spin‑up (Windows/PowerShell). SQLite is used for development; pluggable via `DATABASE_URL`.

---
## 2. Quick Start (TL;DR)
```powershell
git clone https://github.com/rutujapopkar/Zooverse.git
cd Zooverse
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m backend.app   # starts API at http://127.0.0.1:5000

# In a second PowerShell
cd frontend
npm install --legacy-peer-deps
npm run dev              # opens http://localhost:5173
```
Login as admin with:
```
Username: Admin123
Password: zoosys
Role: admin (seeded automatically)
```
Seeded vet login:
```
Username: Doctor1
Password: doctorpass
Role: vet
```

Register a normal customer via the Register page (always created with role=customer).

---
## 3. Tech Stack
| Layer | Technology | Notes |
|-------|------------|-------|
| Backend | Flask, SQLAlchemy, Flask-JWT-Extended | JWT access tokens only (no refresh yet) |
| DB (dev) | SQLite | Single canonical file under `backend/instance/zoo.db` |
| Frontend | React 18, Vite, Material UI | Axios interceptor for auth, ErrorBoundaries |
| Styles | MUI system + semantic CSS | Tailwind removed for simpler handoff |
| Testing | pytest | Two sample backend tests (animals CRUD, bookings/staff) |

---
## 4. Directory Map (Key Paths)
```
backend/            Flask application package
	app.py            App factory + routes
	models.py         SQLAlchemy models
	ensure_admin.py   Utility to guarantee admin/columns
frontend/           React app (Vite)
	src/
		pages/          Page components (Admin*, DoctorDashboard, Dashboard, etc.)
		components/     Reusable UI pieces & layout
		utils/          Normalization + axios setup
uploads/            Runtime uploaded images (served statically)
tests/              Pytest suites
```

---
## 5. Roles & Access Summary
| Role | Created How | Capabilities |
|------|-------------|--------------|
| admin | Seeded (Admin123) / DB update | Manage animals, staff, pricing, view all bookings |
| vet | Seeded (Doctor1) or created by admin | View animals, create/update animals, vet dashboards |
| staff | Created by admin (if endpoint implemented) | (Future expansion) |
| customer | Self-register | Book tickets, view own bookings & “My Tickets” |

JWT claim `role` is enforced in protected endpoints. Frontend guards (`RequireAdmin`, `RequireVet`, `RequireAuth`) wrap routes.

---
## 6. Backend Setup (Detailed)
1. Create venv & install deps:
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
2. (Optional) Override env vars:
```powershell
$Env:JWT_SECRET_KEY = 'change-me-secure'
$Env:DATABASE_URL = 'sqlite:///custom.db'
```
3. Run API:
```powershell
python -m backend.app
```
Output shows chosen DB path and any migration adjustments.

### Production-esque Launch (Waitress example)
```powershell
.\.venv\Scripts\waitress-serve --listen=0.0.0.0:8000 --call backend.app:create_app
```

---
## 7. Frontend Setup
```powershell
cd frontend
npm install --legacy-peer-deps
npm run dev
```
App runs at `http://localhost:5173` (or next free port). Backend must be running for API calls.

### Production Build
```powershell
npm run build
```
Artifacts in `frontend/dist/`. You can serve them via any static server or integrate into Flask (custom static serving can be added if desired).

---
## 8. Authentication Flow
1. User registers: `POST /api/register` -> role always `customer`.
2. Login: `POST /api/login` returns `{ access_token }`.
3. Frontend stores token in `localStorage` as `token`.
4. Axios request interceptor injects `Authorization: Bearer <token>` automatically.
5. Protected endpoints use `@jwt_required()` and check `get_jwt()['role']`.

No refresh tokens yet; expired tokens require manual re-login.

---
## 9. Key API Endpoints (Implemented)
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | /api/register | Public | Creates customer |
| POST | /api/login | Public | JWT issue |
| GET | /api/animals | Public | Paginated `{data, meta}` |
| POST | /api/animals | Admin/Vet | Create animal |
| PUT | /api/animals/<id> | Admin/Vet | Update |
| GET | /api/bookings | User/Admin | Paginated; user sees own, admin sees all |
| POST | /api/bookings | Auth | Create booking & QR |
| POST | /api/pricing | Admin | Create pricing rule |
| GET | /api/pricing | Admin | List rules |

Pagination format:
```json
{
	"data": [...],
	"meta": { "page":1, "per_page":20, "total":57, "pages":3 }
}
```

---
## 10. Frontend Resilience Patterns
- All list-fetch pages wrap API responses with `normalizeList()` to handle array or `{data}` shapes.
- ErrorBoundary added for admin/vet critical pages.
- Axios interceptor logs 401 centrally.
- Defensive rendering: `(Array.isArray(list) ? list : [])` before `.map()`.

---
## 11. Default Credentials
| Username | Password | Role | Source |
|----------|----------|------|--------|
| Admin123 | zoosys | admin | Seeded in app start |
| Doctor1  | doctorpass | vet | Seeded in app start |

Change these for any real deployment. Set a strong `JWT_SECRET_KEY`.

---
## 12. Image Handling
Animal images expected under `frontend/public/images/animals/`. The backend relinks `photo_url` at startup if matching file names exist (case-insensitive mapping). Supported extensions: `.jpeg`, `.jpg`, `.png`.

Uploading (admin Images page) sends files to `/api/upload-image` which stores under `/uploads` and serves them statically.

Naming tip: Use exact animal name with spaces (e.g. `Indian Elephant.jpeg`) for auto-detection.

---
## 13. Bookings & Pricing
- Price calculated via highest-priority applicable rule else defaults (Adult 200 INR, Child 100 INR).
- Price fields stored as integer paise (`price_cents`).
- QR code (base64 PNG) stored in booking row (`qr_code_b64`).

---
## 14. Running Tests
```powershell
.\.venv\Scripts\Activate.ps1
pytest -q
```
Tests use isolated temp SQLite DBs via `DATABASE_URL` override.

---
## 15. Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| 401 after login | Wrong credentials or expired token | Re-login; check console for interceptor log |
| animals.map crash (old build) | Using stale bundle without normalization | Hard refresh (Ctrl+F5) |
| Images 404 | Filename mismatch (case/space) | Ensure correct name in `public/images/animals` |
| ImportError relative | Ran `app.py` directly | Use `python -m backend.app` |
| No admin rights | Using newly registered customer | Login with `Admin123/zoosys` or promote user in DB |

---
## 16. Production Hardening (Not Yet Implemented)
- Refresh tokens / expiry handling
- Rate limiting & audit log surfacing UI
- PostgreSQL deployment & migrations (Alembic)
- S3 / CDN for images
- Role-based menu hiding (frontend) beyond guards
- Structured logging / external aggregator

---
## 17. Security Notes
- Default secrets MUST be changed before any public exposure.
- Do not commit a production `.env` with real keys.
- JWT currently uses only access tokens; revoke/rotation strategy is not yet implemented.

---
## 18. Fast Reset (Dev)
Delete DB & restart:
```powershell
Remove-Item -Force -ErrorAction SilentlyContinue backend\instance\zoo.db
python -m backend.app
```

---
## 19. Git Workflow (Example)
```powershell
git checkout -b feature/some-change
# edit code
git add .
git commit -m "feat: describe change"
git push origin feature/some-change
```
Open a Pull Request on GitHub.

---
## 20. License / Usage
Prototype for demonstration—license not explicitly declared. Add a LICENSE file if distributing.

---
## 21. Contact / Support
If something fails to run:
1. Confirm Python + Node versions.
2. Reinstall dependencies (`pip install -r requirements.txt`, `npm install`).
3. Clear browser cache / hard reload.
4. Check backend console for stack traces.

---
Happy exploring the Zoo! 🦁


