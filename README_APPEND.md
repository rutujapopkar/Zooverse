## Troubleshooting: Ensure Admin utility

If you can’t log in as admin or aren’t sure which SQLite DB file is in use, run the helper from the repo root:

```powershell
# after creating and activating the venv
python -m backend.ensure_admin

# optionally override defaults (Admin123 / zoosys)
$Env:ADMIN_USERNAME = 'Admin123'
$Env:ADMIN_PASSWORD = 'your-strong-pass'
python -m backend.ensure_admin
```

What it does:
- Scans likely DB paths: `instance/zoo.db`, `backend/instance/zoo.db`, and `zoo.db`.
- Ensures the admin user exists and updates the password.
- Adapts to older schemas (adds a missing `role` column if possible; supports legacy `password` field).

Common messages:
- `skip (missing)`: The DB file wasn’t found at that path.
- `skip (no user table)`: The DB exists but the `user` table hasn’t been created yet (run the app once to initialize).
- `updated existing user to admin`: Found the user and updated to role admin with the new password.
- `created new admin user`: Inserted a new admin account with the provided username/password.
- `error: <TypeError/OperationalError/...>`: The script explains the error class and message; share it if you need help.

Next steps:
- Start the backend and log in with the credentials you set.
- If still failing, confirm the backend console shows which DB it opened on startup (`[startup] Using database: ...`). Point the ensure_admin tool to that file path if needed.
