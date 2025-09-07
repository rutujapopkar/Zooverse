Smart Zoo Management System - Backend (prototype)

This repository contains a minimal Flask backend for the Smart Zoo Management System. It implements:
- User registration and login (JWT)
- Animal CRUD endpoints
- Basic health record endpoints for veterinarians

Quick start (Windows PowerShell):

# create a virtualenv and activate
python -m venv .venv; .\.venv\Scripts\Activate.ps1
# install
pip install -r requirements.txt
# run
python -m backend.app

The application uses SQLite by default (zoo.db in the repo folder). Set DATABASE_URL and JWT_SECRET_KEY environment variables for production.

Waitress (Windows production example):

Use MODULE:OBJECT format and --call when serving a factory function.

```powershell
set DATABASE_URL=sqlite:///zoo.db
set JWT_SECRET_KEY=change-this-secret
.venv\Scripts\waitress-serve --listen=0.0.0.0:8000 --call backend.app:create_app
```

Frontend (quick start with Vite + React):

I can scaffold a minimal Vite React app and wire login/register to the backend. Tell me whether you want JavaScript or TypeScript and I will create the frontend files.
