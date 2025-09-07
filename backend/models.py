from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='customer')

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role
        }

class Animal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    species = db.Column(db.String(120), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    habitat_id = db.Column(db.Integer, nullable=True)
    assigned_veterinarian_id = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    photo_url = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'species': self.species,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'habitat_id': self.habitat_id,
            'assigned_veterinarian_id': self.assigned_veterinarian_id,
            'description': self.description,
            'photo_url': self.photo_url
        }

class HealthRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animal.id'), nullable=False)
    veterinarian_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    diagnosis = db.Column(db.String(255), nullable=True)
    treatment = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'veterinarian_id': self.veterinarian_id,
            'date': self.date.isoformat(),
            'notes': self.notes,
            'diagnosis': self.diagnosis,
            'treatment': self.treatment
        }


class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    date = db.Column(db.Date, nullable=False)
    time_slot = db.Column(db.String(50), nullable=False)
    num_adults = db.Column(db.Integer, nullable=False, default=1)
    num_children = db.Column(db.Integer, nullable=False, default=0)
    price_cents = db.Column(db.Integer, nullable=False, default=0)
    currency = db.Column(db.String(3), nullable=False, default='INR')
    paid = db.Column(db.Boolean, default=False)
    qr_code_b64 = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat(),
            'time_slot': self.time_slot,
            'num_adults': self.num_adults,
            'num_children': self.num_children,
            'price_cents': self.price_cents,
            'paid': self.paid,
            'qr_code_b64': self.qr_code_b64,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class PricingRule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=True)
    # optional date range (inclusive)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    # optional days of week as CSV of 0-6 (Mon=0 .. Sun=6)
    days = db.Column(db.String(32), nullable=True)
    # optional time window (HH:MM format)
    start_time = db.Column(db.String(5), nullable=True)
    end_time = db.Column(db.String(5), nullable=True)
    # prices in smallest currency unit (cents/paise)
    adult_cents = db.Column(db.Integer, nullable=False, default=0)
    child_cents = db.Column(db.Integer, nullable=False, default=0)
    currency = db.Column(db.String(3), nullable=False, default='INR')
    # higher priority rules apply first
    priority = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'days': self.days,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'adult_cents': self.adult_cents,
            'child_cents': self.child_cents,
            'currency': self.currency,
            'priority': self.priority
        }
