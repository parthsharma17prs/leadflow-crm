"""
routers/health.py
------------------
Simple health-check endpoint.
Verifies:
  1. FastAPI is running
  2. MongoDB is reachable (ping command)
"""

from fastapi import APIRouter
from db import get_db

router = APIRouter()


@router.get("/health", tags=["Health"])
def health_check():
    """Returns 200 with service status and MongoDB connectivity."""
    try:
        db = get_db()
        # MongoDB ping — raises if connection is down
        db.client.admin.command("ping")
        mongo_status = "connected"
    except Exception as exc:
        mongo_status = f"error: {exc}"

    return {
        "service":  "LeadFlow FastAPI Analytics Service",
        "status":   "ok",
        "version":  "1.0.0",
        "mongodb":  mongo_status,
    }

