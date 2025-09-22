"""Utility script to guarantee an admin account exists.

Run with:  python -m backend.ensure_admin  (from repo root)

Creates or updates Admin123 with password 'zoosys' by default.
Override via environment variables:
  ADMIN_USERNAME, ADMIN_PASSWORD

It scans likely SQLite DB paths used in this project and applies the change
to each existing DB so you don't have to guess which one the app is using.
"""
from __future__ import annotations
import os
import sqlite3
from dataclasses import dataclass

try:
    # Use werkzeug if available for proper password hashing
    from werkzeug.security import generate_password_hash
except Exception:  # graceful fallback (NOT recommended for production)
    def generate_password_hash(pw: str) -> str:  # type: ignore
        return pw  # plain text (only if werkzeug missing)


DEFAULT_USERNAME = os.environ.get("ADMIN_USERNAME", "Admin123")
DEFAULT_PASSWORD = os.environ.get("ADMIN_PASSWORD", "zoosys")


@dataclass
class Result:
    path: str
    action: str
    error: str | None = None


def ensure_admin(path: str, username: str, password: str) -> Result:
    if not os.path.exists(path):
        return Result(path, "skip (missing)")
    try:
        con = sqlite3.connect(path)
        cur = con.cursor()
        # confirm user table exists
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user'")
        if not cur.fetchone():
            return Result(path, "skip (no user table)")
        # Introspect columns so we can satisfy NOT NULL defaults dynamically
        cur.execute("PRAGMA table_info('user')")
        cols = {r[1]: r for r in cur.fetchall()}  # name -> tuple
        has_membership_points = 'membership_points' in cols
        has_membership_level = 'membership_level' in cols
        cur.execute("SELECT id, password_hash FROM user WHERE username=?", (username,))
        row = cur.fetchone()
        phash = generate_password_hash(password)
        if row:
            cur.execute("UPDATE user SET role='admin', password_hash=? WHERE id=?", (phash, row[0]))
            action = "updated existing user to admin"
        else:
            # Build insert fields dynamically
            from typing import Any
            fields = ['username', 'role', 'password_hash']
            values: list[Any] = [username, 'admin', phash]
            if has_membership_level:
                fields.append('membership_level')
                values.append('')  # blank level
            if has_membership_points:
                fields.append('membership_points')
                # Ensure integer type acceptable for sqlite parameter binding
                values.append(0)  # start at 0
            placeholders = ','.join(['?'] * len(values))
            cur.execute(
                f"INSERT INTO user({','.join(fields)}) VALUES ({placeholders})",
                values,
            )
            action = "created new admin user"
        con.commit()
        return Result(path, action)
    except Exception as e:  # pragma: no cover - best effort utility
        return Result(path, "error", str(e))
    finally:
        try:
            con.close()  # type: ignore
        except Exception:
            pass


def main():  # pragma: no cover
    candidates = [
        # Likely locations present in repo
        os.path.join('instance', 'zoo.db'),
        os.path.join('backend', 'instance', 'zoo.db'),
        # Conventional root DB if URI were "sqlite:///zoo.db"
        'zoo.db',
    ]
    print(f"Ensuring admin '{DEFAULT_USERNAME}' across possible DBs...")
    results = [ensure_admin(p, DEFAULT_USERNAME, DEFAULT_PASSWORD) for p in candidates]
    for r in results:
        print(f"{r.path}: {r.action}{' - ' + r.error if r.error else ''}")
    print("Done. Try logging in with those credentials.")


if __name__ == "__main__":  # pragma: no cover
    main()
