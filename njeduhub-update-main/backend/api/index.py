```python
import sys
from pathlib import Path

# Locate the backend folder
BACKEND_DIR = Path(__file__).resolve().parents[1]

# Allow Python to import server.py
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Load the existing FastAPI application
from server import app
