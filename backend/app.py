from flask import Flask, request, jsonify, send_from_directory
try:
    # When run as a module: python -m backend.app
    from .models import db, User, Animal, HealthRecord, Booking, PricingRule
except ImportError:  # When run directly: python app.py from backend folder
    from models import db, User, Animal, HealthRecord, Booking, PricingRule
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
    # uploads folder
    upload_dir = os.path.join(os.getcwd(), 'uploads')
    os.makedirs(upload_dir, exist_ok=True)

    with app.app_context():
        db.create_all()
        # Seed default admin if missing
        try:
            if not User.query.filter_by(username='Admin123').first():
                admin = User(username='Admin123', role='admin')
                admin.set_password('zoosys')
                db.session.add(admin)
                db.session.commit()
        except Exception:
            db.session.rollback()
        # Seed sample animals if none exist
        try:
            if Animal.query.count() == 0:
                samples = [
                    Animal(name='Giraffe', species='Giraffa camelopardalis', description='Tall and graceful herbivore with long necks.'),
                    Animal(name='Crocodile', species='Crocodylus', description='Large aquatic reptile, powerful jaws and armored skin.'),
                    Animal(name='Tiger', species='Panthera tigris', description='Majestic big cat with orange coat and black stripes.')
                ]
                db.session.add_all(samples)
                db.session.commit()
        except Exception:
            db.session.rollback()

    # Path to built frontend (Vite build output)
    FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
    ASSETS_DIR = os.path.join(FRONTEND_DIST, 'assets')
    IMAGES_DIR = os.path.join(FRONTEND_DIST, 'images')

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
        dob_str = data.get('date_of_birth')
        if dob_str:
            try:
                dob = datetime.fromisoformat(dob_str).date()
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
            dob_str = data.get('date_of_birth')
            if dob_str:
                try:
                    a.date_of_birth = datetime.fromisoformat(dob_str).date()
                except Exception:
                    return jsonify({'msg': 'invalid date format'}), 400
            else:
                a.date_of_birth = None
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
            date_str = data.get('date')
            rec_date = datetime.fromisoformat(date_str).date() if date_str else datetime.utcnow().date()
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

    def generate_qr_base64(text: str) -> str:
        img = qrcode.make(text)
        buf = io.BytesIO()
        # PIL accepts a positional format argument; use positional to avoid static analyzer issues
        img.save(buf, 'PNG')
        b = buf.getvalue()
        return base64.b64encode(b).decode('ascii')

    def compute_price_for(date_obj, time_slot, num_adults, num_children):
        # find applicable pricing rule by priority
        rules = PricingRule.query.order_by(PricingRule.priority.desc()).all()
        from datetime import datetime, time as dt_time
        applicable = None
        for r in rules:
            ok = True
            if r.start_date and date_obj < r.start_date:
                ok = False
            if r.end_date and date_obj > r.end_date:
                ok = False
            # days: CSV of 0-6 where Monday=0
            if r.days:
                days = [int(x) for x in r.days.split(',') if x.strip().isdigit()]
                if date_obj.weekday() not in days:
                    ok = False
            # time window check
            if r.start_time or r.end_time:
                try:
                    ts_parts = time_slot.split('-')
                    start_ts = datetime.strptime(ts_parts[0].strip(), '%H:%M').time()
                    # check overlap with rule window
                    if r.start_time:
                        rule_start = datetime.strptime(r.start_time, '%H:%M').time()
                        if start_ts < rule_start:
                            ok = False
                    if r.end_time:
                        rule_end = datetime.strptime(r.end_time, '%H:%M').time()
                        if start_ts > rule_end:
                            ok = False
                except Exception:
                    pass
            if ok:
                applicable = r
                break
        if applicable:
            total = num_adults * applicable.adult_cents + num_children * applicable.child_cents
            return total, applicable.currency
        # fallback default pricing
        default_adult = 20000  # INR paise (200.00 INR)
        default_child = 10000  # 100.00 INR
        return num_adults * default_adult + num_children * default_child, 'INR'

    @app.route('/api/bookings', methods=['POST'])
    @jwt_required()
    def create_booking():
        uid = get_jwt_identity()
        claims = get_jwt()
        data = request.get_json() or {}
        # allowed: any authenticated user (customer, admin)
        date_str = data.get('date')
        if not date_str:
            return jsonify({'msg': 'date required'}), 400
        try:
            bdate = datetime.fromisoformat(date_str).date()
        except Exception:
            return jsonify({'msg': 'invalid date format'}), 400
        time_slot = data.get('time_slot') or '09:00-11:00'
        num_adults = int(data.get('num_adults', 1))
        num_children = int(data.get('num_children', 0))
        # allow client to pass price_cents/currency, else compute using pricing rules
        price_cents = data.get('price_cents')
        currency = data.get('currency', 'INR')
        if price_cents is None:
            price_cents, currency = compute_price_for(bdate, time_slot, num_adults, num_children)
        paid = data.get('paid', False)

        booking = Booking(
            user_id=int(uid) if uid else None,
            date=bdate,
            time_slot=time_slot,
            num_adults=num_adults,
            num_children=num_children,
            price_cents=price_cents,
            currency=currency,
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

    # Pricing rule CRUD (admin only)
    @app.route('/api/pricing', methods=['POST'])
    @jwt_required()
    def create_pricing():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        data = request.get_json() or {}
        def parse_date(s):
            try:
                return datetime.fromisoformat(s).date() if s else None
            except Exception:
                return None
        r = PricingRule(
            name=data.get('name'),
            start_date=parse_date(data.get('start_date')),
            end_date=parse_date(data.get('end_date')),
            days=data.get('days'),
            start_time=data.get('start_time'),
            end_time=data.get('end_time'),
            adult_cents=int(data.get('adult_cents', 0)),
            child_cents=int(data.get('child_cents', 0)),
            currency=data.get('currency', 'INR'),
            priority=int(data.get('priority', 0))
        )
        db.session.add(r)
        db.session.commit()
        return jsonify(r.to_dict()), 201

    @app.route('/api/pricing', methods=['GET'])
    @jwt_required()
    def list_pricing():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        rules = PricingRule.query.order_by(PricingRule.priority.desc()).all()
        return jsonify([r.to_dict() for r in rules])

    @app.route('/api/pricing/<int:rule_id>', methods=['PUT'])
    @jwt_required()
    def update_pricing(rule_id):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        r = PricingRule.query.get_or_404(rule_id)
        data = request.get_json() or {}
        for f in ('name','days','start_time','end_time','currency'):
            if f in data:
                setattr(r, f, data[f])
        if 'start_date' in data:
            sd = data.get('start_date')
            if sd:
                try:
                    r.start_date = datetime.fromisoformat(sd).date()
                except Exception:
                    return jsonify({'msg':'invalid date'}), 400
            else:
                r.start_date = None
        if 'end_date' in data:
            ed = data.get('end_date')
            if ed:
                try:
                    r.end_date = datetime.fromisoformat(ed).date()
                except Exception:
                    return jsonify({'msg':'invalid date'}), 400
            else:
                r.end_date = None
        if 'adult_cents' in data:
            r.adult_cents = int(data.get('adult_cents', 0))
        if 'child_cents' in data:
            r.child_cents = int(data.get('child_cents', 0))
        if 'priority' in data:
            r.priority = int(data.get('priority', 0))
        db.session.commit()
        return jsonify(r.to_dict())

    @app.route('/api/pricing/<int:rule_id>', methods=['DELETE'])
    @jwt_required()
    def delete_pricing(rule_id):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        r = PricingRule.query.get_or_404(rule_id)
        db.session.delete(r)
        db.session.commit()
        return jsonify({'msg':'deleted'})

    @app.route('/api/bookings/<int:booking_id>/pay', methods=['POST'])
    @jwt_required()
    def pay_booking(booking_id):
        # payment stub: mark paid
        b = Booking.query.get_or_404(booking_id)
        b.paid = True
        db.session.commit()
        return jsonify({'msg': 'payment recorded', 'booking': b.to_dict()})

    # Image uploads (admin-only)
    @app.route('/api/upload-image', methods=['POST'])
    @jwt_required()
    def upload_image():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        if 'file' not in request.files:
            return jsonify({'msg': 'no file'}), 400
        f = request.files['file']
        if not f.filename:
            return jsonify({'msg': 'empty filename'}), 400
        # allow only jpeg/jpg/png
        fname = f.filename
        ext = os.path.splitext(fname)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png']:
            return jsonify({'msg': 'only .jpg, .jpeg, .png allowed'}), 400
        # optional target name, e.g., building.jpg or animals/lion.jpg
        target = request.form.get('target') or fname
        safe_target = target.replace('..','').lstrip('/\\')
        full_dir = os.path.join(upload_dir, os.path.dirname(safe_target))
        os.makedirs(full_dir, exist_ok=True)
        full_path = os.path.join(upload_dir, safe_target)
        f.save(full_path)
        url = "/uploads/" + safe_target.replace("\\", "/")
        return jsonify({'msg':'uploaded', 'url': url})

    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(upload_dir, filename)

    # Simple root index for quick checks
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            'service': 'Smart Zoo API',
            'version': 'prototype',
            'endpoints': [
                '/api/register', '/api/login', '/api/animals', '/api/bookings', '/api/staff'
            ],
            'note': 'This is an API server; use /api/* endpoints or run the frontend.'
        })

    @app.route('/api/chat', methods=['POST'])
    def chat():
        # very simple dynamic chatbot: looks for intents and responds.
        data = request.get_json() or {}
        msg = (data.get('message') or '').strip()
        if not msg:
            return jsonify({'reply': "Please type a question about hours, pricing, or bookings."})

        lower = msg.lower()
        if any(k in lower for k in ['hi','hello','hey']):
            return jsonify({'reply': 'Hello! How can I help you with your visit today?'})
        if any(k in lower for k in ['hour','open','close','time']):
            return jsonify({'reply': 'We are open daily from 9:00 AM to 6:00 PM.'})
        if any(k in lower for k in ['price','ticket','cost','inr']):
            # derive a sample price using today, default slot, 2 adults / 1 child
            from datetime import datetime as dt
            today = dt.utcnow().date()
            try:
                total_cents, currency = compute_price_for(today, '09:00-11:00', 2, 1)
                amount = f"₹{round(total_cents/100):,}"
                return jsonify({'reply': f'Today\'s indicative price for a family (2 adults, 1 child) is around {amount} {currency}. Actual price varies by date/time.'})
            except Exception:
                return jsonify({'reply': 'Standard prices start from ₹200 for adults and ₹100 for children. Final price depends on date/time.'})
        if any(k in lower for k in ['book','booking','tickets']):
            return jsonify({'reply': 'You can book tickets on the Bookings page. After payment, your QR code appears in My Tickets.'})
        if any(k in lower for k in ['refund','cancel']):
            return jsonify({'reply': 'Please contact support at support@zoo.example for refund/cancellation assistance.'})
        if any(k in lower for k in ['direction','address','where']):
            return jsonify({'reply': 'We are located at Smart Zoo, City Center. Parking is available on-site.'})
        return jsonify({'reply': "I'm not sure, but a human will help soon. Try asking about hours, pricing, or booking."})

    # --- Frontend static file serving (production/dev fallback) ---
    # Serve Vite build outputs so the app works without running the Vite dev server.
    @app.route('/assets/<path:filename>')
    def serve_assets(filename):
        # hashed JS/CSS and other compiled assets live here after build
        return send_from_directory(ASSETS_DIR, filename)

    @app.route('/images/<path:filename>')
    def serve_images(filename):
        # public images (copied by Vite) are under dist/images
        return send_from_directory(IMAGES_DIR, filename)

    @app.route('/favicon.svg')
    def serve_favicon():
        return send_from_directory(FRONTEND_DIST, 'favicon.svg')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        # Let API and uploads be handled by their routes
        if path.startswith('api/') or path.startswith('uploads/'):
            return jsonify({'msg': 'Not Found'}), 404
        # If a direct file exists in dist, serve it (e.g., index.html, manifest, etc.)
        requested = os.path.join(FRONTEND_DIST, path)
        if path and os.path.isfile(requested):
            # serve the exact file
            directory = os.path.dirname(requested)
            filename = os.path.basename(requested)
            return send_from_directory(directory, filename)
        # Otherwise, fall back to SPA index.html
        index_path = os.path.join(FRONTEND_DIST, 'index.html')
        if os.path.isfile(index_path):
            return send_from_directory(FRONTEND_DIST, 'index.html')
        # If the build is missing, show an informative error
        return jsonify({'msg': 'Frontend build not found. Please run npm run build in frontend.'}), 500

    return app


if __name__ == '__main__':
    create_app().run(debug=True)
