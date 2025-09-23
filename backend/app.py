from flask import Flask, request, jsonify, send_from_directory
try:
    # When run as a module: python -m backend.app
    from .models import db, User, Animal, HealthRecord, Booking, PricingRule, TicketType, TicketSale, Event, NewsItem, PageContent, Feedback, AuditLog, AnimalAssignment, Appointment, TreatmentPlan, MedicineRequest, Alert, FavoriteAnimal, FavoriteEvent
except ImportError:  # When run directly: python app.py from backend folder
    from models import db, User, Animal, HealthRecord, Booking, PricingRule, TicketType, TicketSale, Event, NewsItem, PageContent, Feedback, AuditLog, AnimalAssignment, Appointment, TreatmentPlan, MedicineRequest, Alert, FavoriteAnimal, FavoriteEvent
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
    # Force a single canonical SQLite DB inside backend/instance to avoid duplicate DB confusion
    # If DATABASE_URL is set explicitly we still honor it, otherwise we construct an absolute path.
    if 'DATABASE_URL' in os.environ:
        app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
        chosen_db = os.environ['DATABASE_URL']
    else:
        instance_dir = os.path.join(os.path.dirname(__file__), 'instance')
        os.makedirs(instance_dir, exist_ok=True)
        abs_db_path = os.path.abspath(os.path.join(instance_dir, 'zoo.db'))
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{abs_db_path}'
        chosen_db = abs_db_path
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
        print(f"[startup] Using database: {app.config['SQLALCHEMY_DATABASE_URI']}", flush=True)
        db.create_all()
        # --- Lightweight SQLite in-place migration for newly added User columns (dev only) ---
        # If the database was created before fields like full_name, specialization, etc. existed,
        # login/registration will 500 with "no such column" errors. We inspect table_info and issue
        # ALTER TABLE statements for any missing columns. For production use Alembic instead.
        try:
            from sqlalchemy import text
            result = db.session.execute(text("PRAGMA table_info('user')"))
            existing_cols = {row[1] for row in result.fetchall()}
            alter_stmts = []
            if 'full_name' not in existing_cols:
                alter_stmts.append("ALTER TABLE user ADD COLUMN full_name VARCHAR(120)")
            if 'specialization' not in existing_cols:
                alter_stmts.append("ALTER TABLE user ADD COLUMN specialization VARCHAR(120)")
            if 'bio' not in existing_cols:
                alter_stmts.append("ALTER TABLE user ADD COLUMN bio TEXT")
            if 'email' not in existing_cols:
                # uniqueness cannot be retroactively enforced here without table rebuild
                alter_stmts.append("ALTER TABLE user ADD COLUMN email VARCHAR(160)")
            if 'membership_level' not in existing_cols:
                alter_stmts.append("ALTER TABLE user ADD COLUMN membership_level VARCHAR(40)")
            if 'membership_points' not in existing_cols:
                alter_stmts.append("ALTER TABLE user ADD COLUMN membership_points INTEGER NOT NULL DEFAULT 0")
            for stmt in alter_stmts:
                try:
                    db.session.execute(text(stmt))
                except Exception:
                    db.session.rollback()
            if alter_stmts:
                db.session.commit()
        except Exception:
            db.session.rollback()
        # Seed default admin if missing
        try:
            if not User.query.filter_by(username='Admin123').first():
                admin = User(username='Admin123', role='admin')
                admin.set_password('zoosys')
                db.session.add(admin)
                db.session.commit()
        except Exception:
            db.session.rollback()
        # Seed default ticket types if none
        try:
            if TicketType.query.count() == 0:
                base_types = [
                    TicketType(name='Adult', description='Standard adult admission', adult_price_cents=20000, child_price_cents=0),
                    TicketType(name='Child', description='Child admission (under 12)', adult_price_cents=0, child_price_cents=10000),
                    TicketType(name='Family', description='Family bundle (2 adults + 2 children)', adult_price_cents=36000, child_price_cents=0, group_size=4)
                ]
                db.session.add_all(base_types)
                db.session.commit()
        except Exception:
            db.session.rollback()
        # Seed sample vet user
        try:
            if not User.query.filter_by(username='Doctor1').first():
                vet = User(username='Doctor1', role='vet')
                vet.set_password('doctorpass')
                db.session.add(vet)
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

        # Ensure extended animal list (idempotent). Adds any missing by name.
        try:
            from sqlalchemy import func
            extended = [
                ("Asiatic Lion", "Panthera leo persica", "Endangered Asiatic lion subspecies found only in the Gir Forest.", "Asiatic Lion.jpeg"),
                ("Indian Elephant", "Elephas maximus indicus", "Large herbivore playing a key role as a keystone species.", "Indian Elephant.jpeg"),
                ("Sloth Bear", "Melursus ursinus", "Insect-eating bear with shaggy coat and long snout.", "Sloth Bear.jpeg"),
                ("Leopard", "Panthera pardus", "Agile spotted big cat known for its climbing ability.", "Leopard.jpeg"),
                ("Indian Peafowl", "Pavo cristatus", "National bird of India famous for its colorful train.", "Indian Peafowl (Peacock).jpeg"),
                ("Great Hornbill", "Buceros bicornis", "Large hornbill with impressive casque used in resonant calls.", "Great Hornbill.jpeg"),
                ("Gaur", "Bos gaurus", "Massive wild bovid also called the Indian bison.", "Gaur (Indian Bison).jpeg"),
                ("Nilgai", "Boselaphus tragocamelus", "Largest Asian antelope, also known as the blue bull.", "Nilgai (Blue Bull).jpeg"),
                ("Indian Rock Python", "Python molurus", "Non-venomous constrictor inhabiting rocky outcrops and forests.", "Indian Rock Python.jpeg"),
                ("Spotted Deer", "Axis axis", "Also called chital; distinctive white spots on reddish coat.", "Spotted Deer (Chital).jpeg"),
                ("Indian Wolf", "Canis lupus pallipes", "An adaptable subspecies living in grasslands and scrub.", "Indian Wolf.jpeg"),
                ("Indian Rhinoceros", "Rhinoceros unicornis", "Single-horned rhino with armor-like skin folds.", "Indian Rhinoceros.jpeg"),
                ("Blackbuck", "Antilope cervicapra", "Graceful antelope with spiraled horns and striking coloration.", "Blackbuck.jpeg"),
                ("King Cobra", "Ophiophagus hannah", "World's longest venomous snake; feeds mainly on other snakes.", "King Cobra.jpeg"),
                ("Gharial", "Gavialis gangeticus", "Fish-eating crocodilian with long narrow snout.", "Gharial.jpeg"),
                ("Rhesus Macaque", "Macaca mulatta", "Highly adaptable Old World monkey.", "Rhesus Macaque.jpeg"),
                ("Sarus Crane", "Antigone antigone", "Tall wetland bird known for lifelong pair bonds.", "Sarus Crane.jpeg"),
            ]
            added_any = False
            for name, species, desc, filename in extended:
                exists = Animal.query.filter(func.lower(Animal.name) == name.lower()).first()
                if not exists:
                    a = Animal(name=name, species=species, description=desc, photo_url=f"/images/animals/{filename}")
                    db.session.add(a)
                    added_any = True
            if added_any:
                db.session.commit()
        except Exception:
            db.session.rollback()

        # Auto-assign or fix photo_url entries referencing files that exist. Also supports .png.
        def _relink_photos(commit=True):
            """Attempt to (re)link Animal.photo_url values to an existing image file.

            Previous implementation constructed a path using the Animal.name's exact
            casing (e.g. 'Crocodile.jpg'). On some dev setups (notably Vite's static
            serving behaviour or when running through a case‑sensitive layer) a URL
            whose filename case does not exactly match the on-disk filename (e.g.
            'crocodile.jpg') can 404 even on a case‑insensitive underlying FS
            (Windows/macOS). This led to repeated fallback attempts in the frontend.

            Strategy now:
              1. Build a lookup of available files keyed by (lower_basename, ext).
              2. For each animal, if current photo_url is already a valid existing
                 file (exact match), keep it.
              3. Otherwise, look up a file whose lowercased basename matches the
                 animal name lowercased, preferring extensions in priority order.
              4. Store the URL using the actual filename (preserving on-disk case).
            """
            public_img_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'images', 'animals'))
            if not os.path.isdir(public_img_dir):
                return 0
            exts = ('jpeg','jpg','png')
            # Build catalog of existing files (case-insensitive by basename, ext)
            catalog = {}
            try:
                for fn in os.listdir(public_img_dir):
                    full = os.path.join(public_img_dir, fn)
                    if not os.path.isfile(full):
                        continue
                    base, dot, ext = fn.rpartition('.')
                    if not dot:
                        continue
                    e = ext.lower()
                    if e not in exts:
                        continue
                    catalog[(base.lower(), e)] = fn  # preserve actual filename case
            except Exception as e:
                print(f"[startup_warning] relink catalog build failed: {e}", flush=True)
            updated = 0
            for a in Animal.query.all():
                # If current photo_url already points to an existing file, keep it.
                if a.photo_url:
                    candidate_fs = os.path.join(public_img_dir, os.path.basename(a.photo_url))
                    if os.path.isfile(candidate_fs):
                        continue
                animal_key = a.name.lower() if a.name else None
                if not animal_key:
                    continue
                # Try each extension in priority order using actual filename casing.
                chosen = None
                for ext in exts:
                    fn = catalog.get((animal_key, ext))
                    if fn:
                        chosen = fn
                        break
                if chosen:
                    new_url = f"/images/animals/{chosen}"
                    if a.photo_url != new_url:
                        a.photo_url = new_url
                        updated += 1
            if updated and commit:
                try:
                    db.session.commit()
                    print(f"[startup] Linked/updated photo_url for {updated} animals", flush=True)
                except Exception as e:
                    db.session.rollback()
                    print(f"[startup_warning] commit failed during relink: {e}", flush=True)
            return updated
        try:
            _relink_photos(commit=True)
        except Exception as e:
            db.session.rollback()
            print(f"[startup_warning] failed photo relink: {e}", flush=True)

    # Path to built frontend (Vite build output)
    FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
    ASSETS_DIR = os.path.join(FRONTEND_DIST, 'assets')
    IMAGES_DIR = os.path.join(FRONTEND_DIST, 'images')

    @app.route('/api/register', methods=['POST'])
    def register():
        """Public registration: always creates a customer user (ignores supplied role)."""
        try:
            data = request.get_json() or {}
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')
            if not username or not password:
                return jsonify({'msg': 'username and password required'}), 400
            if User.query.filter_by(username=username).first():
                return jsonify({'msg': 'user already exists'}), 400
            if email and User.query.filter_by(email=email).first():
                return jsonify({'msg': 'email already used'}), 400
            u = User(username=username, role='customer', email=email)
            u.set_password(password)
            db.session.add(u)
            db.session.commit()
            return jsonify(u.to_dict()), 201
        except Exception as e:
            return jsonify({'error':'register_failed','detail':str(e)}), 500

    @app.route('/api/login', methods=['POST'])
    def login():
        try:
            data = request.get_json() or {}
            username = data.get('username')
            password = data.get('password')
            if not username or not password:
                return jsonify({'msg': 'username and password required'}), 400
            u = User.query.filter_by(username=username).first()
            if not u or not u.check_password(password):
                return jsonify({'msg': 'bad credentials'}), 401
            token = create_access_token(identity=str(u.id), additional_claims={'role': u.role})
            return jsonify({'access_token': token})
        except Exception as e:
            import traceback, uuid
            trace_id = uuid.uuid4().hex[:8]
            print(f"[login_error {trace_id}] {e}\n{traceback.format_exc()}", flush=True)
            return jsonify({'error':'login_failed','trace_id':trace_id}), 500


    @app.route('/api/admin/users', methods=['POST'])
    @jwt_required()
    def create_user_admin():
        """Admin protected endpoint to create users with arbitrary roles (admin/vet/staff/customer)."""
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        data = request.get_json() or {}
        username = data.get('username')
        password = data.get('password')
        role = data.get('role','customer')
        email = data.get('email')
        if role not in ('admin','vet','staff','customer'):
            return jsonify({'msg':'invalid role'}), 400
        if not username or not password:
            return jsonify({'msg':'username and password required'}), 400
        if User.query.filter_by(username=username).first():
            return jsonify({'msg':'user exists'}), 400
        if email and User.query.filter_by(email=email).first():
            return jsonify({'msg':'email already used'}), 400
        u = User(username=username, role=role, email=email)
        u.set_password(password)
        db.session.add(u)
        db.session.commit()
        return jsonify(u.to_dict()), 201

    @app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
    @jwt_required()
    def update_user_admin(user_id):
        """Admin: update user role and optionally password.

        Payload fields supported:
          - role: one of admin|vet|staff|customer (doctor accepted as alias -> vet)
          - password: if provided and non-empty resets password
        """
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        u = User.query.get_or_404(user_id)
        data = request.get_json() or {}
        new_role = data.get('role')
        if new_role:
            if new_role == 'doctor':
                new_role = 'vet'
            if new_role not in ('admin','vet','staff','customer'):
                return jsonify({'msg':'invalid role'}), 400
            u.role = new_role
        new_pw = data.get('password')
        if new_pw:
            u.set_password(new_pw)
        db.session.commit()
        return jsonify(u.to_dict())

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
        try:
            q = request.args.get('q')
            # Safe int parsing with defaults
            def to_int(val, default):
                try:
                    return int(val)
                except Exception:
                    return default
            page = max(to_int(request.args.get('page', 1), 1), 1)
            per_page = to_int(request.args.get('per_page', 20), 20)
            per_page = min(max(per_page, 1), 100)
            query = Animal.query
            if q:
                like = f"%{q.lower()}%"
                from sqlalchemy import or_, func
                query = query.filter(or_(func.lower(Animal.name).like(like), func.lower(Animal.species).like(like)))
            total = query.count()
            items = (query.order_by(Animal.id.desc())
                          .offset((page - 1) * per_page)
                          .limit(per_page)
                          .all())
            pages = (total + per_page - 1) // per_page if per_page else 1
            return jsonify({
                'data': [a.to_dict() for a in items],
                'meta': {
                    'page': page,
                    'per_page': per_page,
                    'total': total,
                    'pages': pages
                }
            })
        except Exception as e:
            # Enhanced temporary debugging: log traceback with a short trace_id so user can correlate.
            try:
                import traceback, uuid
                trace_id = uuid.uuid4().hex[:8]
                tb = traceback.format_exc()
                print(f"[animals_error {trace_id}] {e}\n{tb}", flush=True)
            except Exception:
                trace_id = None
            payload = {'error': 'animals_list_failed', 'detail': str(e)}
            if trace_id:
                payload['trace_id'] = trace_id
            return jsonify(payload), 500

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

    @app.route('/api/animals/gallery', methods=['GET'])
    def animal_gallery():
        """Return a list of available animal image filenames in the public images directory.

        Used by the frontend 'Explore All Images' feature to show every image even if
        not all have corresponding Animal DB rows.
        """
        try:
            public_img_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'images', 'animals'))
            if not os.path.isdir(public_img_dir):
                return jsonify({'images': []})
            exts = {'.jpg', '.jpeg', '.png'}
            files = []
            for fn in os.listdir(public_img_dir):
                lower = fn.lower()
                for e in exts:
                    if lower.endswith(e):
                        files.append({
                            'file': fn,
                            'url': f"/images/animals/{fn}"
                        })
                        break
            files.sort(key=lambda x: x['file'].lower())
            return jsonify({'images': files, 'count': len(files)})
        except Exception as e:
            return jsonify({'error': 'gallery_failed', 'detail': str(e)}), 500

    @app.route('/api/admin/animals/relink', methods=['POST'])
    @jwt_required()
    def relink_animal_photos():
        """Admin endpoint to rescan local images directory and update animal photo_url values."""
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        try:
            # reuse internal helper if present
            updated = 0
            public_img_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'images', 'animals'))
            if not os.path.isdir(public_img_dir):
                return jsonify({'updated':0,'detail':'images directory missing'}), 400
            exts = ('jpeg','jpg','png')
            for a in Animal.query.all():
                candidate_ok = False
                if a.photo_url:
                    fs = os.path.join(public_img_dir, os.path.basename(a.photo_url))
                    if os.path.isfile(fs):
                        candidate_ok = True
                if candidate_ok:
                    continue
                base = a.name
                for ext in exts:
                    fp = os.path.join(public_img_dir, f"{base}.{ext}")
                    if os.path.isfile(fp):
                        new_url = f"/images/animals/{base}.{ext}"
                        if a.photo_url != new_url:
                            a.photo_url = new_url
                            updated += 1
                        break
            if updated:
                db.session.commit()
            return jsonify({'updated': updated})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error':'relink_failed','detail':str(e)}), 500

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
            treatment=data.get('treatment'),
            weight_kg=data.get('weight_kg'),
            temperature_c=data.get('temperature_c'),
            vaccination=data.get('vaccination'),
            critical=bool(data.get('critical', False)),
            attachment_url=data.get('attachment_url')
        )
        db.session.add(hr)
        db.session.commit()
        if hr.critical:
            # auto create alert
            al = Alert(animal_id=a.id, veterinarian_id=int(uid) if uid else None, severity='critical', message=f'Critical condition recorded for {a.name}')
            db.session.add(al)
            db.session.commit()
        return jsonify(hr.to_dict()), 201

    @app.route('/api/animals/<int:animal_id>/records', methods=['GET'])
    @jwt_required()
    def list_health_records(animal_id):
        claims = get_jwt()
        # vets and admins can view; customers cannot
        if claims.get('role') not in ('admin', 'vet'):
            return jsonify({'msg': 'forbidden'}), 403
        records = HealthRecord.query.filter_by(animal_id=animal_id).order_by(HealthRecord.date.desc()).all()
        return jsonify([r.to_dict() for r in records])

    @app.route('/api/health-records/<int:record_id>', methods=['PUT'])
    @jwt_required()
    def update_health_record(record_id):
        claims = get_jwt()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        hr = HealthRecord.query.get_or_404(record_id)
        data = request.get_json() or {}
        for f in ('notes','diagnosis','treatment','weight_kg','temperature_c','vaccination','attachment_url'):
            if f in data:
                setattr(hr, f, data[f])
        if 'critical' in data:
            hr.critical = bool(data.get('critical'))
        db.session.commit()
        return jsonify(hr.to_dict())

    @app.route('/api/health-records/<int:record_id>', methods=['DELETE'])
    @jwt_required()
    def delete_health_record(record_id):
        claims = get_jwt()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        hr = HealthRecord.query.get_or_404(record_id)
        db.session.delete(hr)
        db.session.commit()
        return jsonify({'msg':'deleted'})

    # ---- Attachments (simple pointer, reuse upload-image) ----
    # client will first upload via /api/upload-image then send resulting URL in attachment_url field.

    # ---- Appointments ----
    @app.route('/api/appointments', methods=['POST'])
    @jwt_required()
    def create_appointment():
        claims = get_jwt()
        uid = get_jwt_identity()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        data = request.get_json() or {}
        try:
            date_raw = data.get('date')
            adate = datetime.fromisoformat(date_raw).date() if date_raw else None
        except Exception:
            return jsonify({'msg':'invalid date'}), 400
        if not adate:
            return jsonify({'msg':'date required'}), 400
        appt = Appointment(animal_id=data.get('animal_id'), veterinarian_id=int(uid) if uid else None, date=adate, time=data.get('time'), reason=data.get('reason'))
        db.session.add(appt)
        db.session.commit()
        return jsonify(appt.to_dict()), 201

    @app.route('/api/appointments', methods=['GET'])
    @jwt_required()
    def list_appointments():
        claims = get_jwt()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        animal_id = request.args.get('animal_id')
        q = Appointment.query
        if animal_id:
            q = q.filter_by(animal_id=animal_id)
        appts = q.order_by(Appointment.date.desc()).limit(200).all()
        return jsonify([a.to_dict() for a in appts])

    @app.route('/api/appointments/<int:aid>', methods=['PUT'])
    @jwt_required()
    def update_appointment(aid):
        claims = get_jwt()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        appt = Appointment.query.get_or_404(aid)
        data = request.get_json() or {}
        for f in ('time','reason','status'):
            if f in data:
                setattr(appt, f, data[f])
        if 'date' in data:
            try:
                d_raw = data.get('date')
                if isinstance(d_raw, str) and d_raw:
                    appt.date = datetime.fromisoformat(d_raw).date()
            except Exception:
                return jsonify({'msg':'invalid date'}), 400
        db.session.commit()
        return jsonify(appt.to_dict())

    @app.route('/api/appointments/<int:aid>', methods=['DELETE'])
    @jwt_required()
    def delete_appointment(aid):
        claims = get_jwt()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        appt = Appointment.query.get_or_404(aid)
        db.session.delete(appt)
        db.session.commit()
        return jsonify({'msg':'deleted'})

    # ---- Treatment Plans ----
    @app.route('/api/treatments', methods=['POST'])
    @jwt_required()
    def create_treatment():
        claims = get_jwt()
        uid = get_jwt_identity()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        data = request.get_json() or {}
        def parse_date(key):
            v = data.get(key)
            if not v:
                return None
            try:
                return datetime.fromisoformat(v).date()
            except Exception:
                return None
        tp = TreatmentPlan(animal_id=data.get('animal_id'), veterinarian_id=int(uid) if uid else None, name=data.get('name'), description=data.get('description'), start_date=parse_date('start_date'), end_date=parse_date('end_date'))
        db.session.add(tp)
        db.session.commit()
        return jsonify(tp.to_dict()), 201

    @app.route('/api/treatments', methods=['GET'])
    @jwt_required()
    def list_treatments():
        claims = get_jwt()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        animal_id = request.args.get('animal_id')
        q = TreatmentPlan.query
        if animal_id:
            q = q.filter_by(animal_id=animal_id)
        res = q.order_by(TreatmentPlan.created_at.desc()).limit(200).all()
        return jsonify([t.to_dict() for t in res])

    @app.route('/api/treatments/<int:tid>', methods=['PUT'])
    @jwt_required()
    def update_treatment(tid):
        claims = get_jwt()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        tp = TreatmentPlan.query.get_or_404(tid)
        data = request.get_json() or {}
        for f in ('name','description'):
            if f in data:
                setattr(tp, f, data[f])
        for f in ('start_date','end_date'):
            if f in data:
                val = data.get(f)
                if val:
                    try:
                        setattr(tp, f, datetime.fromisoformat(val).date())
                    except Exception:
                        pass
                else:
                    setattr(tp, f, None)
        db.session.commit()
        return jsonify(tp.to_dict())

    @app.route('/api/treatments/<int:tid>', methods=['DELETE'])
    @jwt_required()
    def delete_treatment(tid):
        claims = get_jwt()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        tp = TreatmentPlan.query.get_or_404(tid)
        db.session.delete(tp)
        db.session.commit()
        return jsonify({'msg':'deleted'})

    # ---- Medicine Requests ----
    @app.route('/api/medicine-requests', methods=['POST'])
    @jwt_required()
    def create_medicine_request():
        claims = get_jwt()
        uid = get_jwt_identity()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        data = request.get_json() or {}
        mr = MedicineRequest(animal_id=data.get('animal_id'), veterinarian_id=int(uid) if uid else None, medicine_name=data.get('medicine_name'), quantity=data.get('quantity'), notes=data.get('notes'))
        db.session.add(mr)
        db.session.commit()
        return jsonify(mr.to_dict()), 201

    @app.route('/api/medicine-requests', methods=['GET'])
    @jwt_required()
    def list_medicine_requests():
        claims = get_jwt()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        res = MedicineRequest.query.order_by(MedicineRequest.created_at.desc()).limit(200).all()
        return jsonify([m.to_dict() for m in res])

    @app.route('/api/medicine-requests/<int:mid>', methods=['PUT'])
    @jwt_required()
    def update_medicine_request(mid):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        mr = MedicineRequest.query.get_or_404(mid)
        data = request.get_json() or {}
        for f in ('status','notes'):
            if f in data:
                setattr(mr, f, data[f])
        if 'status' in data and data.get('status') in ('approved','rejected') and mr.resolved_at is None:
            from datetime import datetime as dtnow
            mr.resolved_at = dtnow.utcnow()
        db.session.commit()
        return jsonify(mr.to_dict())

    # ---- Alerts ----
    @app.route('/api/alerts', methods=['GET'])
    @jwt_required()
    def list_alerts():
        claims = get_jwt()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        res = Alert.query.order_by(Alert.created_at.desc()).limit(200).all()
        return jsonify([a.to_dict() for a in res])

    @app.route('/api/alerts', methods=['POST'])
    @jwt_required()
    def create_alert():
        claims = get_jwt()
        uid = get_jwt_identity()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        data = request.get_json() or {}
        al = Alert(animal_id=data.get('animal_id'), veterinarian_id=int(uid) if uid else None, severity=data.get('severity','info'), message=data.get('message'))
        db.session.add(al)
        db.session.commit()
        return jsonify(al.to_dict()), 201

    @app.route('/api/alerts/<int:aid>', methods=['PUT'])
    @jwt_required()
    def update_alert(aid):
        claims = get_jwt()
        if claims.get('role') not in ('admin','vet'):
            return jsonify({'msg':'forbidden'}), 403
        al = Alert.query.get_or_404(aid)
        data = request.get_json() or {}
        for f in ('severity','message'):
            if f in data:
                setattr(al, f, data[f])
        if 'resolved' in data:
            al.resolved = bool(data.get('resolved'))
            if al.resolved and al.resolved_at is None:
                from datetime import datetime as dtnow
                al.resolved_at = dtnow.utcnow()
        db.session.commit()
        return jsonify(al.to_dict())

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
        try:
            claims = get_jwt()
            uid = get_jwt_identity()
            def to_int(val, default):
                try:
                    return int(val)
                except Exception:
                    return default
            page = max(to_int(request.args.get('page', 1), 1), 1)
            per_page = to_int(request.args.get('per_page', 20), 20)
            per_page = min(max(per_page, 1), 100)
            query = Booking.query
            if claims.get('role') != 'admin':
                query = query.filter_by(user_id=int(uid))
            total = query.count()
            items = (query.order_by(Booking.id.desc())
                          .offset((page - 1) * per_page)
                          .limit(per_page)
                          .all())
            pages = (total + per_page - 1) // per_page if per_page else 1
            return jsonify({
                'data': [b.to_dict() for b in items],
                'meta': {
                    'page': page,
                    'per_page': per_page,
                    'total': total,
                    'pages': pages
                }
            })
        except Exception as e:
            return jsonify({'error': 'bookings_list_failed', 'detail': str(e)}), 500

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

    # ---------- TicketType CRUD (admin) ----------
    @app.route('/api/ticket-types', methods=['GET'])
    @jwt_required()
    def list_ticket_types():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        return jsonify([t.to_dict() for t in TicketType.query.order_by(TicketType.name).all()])

    @app.route('/api/ticket-types', methods=['POST'])
    @jwt_required()
    def create_ticket_type():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        data = request.get_json() or {}
        tt = TicketType(
            name=data.get('name'),
            description=data.get('description'),
            adult_price_cents=int(data.get('adult_price_cents', 0)),
            child_price_cents=int(data.get('child_price_cents', 0)),
            group_size=data.get('group_size'),
            active=bool(data.get('active', True))
        )
        db.session.add(tt)
        db.session.commit()
        log_action('create','TicketType', tt.id)
        return jsonify(tt.to_dict()), 201

    @app.route('/api/ticket-types/<int:tid>', methods=['PUT'])
    @jwt_required()
    def update_ticket_type(tid):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        tt = TicketType.query.get_or_404(tid)
        data = request.get_json() or {}
        for f in ('name','description','group_size'):
            if f in data:
                setattr(tt, f, data[f])
        if 'adult_price_cents' in data:
            tt.adult_price_cents = int(data.get('adult_price_cents', 0))
        if 'child_price_cents' in data:
            tt.child_price_cents = int(data.get('child_price_cents', 0))
        if 'active' in data:
            tt.active = bool(data.get('active'))
        db.session.commit()
        log_action('update','TicketType', tt.id)
        return jsonify(tt.to_dict())

    @app.route('/api/ticket-types/<int:tid>', methods=['DELETE'])
    @jwt_required()
    def delete_ticket_type(tid):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        tt = TicketType.query.get_or_404(tid)
        db.session.delete(tt)
        db.session.commit()
        log_action('delete','TicketType', tid)
        return jsonify({'msg':'deleted'})

    # ---------- Manual Ticket Sale (admin) ----------
    @app.route('/api/ticket-sales', methods=['POST'])
    @jwt_required()
    def create_ticket_sale():
        claims = get_jwt()
        uid = get_jwt_identity()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        data = request.get_json() or {}
        tt = TicketType.query.get_or_404(data.get('ticket_type_id'))
        qa = int(data.get('quantity_adults', 0))
        qc = int(data.get('quantity_children', 0))
        total = qa * tt.adult_price_cents + qc * tt.child_price_cents
        sale = TicketSale(ticket_type_id=tt.id, user_id=int(uid), channel=data.get('channel','offline'), quantity_adults=qa, quantity_children=qc, total_cents=total, currency='INR')
        db.session.add(sale)
        db.session.commit()
        log_action('create','TicketSale', sale.id)
        return jsonify(sale.to_dict()), 201

    @app.route('/api/ticket-sales/summary', methods=['GET'])
    @jwt_required()
    def ticket_sales_summary():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        # aggregate simple stats
        total_revenue = db.session.query(db.func.coalesce(db.func.sum(TicketSale.total_cents),0)).scalar() or 0
        total_tickets = db.session.query(db.func.count(TicketSale.id)).scalar() or 0
        return jsonify({'total_revenue_cents': total_revenue, 'sales_count': total_tickets})

    # ---------- Events CRUD ----------
    @app.route('/api/events', methods=['GET'])
    def public_events():
        today = datetime.utcnow().date()
        events = Event.query.filter(Event.active == True, Event.start_date >= today).order_by(Event.start_date.asc()).limit(50).all()
        return jsonify([e.to_dict() for e in events])

    @app.route('/api/events/manage', methods=['GET'])
    @jwt_required()
    def list_events():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        events = Event.query.order_by(Event.start_date.desc()).all()
        return jsonify([e.to_dict() for e in events])

    @app.route('/api/events', methods=['POST'])
    @jwt_required()
    def create_event():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        data = request.get_json() or {}
        try:
            sd_raw = data.get('start_date')
            sd = datetime.fromisoformat(sd_raw).date() if isinstance(sd_raw, str) and sd_raw else None
            if not sd:
                return jsonify({'msg':'invalid start_date'}), 400
        except Exception:
            return jsonify({'msg':'invalid start_date'}), 400
        ev = Event(title=data.get('title'), description=data.get('description'), location=data.get('location'), start_date=sd, start_time=data.get('start_time'), end_time=data.get('end_time'), active=bool(data.get('active', True)))
        db.session.add(ev)
        db.session.commit()
        log_action('create','Event', ev.id)
        return jsonify(ev.to_dict()), 201

    @app.route('/api/events/<int:eid>', methods=['PUT'])
    @jwt_required()
    def update_event(eid):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        ev = Event.query.get_or_404(eid)
        data = request.get_json() or {}
        for f in ('title','description','location','start_time','end_time','active'):
            if f in data:
                setattr(ev, f, data[f])
        if 'start_date' in data:
            try:
                sd_raw = data.get('start_date')
                if sd_raw:
                    ev.start_date = datetime.fromisoformat(sd_raw).date()
            except Exception:
                return jsonify({'msg':'invalid start_date'}), 400
        db.session.commit()
        log_action('update','Event', ev.id)
        return jsonify(ev.to_dict())

    @app.route('/api/events/<int:eid>', methods=['DELETE'])
    @jwt_required()
    def delete_event(eid):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        ev = Event.query.get_or_404(eid)
        db.session.delete(ev)
        db.session.commit()
        log_action('delete','Event', eid)
        return jsonify({'msg':'deleted'})

    # ---------- News CRUD ----------
    @app.route('/api/news', methods=['GET'])
    def public_news():
        items = NewsItem.query.filter(NewsItem.published == True).order_by(NewsItem.publish_date.desc().nullslast(), NewsItem.created_at.desc()).limit(50).all()
        return jsonify([n.to_dict() for n in items])

    @app.route('/api/news/manage', methods=['GET'])
    @jwt_required()
    def list_news():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        items = NewsItem.query.order_by(NewsItem.created_at.desc()).all()
        return jsonify([n.to_dict() for n in items])

    @app.route('/api/news', methods=['POST'])
    @jwt_required()
    def create_news():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        data = request.get_json() or {}
        publish_date = None
        if data.get('publish_date'):
            try:
                pd_raw = data.get('publish_date')
                if isinstance(pd_raw, str) and pd_raw:
                    publish_date = datetime.fromisoformat(pd_raw).date()
                else:
                    return jsonify({'msg':'invalid publish_date'}), 400
            except Exception:
                return jsonify({'msg':'invalid publish_date'}), 400
        item = NewsItem(title=data.get('title'), summary=data.get('summary'), body=data.get('body'), published=bool(data.get('published', True)), publish_date=publish_date)
        db.session.add(item)
        db.session.commit()
        log_action('create','NewsItem', item.id)
        return jsonify(item.to_dict()), 201

    @app.route('/api/news/<int:nid>', methods=['PUT'])
    @jwt_required()
    def update_news(nid):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        item = NewsItem.query.get_or_404(nid)
        data = request.get_json() or {}
        for f in ('title','summary','body','published'):
            if f in data:
                setattr(item, f, data[f])
        if 'publish_date' in data:
            if data.get('publish_date'):
                try:
                    pd_raw = data.get('publish_date')
                    if isinstance(pd_raw, str) and pd_raw:
                        item.publish_date = datetime.fromisoformat(pd_raw).date()
                    else:
                        return jsonify({'msg':'invalid publish_date'}), 400
                except Exception:
                    return jsonify({'msg':'invalid publish_date'}), 400
            else:
                item.publish_date = None
        db.session.commit()
        log_action('update','NewsItem', item.id)
        return jsonify(item.to_dict())

    @app.route('/api/news/<int:nid>', methods=['DELETE'])
    @jwt_required()
    def delete_news(nid):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg': 'forbidden'}), 403
        item = NewsItem.query.get_or_404(nid)
        db.session.delete(item)
        db.session.commit()
        log_action('delete','NewsItem', nid)
        return jsonify({'msg':'deleted'})

    # ---------- Page Content CRUD (About / Contact) ----------
    @app.route('/api/pages/<string:key>', methods=['GET'])
    def get_page(key):
        pc = PageContent.query.filter_by(page_key=key).first()
        return jsonify(pc.to_dict() if pc else {'page_key': key, 'title': key.title(), 'body': ''})

    @app.route('/api/pages/<string:key>', methods=['PUT','POST'])
    @jwt_required()
    def upsert_page(key):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        data = request.get_json() or {}
        pc = PageContent.query.filter_by(page_key=key).first()
        if not pc:
            pc = PageContent(page_key=key)
            db.session.add(pc)
        if 'title' in data:
            pc.title = data.get('title')
        if 'body' in data:
            pc.body = data.get('body')
        db.session.commit()
        log_action('upsert','PageContent', pc.id)
        return jsonify(pc.to_dict())

    # ---------- Feedback endpoints ----------
    @app.route('/api/feedback', methods=['POST'])
    @jwt_required(optional=True)
    def create_feedback():
        uid = get_jwt_identity()
        data = request.get_json() or {}
        fb = Feedback(user_id=int(uid) if uid else None, message=data.get('message'), rating=data.get('rating'))
        db.session.add(fb)
        db.session.commit()
        return jsonify(fb.to_dict()), 201

    @app.route('/api/feedback', methods=['GET'])
    @jwt_required()
    def list_feedback():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        items = Feedback.query.order_by(Feedback.created_at.desc()).all()
        return jsonify([i.to_dict() for i in items])

    @app.route('/api/feedback/<int:fid>', methods=['PUT'])
    @jwt_required()
    def update_feedback(fid):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        fb = Feedback.query.get_or_404(fid)
        data = request.get_json() or {}
        for f in ('status','admin_response','sentiment'):
            if f in data:
                setattr(fb, f, data[f])
        if 'status' in data and data.get('status') == 'responded' and fb.responded_at is None:
            fb.responded_at = datetime.utcnow()
        db.session.commit()
        log_action('update','Feedback', fb.id)
        return jsonify(fb.to_dict())

    # ---------- Audit Log & helper ----------
    def log_action(action, entity=None, entity_id=None, metadata=None):
        try:
            uid = get_jwt_identity()
        except Exception:
            uid = None
        # kept parameter name 'metadata' for backward compatibility; store in 'meta' field
        al = AuditLog(user_id=int(uid) if uid else None, action=action, entity=entity, entity_id=entity_id, meta=metadata)
        db.session.add(al)
        db.session.commit()

    @app.route('/api/audit', methods=['GET'])
    @jwt_required()
    def list_audit():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(500).all()
        return jsonify([l.to_dict() for l in logs])

    # ---------- Assignments (animals to staff/vets) ----------
    @app.route('/api/assignments', methods=['POST'])
    @jwt_required()
    def create_assignment():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        data = request.get_json() or {}
        try:
            sd_raw = data.get('start_date')
            start_date = datetime.fromisoformat(sd_raw).date() if isinstance(sd_raw, str) and sd_raw else None
        except Exception:
            return jsonify({'msg':'invalid start_date'}), 400
        assign = AnimalAssignment(animal_id=data.get('animal_id'), user_id=data.get('user_id'), role=data.get('role'), start_date=start_date)
        db.session.add(assign)
        db.session.commit()
        log_action('create','AnimalAssignment', assign.id)
        return jsonify(assign.to_dict()), 201

    @app.route('/api/assignments', methods=['GET'])
    @jwt_required()
    def list_assignments():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        assigns = AnimalAssignment.query.order_by(AnimalAssignment.created_at.desc()).all()
        return jsonify([a.to_dict() for a in assigns])

    @app.route('/api/assignments/<int:aid>', methods=['DELETE'])
    @jwt_required()
    def delete_assignment(aid):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        assign = AnimalAssignment.query.get_or_404(aid)
        db.session.delete(assign)
        db.session.commit()
        log_action('delete','AnimalAssignment', aid)
        return jsonify({'msg':'deleted'})

    # ---------- Analytics & Stats (simplified) ----------
    @app.route('/api/analytics/overview', methods=['GET'])
    @jwt_required()
    def analytics_overview():
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({'msg':'forbidden'}), 403
        total_animals = Animal.query.count()
        total_doctors = User.query.filter_by(role='vet').count()
        total_users = User.query.count()
        # revenue from TicketSale + Booking (paid)
        ticket_sale_revenue = db.session.query(db.func.coalesce(db.func.sum(TicketSale.total_cents),0)).scalar() or 0
        booking_revenue = db.session.query(db.func.coalesce(db.func.sum(Booking.price_cents),0)).filter(Booking.paid == True).scalar() or 0
        return jsonify({
            'animals': total_animals,
            'doctors': total_doctors,
            'users': total_users,
            'revenue_cents': ticket_sale_revenue + booking_revenue
        })

    # ---------- Global Search Endpoint ----------
    @app.route('/api/search', methods=['GET'])
    def global_search():
        q = (request.args.get('q') or '').strip()
        if not q:
            return jsonify({'animals': [], 'doctors': [], 'events': [], 'news': []})
        like = f"%{q}%"
        animals = [a.to_dict() for a in Animal.query.filter(Animal.name.ilike(like)).limit(10).all()]
        doctors = [u.to_dict() for u in User.query.filter(User.role=='vet', User.username.ilike(like)).limit(10).all()]
        events = [e.to_dict() for e in Event.query.filter(Event.title.ilike(like)).limit(10).all()]
        news = [n.to_dict() for n in NewsItem.query.filter(NewsItem.title.ilike(like)).limit(10).all()]
        return jsonify({'animals': animals, 'doctors': doctors, 'events': events, 'news': news})

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

    # Simple API info endpoint (moved from '/' to '/api' so root can serve the SPA)
    @app.route('/api', methods=['GET'])
    def api_info():
        return jsonify({
            'service': 'Smart Zoo API',
            'version': 'prototype',
            'endpoints': [
                '/api/register', '/api/login', '/api/animals', '/api/bookings', '/api/staff'
            ],
            'note': 'Root path serves the web app; use /api/* endpoints for JSON.'
        })

    # ---------- Profile Endpoints ----------
    @app.route('/api/profile', methods=['GET'])
    @jwt_required()
    def get_profile():
        uid = get_jwt_identity()
        u = User.query.get_or_404(int(uid))
        return jsonify(u.to_dict())

    @app.route('/api/profile', methods=['PUT'])
    @jwt_required()
    def update_profile():
        uid = get_jwt_identity()
        u = User.query.get_or_404(int(uid))
        data = request.get_json() or {}
        for f in ('full_name','email'):
            if f in data:
                if f == 'email' and data.get('email') and User.query.filter(User.email==data.get('email'), User.id!=u.id).first():
                    return jsonify({'msg':'email already used'}), 400
                setattr(u, f, data[f])
        db.session.commit()
        return jsonify(u.to_dict())

    # ---------- Favorites (Animals / Events) ----------
    @app.route('/api/favorites/animals', methods=['GET'])
    @jwt_required()
    def fav_animals():
        uid = get_jwt_identity()
        favs = FavoriteAnimal.query.filter_by(user_id=int(uid)).all()
        return jsonify([f.to_dict() for f in favs])

    @app.route('/api/favorites/animals', methods=['POST'])
    @jwt_required()
    def add_fav_animal():
        uid = get_jwt_identity()
        data = request.get_json() or {}
        aid = data.get('animal_id')
        if not aid:
            return jsonify({'msg':'animal_id required'}), 400
        exists = FavoriteAnimal.query.filter_by(user_id=int(uid), animal_id=aid).first()
        if exists:
            return jsonify(exists.to_dict())
        fav = FavoriteAnimal(user_id=int(uid), animal_id=aid)
        db.session.add(fav)
        db.session.commit()
        return jsonify(fav.to_dict()), 201

    @app.route('/api/favorites/animals/<int:animal_id>', methods=['DELETE'])
    @jwt_required()
    def remove_fav_animal(animal_id):
        uid = get_jwt_identity()
        fav = FavoriteAnimal.query.filter_by(user_id=int(uid), animal_id=animal_id).first_or_404()
        db.session.delete(fav)
        db.session.commit()
        return jsonify({'msg':'deleted'})

    @app.route('/api/favorites/events', methods=['GET'])
    @jwt_required()
    def fav_events():
        uid = get_jwt_identity()
        favs = FavoriteEvent.query.filter_by(user_id=int(uid)).all()
        return jsonify([f.to_dict() for f in favs])

    @app.route('/api/favorites/events', methods=['POST'])
    @jwt_required()
    def add_fav_event():
        uid = get_jwt_identity()
        data = request.get_json() or {}
        eid = data.get('event_id')
        if not eid:
            return jsonify({'msg':'event_id required'}), 400
        exists = FavoriteEvent.query.filter_by(user_id=int(uid), event_id=eid).first()
        if exists:
            return jsonify(exists.to_dict())
        fav = FavoriteEvent(user_id=int(uid), event_id=eid)
        db.session.add(fav)
        db.session.commit()
        return jsonify(fav.to_dict()), 201

    @app.route('/api/favorites/events/<int:event_id>', methods=['DELETE'])
    @jwt_required()
    def remove_fav_event(event_id):
        uid = get_jwt_identity()
        fav = FavoriteEvent.query.filter_by(user_id=int(uid), event_id=event_id).first_or_404()
        db.session.delete(fav)
        db.session.commit()
        return jsonify({'msg':'deleted'})

    # ---------- Receipt Download (simple JSON/pdf stub) ----------
    @app.route('/api/bookings/<int:booking_id>/receipt', methods=['GET'])
    @jwt_required()
    def booking_receipt(booking_id):
        uid = get_jwt_identity()
        b = Booking.query.get_or_404(booking_id)
        if b.user_id != int(uid):
            return jsonify({'msg':'forbidden'}), 403
        # For now return JSON; frontend can render PDF client-side.
        return jsonify({'booking': b.to_dict(), 'generated_at': datetime.utcnow().isoformat()})

    # ---------- Payment Intent Stub ----------
    @app.route('/api/payments/intent', methods=['POST'])
    @jwt_required()
    def payment_intent():
        uid = get_jwt_identity()
        data = request.get_json() or {}
        # In real integration, call Razorpay/PayPal SDK here.
        amount_cents = int(data.get('amount_cents', 0))
        if amount_cents <= 0:
            return jsonify({'msg':'amount_cents required'}), 400
        fake_id = f"pi_{uid}_{int(datetime.utcnow().timestamp())}"
        return jsonify({'payment_intent_id': fake_id, 'amount_cents': amount_cents, 'currency': 'INR', 'status': 'requires_payment_method'})

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

    # --- Health / status endpoint ---
    @app.route('/api/health', methods=['GET'])
    def health():
        try:
            animal_count = Animal.query.count()
            user_count = User.query.count()
            booking_count = Booking.query.count()
            return jsonify({
                'status': 'ok',
                'service': 'Smart Zoo API',
                'animals': animal_count,
                'users': user_count,
                'bookings': booking_count,
                'time': datetime.utcnow().isoformat() + 'Z'
            })
        except Exception as e:
            return jsonify({'status': 'error', 'error': str(e)}), 500

    # --- Placeholder SVG for missing animal images ---
    @app.route('/api/placeholder/animal/<string:name>.svg')
    def animal_placeholder(name):
        safe = ''.join(ch for ch in name if ch.isalnum())[:20] or 'animal'
        svg = f"""<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'>
<rect width='100%' height='100%' fill='#2f5132'/>
<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#ffffff' font-family='Arial' font-size='28'>{safe.capitalize()}</text>
</svg>"""
        return svg, 200, {'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400'}

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
