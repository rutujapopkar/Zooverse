import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.app import create_app


def test_staff_and_booking(tmp_path):
    os.environ['DATABASE_URL'] = f"sqlite:///{tmp_path / 'bs.db'}"
    os.environ['JWT_SECRET_KEY'] = 'test-secret'
    app = create_app()
    app.testing = True
    c = app.test_client()

    # make admin
    rv = c.post('/api/register', json={'username': 'admin2', 'password': 'p', 'role': 'admin'})
    assert rv.status_code == 201
    rv = c.post('/api/login', json={'username': 'admin2', 'password': 'p'})
    token = rv.get_json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # create staff
    rv = c.post('/api/staff', json={'username': 'vet1', 'password': 'v', 'role': 'vet'}, headers=headers)
    assert rv.status_code == 201
    uid = rv.get_json()['id']

    # list staff
    rv = c.get('/api/staff', headers=headers)
    assert rv.status_code == 200

    # register customer
    rv = c.post('/api/register', json={'username': 'cust', 'password': 'c', 'role': 'customer'})
    assert rv.status_code == 201
    rv = c.post('/api/login', json={'username': 'cust', 'password': 'c'})
    token2 = rv.get_json()['access_token']
    h2 = {'Authorization': f'Bearer {token2}'}

    # customer create booking
    rv = c.post('/api/bookings', json={'date': '2025-09-10', 'time_slot': '09:00-11:00', 'num_adults': 2, 'num_children': 1}, headers=h2)
    assert rv.status_code == 201
    booking = rv.get_json()
    assert 'qr_code_b64' in booking

    # admin list bookings
    rv = c.get('/api/bookings', headers=headers)
    assert rv.status_code == 200
    bs = rv.get_json()
    assert len(bs) >= 1
