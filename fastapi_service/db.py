"""
db.py — PyMongo connection to MongoDB Atlas (same cluster as Express backend)
Singleton pattern so we reuse the connection across all requests.
"""
import os
from typing import Optional
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

_client: Optional[MongoClient] = None


def get_db():
    """Return the leadflow_crm database handle (lazy singleton)."""
    global _client
    if _client is None:
        uri = os.getenv("MONGO_URI")
        if not uri:
            raise RuntimeError("MONGO_URI not set in .env")
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    return _client["leadflow_crm"]

