from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    with app.test_client() as c:
        resp = c.get('/api/animals?page=1&per_page=24')
        print('Status:', resp.status_code)
        try:
            print('JSON:', resp.get_json())
        except Exception:
            print('Raw:', resp.data[:500])
