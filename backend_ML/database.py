"""
database.py — Async MongoDB connection using Motor.

Provides:
  - A single AsyncIOMotorClient created at startup (lifespan).
  - get_db() FastAPI dependency that yields the default database.

Usage in endpoints:
    from database import get_db
    from motor.motor_asyncio import AsyncIOMotorDatabase

    @app.get("/example")
    async def example(db: AsyncIOMotorDatabase = Depends(get_db)):
        doc = await db["collection"].find_one({})
        ...

The database name is derived from MONGO_URI (the path component).
Example URI: mongodb+srv://user:pass@cluster.mongodb.net/mydb
  → database name = "mydb"
If the URI has no path / database name, Motor uses "test" by default.
"""

import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

# Module-level client — initialised in init_db(), closed in close_db()
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def init_db() -> None:
    """
    Create the Motor client.  Call this once at application startup
    (e.g., inside a FastAPI lifespan context manager).
    """
    global _client, _db

    mongo_uri = os.environ.get("MONGO_URI")
    if not mongo_uri:
        raise RuntimeError(
            "MONGO_URI environment variable is not set. "
            "Add it to backend_ML/.env before starting the server."
        )

    _client = AsyncIOMotorClient(mongo_uri)
    # get_default_database() reads the DB name from the URI path segment.
    # Falls back to "test" if the URI has no database name.
    _db = _client.get_default_database()
    logger.info(f"MongoDB connected (database: {_db.name})")


async def close_db() -> None:
    """Close the Motor client.  Call this at application shutdown."""
    global _client
    if _client is not None:
        _client.close()
        logger.info("MongoDB connection closed.")


def get_db() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency.  Returns the shared Motor database instance.
    Raises RuntimeError if init_db() was never called.
    """
    if _db is None:
        raise RuntimeError("Database not initialised. Call init_db() at startup.")
    return _db
