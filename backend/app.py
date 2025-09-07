from flask import Flask, request, jsonify
from .models import db, User, Animal, HealthRecord
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_cors import CORS
import os
from datetime import datetime
import base64
import io
import qrcode


def create_app():
    app = Flask(__name__)
    # Use SQLite DB by default for quick start; change to POSTGRES URI in production
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///zoo.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-change-me')

    db.init_app(app)
    # enable CORS for frontend apps (adjust origins in production)
    CORS(app)
    jwt = JWTManager(app)

    with app.app_context():
        db.create_all()

    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json() or {}
        username = data.get('username')
        password = data.get('password')
        role = data.get('role', 'customer')
        if not username or not password:
            return jsonify({'msg': 'username and password required'}), 400
        if User.query.filter_by(username=username).first():
            return jsonify({'msg': 'user already exists'}), 400
        u = User(username=username, role=role)
        u.set_password(password)
        db.session.add(u)
        db.session.commit()
        return jsonify(u.to_dict()), 201

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json() or {}
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'msg': 'username and password required'}), 400
        u = User.query.filter_by(username=username).first()
        if not u or not u.check_password(password):
            return jsonify({'msg': 'bad credentials'}), 401
        # JWT identity must be a string (subject). Put role into additional claims.
        token = create_access_token(identity=str(u.id), additional_claims={'role': u.role})
        return jsonify({'access_token': token})

    # Animal CRUD
    @app.route('/api/animals', methods=['POST'])
    @jwt_required()
    def create_animal():
        uid = get_jwt_identity()
        claims = get_jwt()
        if claims.get('role') not in ('admin', 'vet'):
            return jsonify({'msg': 'forbidden'}), 403
        data = request.get_json() or {}
        dob = None
        if data.get('date_of_birth'):
            try:
                dob = datetime.fromisoformat(data.get('date_of_birth')).date()
            except Exception:
                return jsonify({'msg': 'invalid date format, use ISO YYYY-MM-DD'}), 400
        animal = Animal(
            name=data.get('name'),
            species=data.get('species'),
            date_of_birth=dob,
            habitat_id=data.get('habitat_id'),
            assigned_veterinarian_id=data.get('assigned_veterinarian_id'),
            description=data.get('description'),
            photo_url=data.get('photo_url')
        )
        db.session.add(animal)
        db.session.commit()
        return jsonify(animal.to_dict()), 201

    @app.route('/api/animals', methods=['GET'])
    def list_animals():
        q = request.args.get('q')
        query = Animal.query
        if q:
            like = f"%{q}%"
            query = query.filter((Animal.name.ilike(like)) | (Animal.species.ilike(like)))
        animals = [a.to_dict() for a in query.all()]
        return jsonify(animals)

    @app.route('/api/animals/<int:animal_id>', methods=['GET'])
    def get_animal(animal_id):
        a = Animal.query.get_or_404(animal_id)
        return jsonify(a.to_dict())

    @app.route('/api/animals/<int:animal_id>', methods=['PUT'])
    @jwt_required()
    def update_animal(animal_id):
        uid = get_jwt_identity()
        claims = get_jwt()
        if claims.get('role') not in ('admin', 'vet'):
            return jsonify({'msg': 'forbidden'}), 403
        a = Animal.query.get_or_404(animal_id)
        data = request.get_json() or {}
        for field in ('name', 'species', 'habitat_id', 'assigned_veterinarian_id', 'description', 'photo_url'):
            if field in data:
                setattr(a, field, data[field])
        if 'date_of_birth' in data:
            try:
                a.date_of_birth = datetime.fromisoformat(data.get('date_of_birth')).date()
            except Exception:
                return jsonify({'msg': 'invalid date format'}), 400
        db.session.commit()
        return jsonify(a.to_dict())

    @app.route('/api/animals/<int:animal_id>', methods=['DELETE'])
    @jwt_required()
    def delete_animal(animal_id):
        uid = get_jwt_identity()
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        a = Animal.query.get_or_404(animal_id)
        db.session.delete(a)
        db.session.commit()
        return jsonify({'msg': 'deleted'})

    # Simple health records endpoints (vet + admin)
    @app.route('/api/animals/<int:animal_id>/records', methods=['POST'])
    @jwt_required()
    def add_health_record(animal_id):
        uid = get_jwt_identity()
        claims = get_jwt()
        if claims.get('role') not in ('admin', 'vet'):
            return jsonify({'msg': 'forbidden'}), 403
        a = Animal.query.get_or_404(animal_id)
        data = request.get_json() or {}
        try:
            rec_date = datetime.fromisoformat(data.get('date')).date() if data.get('date') else datetime.utcnow().date()
        except Exception:
            return jsonify({'msg': 'invalid date format'}), 400
        hr = HealthRecord(
            animal_id=a.id,
            veterinarian_id=int(uid) if uid is not None else None,
            date=rec_date,
            notes=data.get('notes'),
            diagnosis=data.get('diagnosis'),
            treatment=data.get('treatment')
        )
        db.session.add(hr)
        db.session.commit()
        return jsonify(hr.to_dict()), 201

    @app.route('/api/animals/<int:animal_id>/records', methods=['GET'])
    @jwt_required()
    def list_health_records(animal_id):
        claims = get_jwt()
        # vets and admins can view; customers cannot
        if claims.get('role') not in ('admin', 'vet'):
            return jsonify({'msg': 'forbidden'}), 403
        records = HealthRecord.query.filter_by(animal_id=animal_id).all()
        return jsonify([r.to_dict() for r in records])

    # Staff management (admin only)
    @app.route('/api/staff', methods=['POST'])
    @jwt_required()
    def create_staff():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        data = request.get_json() or {}
        username = data.get('username')
        password = data.get('password')
        role = data.get('role', 'customer')
        if not username or not password:
            return jsonify({'msg': 'username and password required'}), 400
        if User.query.filter_by(username=username).first():
            return jsonify({'msg': 'user exists'}), 400
        u = User(username=username, role=role)
        u.set_password(password)
        db.session.add(u)
        db.session.commit()
        return jsonify(u.to_dict()), 201

    @app.route('/api/staff', methods=['GET'])
    @jwt_required()
    def list_staff():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        users = User.query.all()
        return jsonify([u.to_dict() for u in users])

    @app.route('/api/staff/<int:user_id>', methods=['PUT'])
    @jwt_required()
    def update_staff(user_id):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        u = User.query.get_or_404(user_id)
        data = request.get_json() or {}
        if 'role' in data:
            u.role = data['role']
        if 'password' in data:
            u.set_password(data['password'])
        db.session.commit()
        return jsonify(u.to_dict())

    @app.route('/api/staff/<int:user_id>', methods=['DELETE'])
    @jwt_required()
    def delete_staff(user_id):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        u = User.query.get_or_404(user_id)
        db.session.delete(u)
        db.session.commit()
        return jsonify({'msg': 'deleted'})

    # Booking endpoints (customers create, admin can view/manage)
    from .models import Booking

    def generate_qr_base64(text: str) -> str:
        img = qrcode.make(text)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        b = buf.getvalue()
        return base64.b64encode(b).decode('ascii')

    @app.route('/api/bookings', methods=['POST'])
    @jwt_required()
    def create_booking():
        uid = get_jwt_identity()
        claims = get_jwt()
        data = request.get_json() or {}
        # allowed: any authenticated user (customer, admin)
        try:
            bdate = datetime.fromisoformat(data.get('date')).date()
        except Exception:
            return jsonify({'msg': 'invalid date format'}), 400
        time_slot = data.get('time_slot') or '09:00-11:00'
        num_adults = int(data.get('num_adults', 1))
        num_children = int(data.get('num_children', 0))
        # price calc stub: 1000 cents per adult, 500 per child
        price_cents = num_adults * 1000 + num_children * 500
        paid = data.get('paid', False)

        booking = Booking(
            user_id=int(uid) if uid else None,
            date=bdate,
            time_slot=time_slot,
            num_adults=num_adults,
            num_children=num_children,
            price_cents=price_cents,
            paid=bool(paid)
        )
        db.session.add(booking)
        db.session.commit()

        # generate QR with booking id
        qr_text = f"booking:{booking.id}"
        booking.qr_code_b64 = generate_qr_base64(qr_text)
        db.session.commit()
        return jsonify(booking.to_dict()), 201

    @app.route('/api/bookings', methods=['GET'])
    @jwt_required()
    def list_bookings():
        claims = get_jwt()
        uid = get_jwt_identity()
        if claims.get('role') == 'admin':
            bs = Booking.query.all()
        else:
            bs = Booking.query.filter_by(user_id=int(uid)).all()
        return jsonify([b.to_dict() for b in bs])

    @app.route('/api/bookings/<int:booking_id>/pay', methods=['POST'])
    @jwt_required()
    def pay_booking(booking_id):
        # payment stub: mark paid
        b = Booking.query.get_or_404(booking_id)
        b.paid = True
        db.session.commit()
        return jsonify({'msg': 'payment recorded', 'booking': b.to_dict()})

    return app


if __name__ == '__main__':
    create_app().run(debug=True)
