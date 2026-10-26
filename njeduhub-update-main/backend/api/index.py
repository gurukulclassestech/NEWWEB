from server import app

# Vercel Python runtime expects the ASGI app to be named `app`.
# Importing the existing FastAPI app keeps the current API routes intact.
# This file is intentionally tiny so the backend remains deployable on Vercel.
