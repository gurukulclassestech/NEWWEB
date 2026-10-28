# Backend expiration

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
