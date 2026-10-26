import asyncio

import pytest

from backend.server import LocalDatabase


@pytest.mark.asyncio
async def test_local_database_supports_basic_crud():
    db = LocalDatabase(prefix='test_local_db')
    coll = db['admins']

    await coll.insert_one({'username': 'admin', 'password_hash': 'abc'})
    row = await coll.find_one({'username': 'admin'})

    assert row is not None
    assert row['username'] == 'admin'

    await coll.update_one({'username': 'admin'}, {'$set': {'password_hash': 'xyz'}})
    updated = await coll.find_one({'username': 'admin'})
    assert updated['password_hash'] == 'xyz'

    await coll.delete_one({'username': 'admin'})
    assert await coll.find_one({'username': 'admin'}) is None


def test_lecture_record_validation_accepts_youtube_links():
    from backend.server import _validate_lecture_record

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


@pytest.mark.asyncio
async def test_local_database_reuses_same_instance_per_prefix():
    from backend.server import LocalMongoClient

    client = LocalMongoClient('gurukulclasses')
    db_one = client['gurukulclasses']
    db_two = client['gurukulclasses']

    assert db_one is db_two

    await db_one.admins.insert_one({'username': 'persisted-admin', 'password_hash': 'hash'})
    stored = await db_two.admins.find_one({'username': 'persisted-admin'})

    assert stored is not None
    assert stored['username'] == 'persisted-admin'
