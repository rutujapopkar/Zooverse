import os
import sys
# ensure the project root is on PYTHONPATH for tests
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import json
from backend.app import create_app


def test_animal_crud(tmp_path):
    # use a temporary sqlite file for isolation
    db_file = tmp_path / "test.db"
    os.environ['DATABASE_URL'] = f"sqlite:///{db_file}"
    os.environ['JWT_SECRET_KEY'] = 'test-secret'

    app = create_app()
    app.testing = True
    client = app.test_client()

    # register admin
    rv = client.post('/api/register', json={'username': 'admin', 'password': 'pass', 'role': 'admin'})
    assert rv.status_code == 201, f"register failed: {rv.data}"

    # login
    rv = client.post('/api/login', json={'username': 'admin', 'password': 'pass'})
    assert rv.status_code == 200, f"login failed: {rv.data}"
    token = rv.get_json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # create animal
    rv = client.post('/api/animals', json={'name': 'Leo', 'species': 'Lion'}, headers=headers)
    assert rv.status_code == 201, f"create animal failed: {rv.data}"
    aid = rv.get_json()['id']

    # list animals
    rv = client.get('/api/animals')
    assert rv.status_code == 200
    animals = rv.get_json()
    assert any(a['name'] == 'Leo' for a in animals), f"animals list did not include Leo: {animals}"
