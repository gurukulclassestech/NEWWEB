from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, io, csv, logging, uuid, shutil, json
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from urllib.parse import parse_qs, urlparse

try:
    from mongomock_motor import AsyncMongoMockClient as MockAsyncMongoClient
except Exception:
    MockAsyncMongoClient = None

ROOT_DIR = Path(__file__).parent
LOCAL_DB_DIR = ROOT_DIR / 'local_db'
try:
    LOCAL_DB_DIR.mkdir(exist_ok=True)
except OSError:
    pass

class LocalCursor:
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
        items = self.collection._items()
        if self.query:
            def matches(doc):
                return all(doc.get(k) == v for k, v in self.query.items())
            items = [doc for doc in items if matches(doc)]
        if self.sort_field is not None:
            items = sorted(items, key=lambda doc: doc.get(self.sort_field, 0), reverse=self.sort_direction < 0)
        if limit is not None:
            items = items[:limit]
        return items

class LocalCollection:
    def __init__(self, database, name):
        self.database = database
        self.name = name

    def _items(self):
        return list(self.database._data.get(self.name, []))

    def _save_items(self, items):
        self.database._data[self.name] = items
        self.database._save()

    def _matches(self, doc, query):
        return all(doc.get(k) == v for k, v in (query or {}).items())

    async def insert_one(self, doc):
        items = self._items()
        items.append(dict(doc))
        self._save_items(items)
        return {'ok': True}

    async def find_one(self, query=None):
        for doc in self._items():
            if self._matches(doc, query or {}):
                return dict(doc)
        return None

    async def count_documents(self, query=None):
        return len([doc for doc in self._items() if self._matches(doc, query or {})])

    def find(self, query=None):
        return LocalCursor(self, query or {})

    async def update_one(self, query, update, upsert=False):
        items = self._items()
        index = next((i for i, doc in enumerate(items) if self._matches(doc, query)), None)
        if index is None:
            if upsert:
                doc = {}
                ```python
    async def update_one(self, query, update, upsert=False):
        items = self._items()
        index = next(
            (i for i, doc in enumerate(items)
             if self._matches(doc, query)),
            None
        )

        if index is None:
            if upsert:
                doc = {}
                if '$set' in update:
                    doc.update(update['$set'])
                items.append(doc)
                self._save_items(items)
                return {'ok': True}
            return {'ok': True}

        item = items[index]

        if '$set' in update:
            item.update(update['$set'])

        items[index] = item
        self._save_items(items)
        return {'ok': True}
```
                    doc.update(update['$set'])
                items.append(doc)
                self._save_items(items)
                return {'ok': True}
            return {'ok': True}
        item = items[index]
        if '$set' in update:
