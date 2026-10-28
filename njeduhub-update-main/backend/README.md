# Backend expiration

## SQLite storage

The backend uses Python's built-in `sqlite3` module and stores records and
uploaded images in `local_db/gurukulclasses.sqlite3` by default. Set
`SQLITE_DB_PATH` to choose a different database file. On first startup, existing
records in `local_db/gurukulclasses.json` are imported into SQLite.

**Local SQLite is not persistent on Vercel.** Vercel serverless functions have
temporary, instance-local filesystems; a SQLite file under `/tmp` can disappear
and is not shared between function instances. This configuration is suitable
for local development only. To persist production data, run this backend on a
host with a persistent disk, or change the deployment architecture to use a
hosted persistent database. The frontend redeploy does not control backend
database state.

The backend expiration is opt-in. When `BACKEND_EXPIRES_AT` is unset, the
backend continues to operate normally. To set a 10-day window, calculate a
UTC deadline for 10 days after the intended start time:

```sh
python -c "from datetime import datetime, timedelta, timezone; print((datetime.now(timezone.utc) + timedelta(days=10)).isoformat())"
```

Set the resulting ISO 8601 timestamp as `BACKEND_EXPIRES_AT` in
`backend/.env` for local deployments, or in the hosting provider's environment
settings for hosted deployments. For example:

```dotenv
BACKEND_EXPIRES_AT=2026-11-07T15:26:00+00:00
```

The server logs whether expiration is enabled and its configured UTC deadline
at startup. At and after that time, every request receives HTTP `503` with a
message that identifies the expiration and how to disable it.

To undo the expiration, remove `BACKEND_EXPIRES_AT` from the environment (or
unset it in `backend/.env`) and restart/redeploy the backend.
