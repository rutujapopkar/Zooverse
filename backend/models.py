from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='customer')
    # Extended profile fields (for doctors/staff)
    full_name = db.Column(db.String(120), nullable=True)
    specialization = db.Column(db.String(120), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    email = db.Column(db.String(160), unique=True, nullable=True)
    membership_level = db.Column(db.String(40), nullable=True)  # future use
    membership_points = db.Column(db.Integer, nullable=False, default=0)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'full_name': self.full_name,
            'email': self.email,
            'membership_level': self.membership_level,
            'membership_points': self.membership_points
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
    weight_kg = db.Column(db.Float, nullable=True)
    temperature_c = db.Column(db.Float, nullable=True)
    vaccination = db.Column(db.String(120), nullable=True)
    critical = db.Column(db.Boolean, default=False)
    attachment_url = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'veterinarian_id': self.veterinarian_id,
            'date': self.date.isoformat(),
            'notes': self.notes,
            'diagnosis': self.diagnosis,
            'treatment': self.treatment
            ,'weight_kg': self.weight_kg
            ,'temperature_c': self.temperature_c
            ,'vaccination': self.vaccination
            ,'critical': self.critical
            ,'attachment_url': self.attachment_url
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


# Ticket types (e.g., Adult, Child, Group, Seasonal Pass)
class TicketType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    adult_price_cents = db.Column(db.Integer, nullable=False, default=0)
    child_price_cents = db.Column(db.Integer, nullable=False, default=0)
    group_size = db.Column(db.Integer, nullable=True)  # for group/seasonal logic
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'adult_price_cents': self.adult_price_cents,
            'child_price_cents': self.child_price_cents,
            'group_size': self.group_size,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class TicketSale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticket_type_id = db.Column(db.Integer, db.ForeignKey('ticket_type.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # who performed sale (admin) or customer
    channel = db.Column(db.String(20), nullable=False, default='online')  # online/offline
    quantity_adults = db.Column(db.Integer, nullable=False, default=0)
    quantity_children = db.Column(db.Integer, nullable=False, default=0)
    total_cents = db.Column(db.Integer, nullable=False, default=0)
    currency = db.Column(db.String(3), nullable=False, default='INR')
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_type_id': self.ticket_type_id,
            'user_id': self.user_id,
            'channel': self.channel,
            'quantity_adults': self.quantity_adults,
            'quantity_children': self.quantity_children,
            'total_cents': self.total_cents,
            'currency': self.currency,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(120), nullable=True)
    start_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.String(5), nullable=True)  # HH:MM
    end_time = db.Column(db.String(5), nullable=True)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class NewsItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    summary = db.Column(db.String(255), nullable=True)
    body = db.Column(db.Text, nullable=True)
    published = db.Column(db.Boolean, default=True)
    publish_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'summary': self.summary,
            'body': self.body,
            'published': self.published,
            'publish_date': self.publish_date.isoformat() if self.publish_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class PageContent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    page_key = db.Column(db.String(50), unique=True, nullable=False)  # e.g., about, contact
    title = db.Column(db.String(150), nullable=True)
    body = db.Column(db.Text, nullable=True)
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.now(), onupdate=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'page_key': self.page_key,
            'title': self.title,
            'body': self.body,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    message = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=True)  # 1-5
    sentiment = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='open')  # open/responded
    admin_response = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    responded_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'rating': self.rating,
            'sentiment': self.sentiment,
            'status': self.status,
            'admin_response': self.admin_response,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'responded_at': self.responded_at.isoformat() if self.responded_at else None
        }


class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    action = db.Column(db.String(80), nullable=False)
    entity = db.Column(db.String(80), nullable=True)
    entity_id = db.Column(db.Integer, nullable=True)
    meta = db.Column(db.Text, nullable=True)  # JSON string (renamed from metadata to avoid reserved name)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'entity': self.entity,
            'entity_id': self.entity_id,
            'meta': self.meta,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AnimalAssignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animal.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role = db.Column(db.String(30), nullable=True)  # caretaker/vet
    start_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'user_id': self.user_id,
            'role': self.role,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class FavoriteAnimal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    animal_id = db.Column(db.Integer, db.ForeignKey('animal.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'animal_id': self.animal_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class FavoriteEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'event_id': self.event_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# Appointment scheduling for animals (vet checkups)
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animal.id'), nullable=False)
    veterinarian_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(5), nullable=True)  # HH:MM
    reason = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='scheduled')  # scheduled/completed/cancelled
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'veterinarian_id': self.veterinarian_id,
            'date': self.date.isoformat() if self.date else None,
            'time': self.time,
            'reason': self.reason,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class TreatmentPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animal.id'), nullable=False)
    veterinarian_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'veterinarian_id': self.veterinarian_id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class MedicineRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animal.id'), nullable=True)
    veterinarian_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    medicine_name = db.Column(db.String(120), nullable=False)
    quantity = db.Column(db.String(60), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='open')  # open/approved/rejected
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'veterinarian_id': self.veterinarian_id,
            'medicine_name': self.medicine_name,
            'quantity': self.quantity,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }


class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animal.id'), nullable=False)
    veterinarian_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    severity = db.Column(db.String(20), nullable=False, default='info')  # info/warn/critical
    message = db.Column(db.String(255), nullable=False)
    resolved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'veterinarian_id': self.veterinarian_id,
            'severity': self.severity,
            'message': self.message,
            'resolved': self.resolved,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }
