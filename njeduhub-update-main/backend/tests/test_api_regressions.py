import asyncio

import pytest
from fastapi.testclient import TestClient

import server


@pytest.fixture
def client():
    server._use_mock_db()
    return TestClient(server.app)


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
