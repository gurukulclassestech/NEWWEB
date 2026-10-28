import asyncio

import pytest
from fastapi.testclient import TestClient

import server


@pytest.fixture
def client(monkeypatch, tmp_path):
    monkeypatch.setenv('VERCEL', '1')
    database = server.SQLiteDatabase(tmp_path / 'api.sqlite3', legacy_path=None)
    monkeypatch.setattr(server, 'db', database)
    with TestClient(server.app) as test_client:
        yield test_client


def test_exam_list_orders_by_created_at_field(client):
    server.db.exams._save_items([])
    asyncio.run(server.db.exams.insert_one({
        'id': 'older',
        'examName': 'Older Exam',
        'className': 'Class 10',
        'course': 'Foundation',
        'examDate': '2024-01-10',
        'startTime': '09:00',
        'endTime': '10:00',
        'durationMinutes': 60,
        'classplusUrl': 'https://example.com/older',
        'status': 'published',
        'createdAt': '2024-01-01T00:00:00',
        'updatedAt': '2024-01-01T00:00:00',
    }))
    asyncio.run(server.db.exams.insert_one({
        'id': 'newer',
        'examName': 'Newer Exam',
        'className': 'Class 12',
        'course': 'JEE',
        'examDate': '2025-01-10',
        'startTime': '09:00',
        'endTime': '10:00',
        'durationMinutes': 60,
        'classplusUrl': 'https://example.com/newer',
        'status': 'published',
        'createdAt': '2025-01-01T00:00:00',
        'updatedAt': '2025-01-01T00:00:00',
    }))

    response = client.get('/api/exams')

    assert response.status_code == 200
    ids = [item['id'] for item in response.json()]
    assert ids[0] == 'newer'
    assert ids[-1] == 'older'


def test_default_admin_login_works(client):
    asyncio.run(server.ensure_default_admin(server.db))
    response = client.post('/api/admin/login', json={'username': 'admin', 'password': 'admin@123'})
    assert response.status_code == 200
    payload = response.json()
    assert payload['username'] == 'admin'
    assert payload['token']


def test_upload_preflight_and_image_round_trip(client):
    origin = 'https://frontend-gurukul.vercel.app'
    preflight = client.options(
        '/api/upload',
        headers={
            'Origin': origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'authorization,content-type',
        },
    )
    assert preflight.status_code == 200
    assert preflight.headers['access-control-allow-origin'] == origin

    login = client.post('/api/admin/login', json={'username': 'admin', 'password': 'admin@123'})
    assert login.status_code == 200
    image = b'\x89PNG\r\n\x1a\nupload-test'
    upload = client.post(
        '/api/upload',
        headers={'Origin': origin, 'Authorization': f"Bearer {login.json()['token']}"},
        files={'file': ('test.png', image, 'image/png')},
    )
    assert upload.status_code == 200
    assert upload.headers['access-control-allow-origin'] == origin

    image_response = client.get(upload.json()['url'], headers={'Origin': origin})
    assert image_response.status_code == 200
    assert image_response.content == image
    assert image_response.headers['content-type'] == 'image/png'
    assert image_response.headers['access-control-allow-origin'] == origin

    asyncio.run(server.db.uploads.delete_one({'filename': upload.json()['filename']}))
