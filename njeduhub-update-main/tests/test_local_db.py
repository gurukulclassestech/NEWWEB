import asyncio

from backend.auth import ensure_default_admin
from backend.server import SQLiteDatabase, _validate_lecture_record


def test_sqlite_database_supports_crud_and_persists_after_reopen(tmp_path):
    database_path = tmp_path / 'test.sqlite3'
    db = SQLiteDatabase(database_path, legacy_path=None)
    coll = db['admins']

    asyncio.run(coll.insert_one({'username': 'admin', 'password_hash': 'abc'}))
    row = asyncio.run(coll.find_one({'username': 'admin'}))

    assert row is not None
    assert row['username'] == 'admin'

    asyncio.run(coll.update_one({'username': 'admin'}, {'$set': {'password_hash': 'xyz'}}))
    updated = asyncio.run(coll.find_one({'username': 'admin'}))
    assert updated['password_hash'] == 'xyz'
    db.close()

    reopened_db = SQLiteDatabase(database_path, legacy_path=None)
    persisted = asyncio.run(reopened_db.admins.find_one({'username': 'admin'}))
    assert persisted is not None
    assert persisted['password_hash'] == 'xyz'

    asyncio.run(reopened_db.admins.delete_one({'username': 'admin'}))
    assert asyncio.run(reopened_db.admins.find_one({'username': 'admin'})) is None
    reopened_db.close()


def test_sqlite_database_imports_legacy_json_once(tmp_path):
    legacy_path = tmp_path / 'legacy.json'
    legacy_path.write_text(
        '{"courses":[{"id":"course-1","title":"Imported course"}]}',
        encoding='utf-8',
    )
    db = SQLiteDatabase(tmp_path / 'import.sqlite3', legacy_path=legacy_path)

    imported = asyncio.run(db.courses.find_one({'id': 'course-1'}))

    assert imported == {'id': 'course-1', 'title': 'Imported course'}
    db.close()


def test_lecture_record_validation_accepts_youtube_links():
    payload = {
        'title': 'Chemical Bonding Basics',
        'className': '11th',
        'subject': 'Chemistry',
        'youtubeUrl': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'description': 'Short revision lecture',
        'status': 'published',
    }

    result = _validate_lecture_record(payload)

    assert result['title'] == 'Chemical Bonding Basics'
    assert result['status'] == 'published'
    assert result['youtubeUrl'] == 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    assert result['videoId'] == 'dQw4w9WgXcQ'


def test_ensure_default_admin_creates_admin_even_if_other_records_exist(tmp_path):
    db = SQLiteDatabase(tmp_path / 'admin.sqlite3', legacy_path=None)
    asyncio.run(db.admins.insert_one({'username': 'other-admin', 'password_hash': 'hash'}))

    asyncio.run(ensure_default_admin(db))

    stored = asyncio.run(db.admins.find_one({'username': 'admin'}))
    assert stored is not None
    assert stored['username'] == 'admin'
    db.close()
