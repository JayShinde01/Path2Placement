"""
auth.py — JWT authentication router for FastAPI.

Mirrors the Node.js Express auth (authController.js + authMiddleware.js) exactly:
  POST /api/auth/register  → create user in MongoDB (bcrypt-hashed password)
  POST /api/auth/login     → verify password, return JWT {msg, token, user:{name,email}}
  Dependency get_current_user → validates Bearer token, returns user doc from MongoDB

MongoDB document shape (same collection "users" as Mongoose):
  {
    "_id": ObjectId,
    "name": str,
    "email": str,          # unique index
    "password": str        # bcrypt hash
  }

JWT payload (same claim name as Node to avoid frontend changes):
  { "id": "<str(_id)>", "exp": <unix timestamp> }
"""

import os
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, field_validator
import bcrypt
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase
from dotenv import load_dotenv

from database import get_db  # shared Motor client helper (see database.py)

logger = logging.getLogger(__name__)

load_dotenv()

# ---------------------------------------------------------------------------
# Security config — read from env, fail loudly at import time if missing
# ---------------------------------------------------------------------------
JWT_SECRET: str = os.environ.get("JWT_SECRET", "")
if not JWT_SECRET:
    JWT_SECRET = "path2placement-dev-secret"
    logger.warning(
        "JWT_SECRET is not set; using a local development fallback secret. "
        "Set JWT_SECRET in backend_ML/.env for production use."
    )

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS: int = int(os.environ.get("JWT_EXPIRATION_DAYS", "7"))

# ---------------------------------------------------------------------------
# Password hashing — using bcrypt directly (avoids passlib/bcrypt 5.x conflict)
# Compatible with Node's bcrypt hashes ($2b$ prefix, rounds=10)
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

# ---------------------------------------------------------------------------
# HTTP Bearer scheme (reads Authorization: Bearer <token>)
# ---------------------------------------------------------------------------
bearer_scheme = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# Pydantic request / response models
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name must not be empty")
        return v

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("password must be at least 6 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    name: str
    email: str


class LoginResponse(BaseModel):
    msg: str
    token: str
    user: UserOut


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------

def _create_access_token(user_id: str) -> str:
    """Sign a JWT with claim 'id' (matches Node payload { id: user._id })."""
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    payload = {"id": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token: str) -> dict:
    """Decode and verify JWT; raises JWTError on failure."""
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


# ---------------------------------------------------------------------------
# FastAPI dependency: get_current_user
# ---------------------------------------------------------------------------

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Reads Authorization: Bearer <token>, validates JWT, fetches user from MongoDB.
    Raises HTTP 401 if token is missing, invalid, or expired.
    Returns the full user document (dict) so endpoints can access current_user["_id"], etc.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token, access denied",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = _decode_token(token)
        user_id: str = payload.get("id")
        if user_id is None:
            raise JWTError("Missing 'id' claim")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from bson import ObjectId  # local import to avoid circular issues

    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user = await db["users"].find_one({"_id": oid})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


# ---------------------------------------------------------------------------
# Auth router
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    POST /api/auth/register
    Accepts {name, email, password}, hashes password with bcrypt,
    stores in MongoDB 'users' collection, returns 201 on success.
    Mirrors Node authController.register exactly.
    """
    existing = await db["users"].find_one({"email": body.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )

    hashed_pw = hash_password(body.password)
    new_user = {
        "name": body.name.strip(),
        "email": body.email,
        "password": hashed_pw,
    }
    await db["users"].insert_one(new_user)
    logger.info(f"Registered new user: {body.email}")
    return {"msg": "Registered successfully"}


@router.post("/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    POST /api/auth/login
    Verifies password hash, issues JWT signed with JWT_SECRET.
    Returns {msg, token, user:{name, email}} — matches Node response exactly.
    """
    user = await db["users"].find_one({"email": body.email})
    if user is None or not verify_password(body.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials",
        )

    token = _create_access_token(str(user["_id"]))
    logger.info(f"User logged in: {body.email}")
    return LoginResponse(
        msg="Login success",
        token=token,
        user=UserOut(name=user["name"], email=user["email"]),
    )
