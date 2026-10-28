from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response, StreamingResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os, io, csv, logging, uuid, json, base64, sqlite3, threading
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timezone
from urllib.parse import parse_qs, urlparse

ROOT_DIR = Path(__file__).parent
LOCAL_DB_DIR = ROOT_DIR / 'local_db'

class SQLiteCursor:
    def __init__(self, collection, query=None):
        self.collection = collection
        self.query = query or {}
        self.sort_field = None
        self.sort_direction = 1

    def sort(self, field, direction=-1):
        self.sort_field = field
        self.sort_direction = direction
        return self

    async def to_list(self, limit=None):
        items = self.collection._items(self.query)
        if self.sort_field is not None:
            items = sorted(items, key=lambda doc: doc.get(self.sort_field, 0), reverse=self.sort_direction < 0)
        if limit is not None:
            items = items[:limit]
        return items

class SQLiteCollection:
    def __init__(self, database, name):
        self.database = database
        self.name = name

    def _items(self, query=None):
        with self.database._lock:
            rows = self.database.connection.execute(
                'SELECT document FROM records WHERE collection = ? ORDER BY rowid',
                (self.name,),
            ).fetchall()
        items = [json.loads(row['document']) for row in rows]
        if query:
            items = [item for item in items if self._matches(item, query)]
        return items

    def _save_items(self, items):
        with self.database._lock, self.database.connection:
            self.database.connection.execute('DELETE FROM records WHERE collection = ?', (self.name,))
            self.database.connection.executemany(
                'INSERT INTO records (collection, document) VALUES (?, ?)',
                [(self.name, json.dumps(item, ensure_ascii=False)) for item in items],
            )

    def _matches(self, doc, query):
        return all(doc.get(k) == v for k, v in (query or {}).items())

    async def insert_one(self, doc):
        with self.database._lock, self.database.connection:
            cursor = self.database.connection.execute(
                'INSERT INTO records (collection, document) VALUES (?, ?)',
                (self.name, json.dumps(dict(doc), ensure_ascii=False)),
            )
            return {'inserted_id': cursor.lastrowid}

    async def find_one(self, query=None):
        return next(iter(self._items(query)), None)

    async def count_documents(self, query=None):
        return len(self._items(query))

    def find(self, query=None):
        return SQLiteCursor(self, query or {})

    async def update_one(self, query, update, upsert=False):
        with self.database._lock, self.database.connection:
            rows = self.database.connection.execute(
                'SELECT rowid, document FROM records WHERE collection = ? ORDER BY rowid',
                (self.name,),
            ).fetchall()
            match = next(
                (
                    row for row in rows
                    if self._matches(json.loads(row['document']), query)
                ),
                None,
            )
            if match is None:
                if not upsert:
                    return {'matched_count': 0, 'modified_count': 0}
                item = dict(query)
                item.update(update.get('$set', {}))
                for key in update.get('$unset', {}):
                    item.pop(key, None)
                self.database.connection.execute(
                    'INSERT INTO records (collection, document) VALUES (?, ?)',
                    (self.name, json.dumps(item, ensure_ascii=False)),
                )
                return {'matched_count': 0, 'modified_count': 0, 'upserted_id': True}

            item = json.loads(match['document'])
            item.update(update.get('$set', {}))
            for key in update.get('$unset', {}):
                item.pop(key, None)
            self.database.connection.execute(
                'UPDATE records SET document = ? WHERE rowid = ?',
                (json.dumps(item, ensure_ascii=False), match['rowid']),
            )
            return {'matched_count': 1, 'modified_count': 1}

    async def delete_one(self, query):
        with self.database._lock, self.database.connection:
            rows = self.database.connection.execute(
                'SELECT rowid, document FROM records WHERE collection = ? ORDER BY rowid',
                (self.name,),
            ).fetchall()
            match = next(
                (
                    row for row in rows
                    if self._matches(json.loads(row['document']), query)
                ),
                None,
            )
            if match is None:
                return {'deleted_count': 0}
            self.database.connection.execute('DELETE FROM records WHERE rowid = ?', (match['rowid'],))
            return {'deleted_count': 1}

class SQLiteDatabase:
    def __init__(self, path=None, legacy_path=LOCAL_DB_DIR / 'gurukulclasses.json'):
        configured_path = path or os.environ.get('SQLITE_DB_PATH')
        if configured_path:
            self.path = Path(configured_path)
        elif os.environ.get('VERCEL'):
            self.path = Path('/tmp/gurukulclasses.sqlite3')
        else:
            self.path = LOCAL_DB_DIR / 'gurukulclasses.sqlite3'
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        self.connection = sqlite3.connect(self.path, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self.connection.execute('PRAGMA busy_timeout = 5000')
        self.connection.execute('PRAGMA journal_mode = WAL')
        self.connection.execute(
            'CREATE TABLE IF NOT EXISTS records '
            '(collection TEXT NOT NULL, document TEXT NOT NULL)'
        )
        self.connection.execute(
            'CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)'
        )
        self._import_legacy_json(legacy_path)

    def _import_legacy_json(self, legacy_path):
        imported = self.connection.execute(
            "SELECT 1 FROM metadata WHERE key = 'legacy_json_imported'"
        ).fetchone()
        if imported:
            return
        has_records = self.connection.execute('SELECT 1 FROM records LIMIT 1').fetchone()
        legacy_data = {}
        if (
            not has_records
            and legacy_path
            and legacy_path.is_file()
            and legacy_path.resolve() != self.path.resolve()
        ):
            try:
                with legacy_path.open('r', encoding='utf-8') as file:
                    legacy_data = json.load(file)
            except (OSError, json.JSONDecodeError) as exc:
                raise RuntimeError(f'Could not import legacy database file {legacy_path}') from exc
            if not isinstance(legacy_data, dict):
                raise RuntimeError(f'Legacy database file {legacy_path} must contain a JSON object')
        with self.connection:
            for collection, items in legacy_data.items():
                if not isinstance(items, list):
                    continue
                self.connection.executemany(
                    'INSERT INTO records (collection, document) VALUES (?, ?)',
                    [
                        (collection, json.dumps(item, ensure_ascii=False))
                        for item in items
                        if isinstance(item, dict)
                    ],
                )
            self.connection.execute(
                "INSERT OR REPLACE INTO metadata (key, value) VALUES ('legacy_json_imported', '1')"
            )

    def __getattr__(self, name):
        return self[name]

    def __getitem__(self, key):
        return SQLiteCollection(self, key)

    def close(self):
        with self._lock:
            self.connection.close()

ROOT_DIR = Path(__file__).parent
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB
load_dotenv(ROOT_DIR / '.env')

try:
    from .auth import (
        LoginIn, ChangePasswordIn, TokenOut,
        issue_token, verify_pw, hash_pw,
        ensure_default_admin, require_admin,
    )
except ImportError:  # pragma: no cover - supports running server.py directly
    from auth import (
        LoginIn, ChangePasswordIn, TokenOut,
        issue_token, verify_pw, hash_pw,
        ensure_default_admin, require_admin,
    )

db = SQLiteDatabase()

app = FastAPI(title='Gurukul Classes API')
api = APIRouter(prefix='/api')

logger = logging.getLogger('gurukulclasses')
logging.basicConfig(level=logging.INFO)

def _configured_expiration() -> Optional[datetime]:
    value = os.environ.get('BACKEND_EXPIRES_AT', '').strip()
    if not value:
        return None
    try:
        expiration = datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError as exc:
        raise ValueError('BACKEND_EXPIRES_AT must be an ISO 8601 UTC timestamp') from exc
    if expiration.tzinfo is None or expiration.utcoffset() is None:
        raise ValueError('BACKEND_EXPIRES_AT must include a UTC timezone, such as Z')
    return expiration.astimezone(timezone.utc)


BACKEND_EXPIRES_AT = _configured_expiration()

@app.middleware('http')
async def enforce_backend_expiration(request, call_next):
    if BACKEND_EXPIRES_AT and datetime.now(timezone.utc) >= BACKEND_EXPIRES_AT:
        return JSONResponse(
            status_code=503,
            content={
                'detail': (
                    'Backend service expired at '
                    f'{BACKEND_EXPIRES_AT.isoformat()}. Remove BACKEND_EXPIRES_AT and restart '
                    'the backend to disable this expiration.'
                )
            },
        )
    return await call_next(request)

def _configured_expiration() -> Optional[datetime]:
    value = os.environ.get('BACKEND_EXPIRES_AT', '').strip()
    if not value:
        return None
    try:
        expiration = datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError as exc:
        raise ValueError('BACKEND_EXPIRES_AT must be an ISO 8601 UTC timestamp') from exc
    if expiration.tzinfo is None or expiration.utcoffset() is None:
        raise ValueError('BACKEND_EXPIRES_AT must include a UTC timezone, such as Z')
    return expiration.astimezone(timezone.utc)


BACKEND_EXPIRES_AT = _configured_expiration()

@app.middleware('http')
async def enforce_backend_expiration(request, call_next):
    if BACKEND_EXPIRES_AT and datetime.now(timezone.utc) >= BACKEND_EXPIRES_AT:
        return JSONResponse(
            status_code=503,
            content={
                'detail': (
                    'Backend service expired at '
                    f'{BACKEND_EXPIRES_AT.isoformat()}. Remove BACKEND_EXPIRES_AT and restart '
                    'the backend to disable this expiration.'
                )
            },
        )
    return await call_next(request)

# ---------- Helpers ----------
def now_iso() -> str:
    return datetime.utcnow().isoformat()

def strip_id(doc: dict) -> dict:
    if not doc: return doc
    doc.pop('_id', None)
    doc.pop('password_hash', None)
    return doc


def _normalise_ts_field(doc: dict, *keys: str) -> str:
    for key in keys:
        value = doc.get(key)
        if value not in (None, ''):
            return str(value)
    return ''


def _sort_by_created_desc(docs: List[dict]) -> List[dict]:
    return sorted(
        docs,
        key=lambda doc: _normalise_ts_field(doc, 'createdAt', 'created_at'),
        reverse=True,
    )

# ---------- Models ----------
LeadStatus = Literal['new', 'contacted', 'enrolled', 'lost']

class IDModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)

class Course(IDModel):
    slug: str
    title: str
    duration: str
    audience: str
    price: str
    short: str
    image: str
    highlights: List[str] = []
    subjects: List[str] = []
    detail: str = ''
    is_active: bool = True

class Faculty(IDModel):
    name: str
    subject: str
    exp: str
    img: str
    credentials: str = ''
    bio: str = ''

class Blog(IDModel):
    slug: str
    title: str
    excerpt: str
    author: str
    category: str
    cover: str
    body: str
    date: str = ''

class Testimonial(IDModel):
    name: str
    rank: str
    img: str
    text: str

class Topper(IDModel):
    name: str
    rank: str
    score: str
    img: str
    year: int = 2026

class ResultRecord(IDModel):
    year: int
    name: str
    rank: str
    exam: str
    college: str

class GalleryItem(IDModel):
    url: str
    caption: str = ''

class NewsItem(IDModel):
    title: str
    date: str
    img: str
    desc: str

class Banner(IDModel):
    title: str
    subtitle: str = ''
    image: str
    cta: str = 'Learn More'
    link: str = '/'
    order: int = 0
    is_active: bool = True

class CounterItem(IDModel):
    value: int = 0
    prefix: str = ''
    suffix: str = ''
    label: str = ''
    order: int = 0

class FaqItem(IDModel):
    q: str
    a: str
    order: int = 0

class ProgramStripItem(IDModel):
    code: str
    title: str
    sub: str = ''
    desc: str = ''
    href: str = '/courses'
    order: int = 0

class WhyUsItem(IDModel):
    title: str
    desc: str
    icon: str = ''
    order: int = 0

class CentreItem(IDModel):
    name: str
    city: str = ''
    address: str = ''
    phone: str = ''
    order: int = 0

class HomePageEditorItem(IDModel):
    key: str
    value: str

class SEOItem(IDModel):
    key: str
    value: str

class SiteSettingItem(IDModel):
    key: str
    value: str

class ExamRecord(IDModel):
    examName: str
    className: str
    course: str
    examDate: str
    startTime: str
    endTime: str
    durationMinutes: int = 60
    instructions: str = ''
    classplusUrl: str
    status: Literal['draft', 'published'] = 'draft'
    createdAt: str = Field(default_factory=now_iso)
    updatedAt: str = Field(default_factory=now_iso)

class ExamStatusUpdate(BaseModel):
    status: Literal['draft', 'published'] = 'draft'

class LectureRecord(IDModel):
    title: str
    className: str
    subject: str
    youtubeUrl: str
    description: str = ''
    thumbnailUrl: str = ''
    videoId: str = ''
    status: Literal['draft', 'published'] = 'draft'
    createdAt: str = Field(default_factory=now_iso)
    updatedAt: str = Field(default_factory=now_iso)

class LectureStatusUpdate(BaseModel):
    status: Literal['draft', 'published'] = 'draft'

# Lead models
class Inquiry(IDModel):
    name: str
    phone: str
    email: str
    city: str = ''
    course: str = ''
    message: str = ''
    status: LeadStatus = 'new'

class Admission(IDModel):
    name: str
    dob: str = ''
    gender: str = ''
    email: str
    phone: str
    father: str = ''
    mother: str = ''
    city: str = ''
    school: str = ''
    stream: str = ''
    percent: str = ''
    course: str = ''
    mode: str = ''
    message: str = ''
    status: LeadStatus = 'new'

class Scholarship(IDModel):
    name: str
    email: str
    phone: str
    standard: str = ''
    city: str = ''
    status: LeadStatus = 'new'

class CareerApp(IDModel):
    name: str
    email: str
    phone: str
    role: str = ''
    message: str = ''
    status: LeadStatus = 'new'

class StatusUpdate(BaseModel):
    status: LeadStatus

# ---------- Health ----------
@api.get('/')
async def root():
    return {'message': 'Gurukul Classes API'}

# ---------- AUTH endpoints ----------
@api.post('/admin/login', response_model=TokenOut)
async def admin_login(body: LoginIn):
    admin = await db.admins.find_one({'username': body.username})
    if not admin or not verify_pw(body.password, admin.get('password_hash', '')):
        raise HTTPException(status_code=401, detail='Invalid username or password')
    return TokenOut(token=issue_token(body.username), username=body.username)

@api.get('/admin/me')
async def admin_me(user: str = Depends(require_admin)):
    return {'username': user}

@api.post('/admin/change-password')
async def admin_change_password(body: ChangePasswordIn, user: str = Depends(require_admin)):
    admin = await db.admins.find_one({'username': user})
    if not admin or not verify_pw(body.current_password, admin.get('password_hash', '')):
        raise HTTPException(status_code=400, detail='Current password is incorrect')
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail='New password must be at least 6 characters')
    await db.admins.update_one({'username': user}, {'$set': {'password_hash': hash_pw(body.new_password)}})
    return {'ok': True}

# ---------- File Upload ----------
@api.post('/upload')
async def upload_image(file: UploadFile = File(...), _: str = Depends(require_admin)):
    """Accept an image upload and return its API URL."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f'Unsupported file type: {file.content_type}. Allowed: jpg, png, gif, webp, svg')
    # Read and check size
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail='File too large (max 10MB)')
    # Generate unique filename, preserve extension
    ext = (file.filename or '').rsplit('.', 1)[-1].lower() if '.' in (file.filename or '') else 'jpg'
    if len(ext) > 8 or not ext.isalnum():
        ext = 'jpg'
    fname = f'{uuid.uuid4().hex}.{ext}'
    await db.uploads.insert_one({
        'filename': fname,
        'content_type': file.content_type,
        'data': base64.b64encode(contents).decode('ascii'),
        'size': len(contents),
    })
    return {'url': f'/api/uploads/{fname}', 'filename': fname, 'size': len(contents)}

@api.get('/uploads/{filename}')
async def get_uploaded_image(filename: str):
    """Serve uploaded images from persistent storage, with local-file compatibility."""
    if Path(filename).name != filename:
        raise HTTPException(status_code=404, detail='Image not found')
    upload = await db.uploads.find_one({'filename': filename})
    if upload:
        return Response(
            content=base64.b64decode(upload['data']),
            media_type=upload['content_type'],
            headers={'Cache-Control': 'public, max-age=31536000, immutable'},
        )

    local_path = UPLOAD_DIR / filename
    if local_path.is_file():
        return FileResponse(local_path)
    raise HTTPException(status_code=404, detail='Image not found')

def _validate_exam_record(payload: dict) -> dict:
    data = dict(payload or {})
    required_keys = ['examName', 'className', 'course', 'examDate', 'startTime', 'endTime', 'classplusUrl']
    for key in required_keys:
        value = str(data.get(key, '') or '').strip()
        if not value:
            raise HTTPException(status_code=400, detail=f'{key} is required')
        data[key] = value

    try:
        datetime.strptime(data['examDate'], '%Y-%m-%d')
    except ValueError as exc:
        raise HTTPException(400, 'examDate must be in YYYY-MM-DD format') from exc

    try:
        datetime.strptime(data['startTime'], '%H:%M')
        datetime.strptime(data['endTime'], '%H:%M')
    except ValueError as exc:
        raise HTTPException(400, 'startTime and endTime must be in HH:MM format') from exc

    try:
        data['durationMinutes'] = int(data.get('durationMinutes', 60))
    except (TypeError, ValueError) as exc:
        raise HTTPException(400, 'durationMinutes must be a number') from exc
    if data['durationMinutes'] <= 0:
        raise HTTPException(400, 'durationMinutes must be greater than 0')

    status = str(data.get('status', 'draft')).lower()
    if status not in {'draft', 'published'}:
        raise HTTPException(400, 'status must be draft or published')
    data['status'] = status

    url = data['classplusUrl'].strip()
    parsed = urlparse(url)
    allowed_hosts = {'localhost', '127.0.0.1'}
    if not parsed.scheme or not parsed.netloc:
        raise HTTPException(400, 'classplusUrl must be a valid URL')
    if parsed.scheme not in {'https', 'http'}:
        raise HTTPException(400, 'classplusUrl must use HTTPS, or http for localhost development')
    if parsed.scheme == 'http' and parsed.hostname not in allowed_hosts:
        raise HTTPException(400, 'Only HTTPS URLs are allowed for exam links, except localhost development URLs')
    data['classplusUrl'] = url
    data['instructions'] = (data.get('instructions') or '').strip()
    data['examName'] = data['examName'].strip()
    data['className'] = data['className'].strip()
    data['course'] = data['course'].strip()
    if 'id' not in data or not data['id']:
        data['id'] = str(uuid.uuid4())
    created_now = data.get('created_at') or data.get('createdAt') or now_iso()
    updated_now = data.get('updated_at') or data.get('updatedAt') or now_iso()
    data['created_at'] = created_now
    data['createdAt'] = created_now
    data['updated_at'] = updated_now
    data['updatedAt'] = now_iso()
    return data


def _extract_youtube_video_id(url: str) -> str:
    parsed = urlparse((url or '').strip())
    hostname = (parsed.hostname or '').lower()
    if not parsed.scheme or not parsed.netloc:
        raise HTTPException(400, 'youtubeUrl must be a valid YouTube URL')
    if hostname not in {'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'}:
        raise HTTPException(400, 'youtubeUrl must be a valid YouTube link')
    if hostname == 'youtu.be':
        video_id = parsed.path.strip('/').split('/')[-1]
    elif '/embed/' in parsed.path:
        video_id = parsed.path.split('/embed/')[-1].split('/')[0]
    else:
        video_id = parse_qs(parsed.query).get('v', [None])[0]
    if not video_id:
        raise HTTPException(400, 'Could not detect a YouTube video ID from youtubeUrl')
    return video_id


def _validate_lecture_record(payload: dict) -> dict:
    data = dict(payload or {})
    required_keys = ['title', 'className', 'subject', 'youtubeUrl']
    for key in required_keys:
        value = str(data.get(key, '') or '').strip()
        if not value:
            raise HTTPException(status_code=400, detail=f'{key} is required')
        data[key] = value

    status = str(data.get('status', 'draft')).lower()
    if status not in {'draft', 'published'}:
        raise HTTPException(400, 'status must be draft or published')
    data['status'] = status

    url = data['youtubeUrl'].strip()
    video_id = _extract_youtube_video_id(url)
    data['videoId'] = video_id
    data['youtubeUrl'] = url
    data['description'] = (data.get('description') or '').strip()
    data['thumbnailUrl'] = data.get('thumbnailUrl') or f'https://img.youtube.com/vi/{video_id}/hqdefault.jpg'
    data['title'] = data['title'].strip()
    data['className'] = data['className'].strip()
    data['subject'] = data['subject'].strip()
    if 'id' not in data or not data['id']:
        data['id'] = str(uuid.uuid4())
    created_now = data.get('created_at') or data.get('createdAt') or now_iso()
    updated_now = data.get('updated_at') or data.get('updatedAt') or now_iso()
    data['created_at'] = created_now
    data['createdAt'] = created_now
    data['updated_at'] = updated_now
    data['updatedAt'] = now_iso()
    return data

# ---------- Public/exam endpoints ----------
@api.get('/exams')
async def list_exams_public():
    docs = await db.exams.find().to_list(1000)
    return [strip_id(d) for d in _sort_by_created_desc(docs)]

@api.get('/exams/published')
async def list_published_exams():
    docs = await db.exams.find({'status': 'published'}).to_list(1000)
    return [strip_id(d) for d in _sort_by_created_desc(docs)]

@api.get('/admin/exams')
async def list_admin_exams(_: str = Depends(require_admin)):
    docs = await db.exams.find().to_list(1000)
    return [strip_id(d) for d in _sort_by_created_desc(docs)]

@api.get('/admin/exams/{item_id}')
async def get_admin_exam(item_id: str, _: str = Depends(require_admin)):
    doc = await db.exams.find_one({'id': item_id})
    if not doc:
        raise HTTPException(404, 'Exam not found')
    return strip_id(doc)

@api.post('/admin/exams')
async def create_admin_exam(item: ExamRecord, _: str = Depends(require_admin)):
    doc = _validate_exam_record(item.dict())
    await db.exams.insert_one(doc)
    return doc

@api.put('/admin/exams/{item_id}')
@api.patch('/admin/exams/{item_id}')
async def update_admin_exam(item_id: str, item: ExamRecord, _: str = Depends(require_admin)):
    existing = await db.exams.find_one({'id': item_id})
    if not existing:
        raise HTTPException(404, 'Exam not found')
    doc = _validate_exam_record({**existing, **item.dict()})
    doc['id'] = item_id
    await db.exams.update_one({'id': item_id}, {'$set': doc}, upsert=True)
    return doc

@api.patch('/admin/exams/{item_id}/status')
async def update_admin_exam_status(item_id: str, body: ExamStatusUpdate, _: str = Depends(require_admin)):
    existing = await db.exams.find_one({'id': item_id})
    if not existing:
        raise HTTPException(404, 'Exam not found')
    existing['status'] = body.status
    existing['updatedAt'] = now_iso()
    await db.exams.update_one({'id': item_id}, {'$set': existing})
    return existing

@api.delete('/admin/exams/{item_id}')
async def delete_admin_exam(item_id: str, _: str = Depends(require_admin)):
    await db.exams.delete_one({'id': item_id})
    return {'ok': True}

# ---------- Public/video lecture endpoints ----------
@api.get('/lectures')
async def list_lectures_public():
    docs = await db.lectures.find().to_list(1000)
    return [strip_id(d) for d in _sort_by_created_desc(docs)]

@api.get('/lectures/published')
async def list_published_lectures():
    docs = await db.lectures.find({'status': 'published'}).to_list(1000)
    return [strip_id(d) for d in _sort_by_created_desc(docs)]

@api.get('/admin/lectures')
async def list_admin_lectures(_: str = Depends(require_admin)):
    docs = await db.lectures.find().to_list(1000)
    return [strip_id(d) for d in _sort_by_created_desc(docs)]

@api.get('/admin/lectures/{item_id}')
async def get_admin_lecture(item_id: str, _: str = Depends(require_admin)):
    doc = await db.lectures.find_one({'id': item_id})
    if not doc:
        raise HTTPException(404, 'Lecture not found')
    return strip_id(doc)

@api.post('/admin/lectures')
async def create_admin_lecture(item: LectureRecord, _: str = Depends(require_admin)):
    doc = _validate_lecture_record(item.dict())
    await db.lectures.insert_one(doc)
    return doc

@api.put('/admin/lectures/{item_id}')
@api.patch('/admin/lectures/{item_id}')
async def update_admin_lecture(item_id: str, item: LectureRecord, _: str = Depends(require_admin)):
    existing = await db.lectures.find_one({'id': item_id})
    if not existing:
        raise HTTPException(404, 'Lecture not found')
    doc = _validate_lecture_record({**existing, **item.dict()})
    doc['id'] = item_id
    await db.lectures.update_one({'id': item_id}, {'$set': doc}, upsert=True)
    return doc

@api.patch('/admin/lectures/{item_id}/status')
async def update_admin_lecture_status(item_id: str, body: LectureStatusUpdate, _: str = Depends(require_admin)):
    existing = await db.lectures.find_one({'id': item_id})
    if not existing:
        raise HTTPException(404, 'Lecture not found')
    existing['status'] = body.status
    existing['updatedAt'] = now_iso()
    await db.lectures.update_one({'id': item_id}, {'$set': existing})
    return existing

@api.delete('/admin/lectures/{item_id}')
async def delete_admin_lecture(item_id: str, _: str = Depends(require_admin)):
    await db.lectures.delete_one({'id': item_id})
    return {'ok': True}

# ---------- Generic CRUD factory ----------
def build_crud(path: str, collection: str, model):
    """Public GET (list), admin POST / PUT / DELETE."""

    @api.get(f'/{path}')
    async def list_items():
        docs = await db[collection].find().to_list(1000)
        return [strip_id(d) for d in _sort_by_created_desc(docs)]

    @api.post(f'/{path}')
    async def create_item(item: model, _: str = Depends(require_admin)):
        d = item.dict()
        await db[collection].insert_one(d.copy())
        return d

    @api.put(f'/{path}/' + '{item_id}')
    async def update_item(item_id: str, item: model, _: str = Depends(require_admin)):
        d = item.dict(); d['id'] = item_id
        await db[collection].update_one({'id': item_id}, {'$set': d}, upsert=True)
        return d

    @api.delete(f'/{path}/' + '{item_id}')
    async def delete_item(item_id: str, _: str = Depends(require_admin)):
        await db[collection].delete_one({'id': item_id})
        return {'ok': True}

build_crud('courses', 'courses', Course)
build_crud('faculty', 'faculty', Faculty)
build_crud('blogs', 'blogs', Blog)
build_crud('testimonials', 'testimonials', Testimonial)
build_crud('toppers', 'toppers', Topper)
build_crud('results', 'results', ResultRecord)
build_crud('gallery', 'gallery', GalleryItem)
build_crud('news', 'news', NewsItem)
build_crud('banners', 'banners', Banner)
build_crud('counters', 'counters', CounterItem)
build_crud('faqs', 'faqs', FaqItem)
build_crud('programs-strip', 'programs_strip', ProgramStripItem)
build_crud('why-us', 'why_us', WhyUsItem)
build_crud('centres', 'centres', CentreItem)
build_crud('homepage-editor', 'homepage_editor', HomePageEditorItem)
build_crud('seo', 'seo', SEOItem)
build_crud('site-settings', 'site_settings', SiteSettingItem)

# ---------- Single fetch by slug ----------
@api.get('/courses/slug/{slug}')
async def course_by_slug(slug: str):
    d = await db.courses.find_one({'slug': slug})
    if not d: raise HTTPException(404, 'Not found')
    return strip_id(d)

@api.get('/blogs/slug/{slug}')
async def blog_by_slug(slug: str):
    d = await db.blogs.find_one({'slug': slug})
    if not d: raise HTTPException(404, 'Not found')
    return strip_id(d)

# ---------- Lead endpoints (public POST, admin GET/PATCH/DELETE/CSV) ----------
def build_leads(path: str, coll: str, model):
    @api.post(f'/{path}', name=f'create_{path}')
    async def create(item: model):
        d = item.dict()
        await db[coll].insert_one(d.copy())
        return d

    @api.get(f'/{path}', name=f'list_{path}')
    async def lst(status: Optional[str] = None, _: str = Depends(require_admin)):
        q = {} if not status else {'status': status}
        docs = await db[coll].find(q).to_list(2000)
        return [strip_id(d) for d in _sort_by_created_desc(docs)]

    @api.patch(f'/{path}/' + '{item_id}', name=f'update_{path}')
    async def upd(item_id: str, body: StatusUpdate, _: str = Depends(require_admin)):
        await db[coll].update_one({'id': item_id}, {'$set': {'status': body.status}})
        d = await db[coll].find_one({'id': item_id})
        if not d: raise HTTPException(404, 'Not found')
        return strip_id(d)

    @api.put(f'/{path}/' + '{item_id}', name=f'full_update_{path}')
    async def full_upd(item_id: str, item: model, _: str = Depends(require_admin)):
        """Admin can edit any field on a lead."""
        d = item.dict(); d['id'] = item_id
        await db[coll].update_one({'id': item_id}, {'$set': d}, upsert=True)
        return d

    @api.delete(f'/{path}/' + '{item_id}', name=f'delete_{path}')
    async def dele(item_id: str, _: str = Depends(require_admin)):
        await db[coll].delete_one({'id': item_id})
        return {'ok': True}

    @api.get(f'/{path}/export.csv', name=f'export_{path}')
    async def export(token: Optional[str] = None):
        # Allow CSV download via ?token=<jwt> since browsers can't easily set
        # Authorization headers on plain anchor downloads.
        from auth import decode_token
        if not token or not decode_token(token):
            raise HTTPException(status_code=401, detail='Invalid or missing token')
        docs = await db[coll].find().to_list(5000)
        docs = _sort_by_created_desc(docs)
        if not docs:
            return StreamingResponse(io.StringIO('No data'), media_type='text/csv')
        fields = [k for k in docs[0].keys() if k not in ('_id', 'password_hash')]
        buf = io.StringIO()
        w = csv.DictWriter(buf, fieldnames=fields)
        w.writeheader()
        for d in docs:
            d.pop('_id', None); d.pop('password_hash', None)
            w.writerow({k: d.get(k, '') for k in fields})
        buf.seek(0)
        return StreamingResponse(iter([buf.getvalue()]), media_type='text/csv', headers={'Content-Disposition': f'attachment; filename={path}.csv'})

build_leads('inquiries',   'inquiries',   Inquiry)
build_leads('admissions',  'admissions',  Admission)
build_leads('scholarship', 'scholarship', Scholarship)
build_leads('careers',     'careers',     CareerApp)

# ---------- Dashboard (admin) ----------
@api.get('/dashboard/stats')
async def dashboard(_: str = Depends(require_admin)):
    out = {}
    for c in ['inquiries','admissions','scholarship','careers']:
        out[c] = await db[c].count_documents({})
        out[f'{c}_new'] = await db[c].count_documents({'status': 'new'})
    out['courses'] = await db.courses.count_documents({})
    out['faculty'] = await db.faculty.count_documents({})
    out['blogs'] = await db.blogs.count_documents({})
    out['testimonials'] = await db.testimonials.count_documents({})
    out['toppers'] = await db.toppers.count_documents({})
    out['gallery'] = await db.gallery.count_documents({})
    out['news'] = await db.news.count_documents({})
    out['results'] = await db.results.count_documents({})
    out['banners'] = await db.banners.count_documents({})
    return out

# ---------- Seed (admin) ----------
@api.post('/seed')
async def seed(_: str = Depends(require_admin)):
    try:
        from .seed_data import seed_db  # type: ignore
    except ImportError:  # pragma: no cover - supports running server.py directly
        from seed_data import seed_db  # type: ignore
    return await seed_db(db)

# Public seed-once endpoint for first-run bootstrapping (idempotent)
@api.post('/seed-public')
async def seed_public():
    try:
        from .seed_data import seed_db  # type: ignore
    except ImportError:  # pragma: no cover - supports running server.py directly
        from seed_data import seed_db  # type: ignore
    return await seed_db(db)

# ---------- App lifecycle ----------
@app.on_event('startup')
async def on_start():
    global client, db
    try:
        await client.admin.command('ping')
    except Exception as exc:
        logger.warning('MongoDB unavailable at %s; using local in-memory fallback. Error: %s', mongo_url, exc)
        _use_mock_db()
    await ensure_default_admin(db)
    logger.info('Default admin ensured (admin / admin@123)')

@app.on_event('shutdown')
async def shutdown_db_client():
    db.close()

# Include router
app.include_router(api)


@app.get('/', response_class=HTMLResponse)
async def backend_home():
    api_routes = []
    for route in app.routes:
        path = getattr(route, 'path', '')
        if not path.startswith('/api'):
            continue
        methods = sorted(getattr(route, 'methods', set()) - {'HEAD', 'OPTIONS'})
        if not methods:
            continue
        api_routes.append((path, methods))

    api_routes.sort(key=lambda item: (item[0], item[1]))
    route_rows = []
    for path, methods in api_routes:
        label = ', '.join(methods)
        if '{' in path or 'GET' not in methods:
            endpoint = f'<code>{label} {path}</code>'
        else:
            endpoint = f'<a href="{path}"><code>{label} {path}</code></a>'
        route_rows.append(f'<li>{endpoint}</li>')

    routes_html = '\n'.join(route_rows)
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FastAPI Backend</title>
  <style>
    body {{ max-width: 860px; margin: 48px auto; padding: 0 20px; font: 16px/1.5 sans-serif; color: #17212b; }}
    h1 {{ margin-bottom: 8px; }}
    a {{ color: #087e70; }}
    li {{ margin: 6px 0; }}
    code {{ overflow-wrap: anywhere; }}
  </style>
</head>
<body>
  <h1>FastAPI backend is running</h1>
  <p>Available API URLs:</p>
  <ul>{routes_html}</ul>
  <p><a href="/docs">Interactive API documentation</a> · <a href="/openapi.json">OpenAPI schema</a></p>
</body>
</html>'''

# Mount static files for uploaded images (must be after router include so /api/uploads/* resolves)
app.mount('/api/uploads', StaticFiles(directory=str(UPLOAD_DIR)), name='uploads')

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        'CORS_ALLOWED_ORIGINS',
        'https://frontend-gurukul.vercel.app,http://localhost:3000,http://127.0.0.1:3000',
    ).split(',')
    if origin.strip()
]

# Wrap the entire app so even unhandled server errors include CORS headers.
app = CORSMiddleware(
    app,
    allow_credentials=True,
    allow_origins=CORS_ALLOWED_ORIGINS,
    allow_methods=['*'],
    allow_headers=['*'],
)
