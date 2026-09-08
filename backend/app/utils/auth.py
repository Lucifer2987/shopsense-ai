import logging
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Optional

import jwt
from flask import g, request

from app.config import Config
from app.utils.errors import APIError

logger = logging.getLogger(__name__)

_TOKEN_EXPIRY_HOURS = 24
_ALGORITHM = "HS256"


def create_token(seller_id: str, role: str) -> str:
    payload = {
        "seller_id": seller_id,
        "role": role,
        "exp": datetime.now(tz=timezone.utc) + timedelta(hours=_TOKEN_EXPIRY_HOURS),
        "iat": datetime.now(tz=timezone.utc),
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm=_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise APIError("Token has expired.", "TOKEN_EXPIRED", 401)
    except jwt.InvalidTokenError:
        raise APIError("Invalid token.", "INVALID_TOKEN", 401)


def _extract_bearer_token(auth_header: Optional[str]) -> str:
    if not auth_header or not auth_header.startswith("Bearer "):
        raise APIError("Authentication required.", "MISSING_TOKEN", 401)
    return auth_header[len("Bearer "):]


def require_seller(f):
    """Decorator — requires a valid seller JWT in the Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extract_bearer_token(request.headers.get("Authorization"))
        payload = decode_token(token)
        g.seller_id = payload["seller_id"]
        g.seller_role = payload["role"]
        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    """Decorator — requires a valid JWT with role=admin."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extract_bearer_token(request.headers.get("Authorization"))
        payload = decode_token(token)
        if payload.get("role") != "admin":
            raise APIError("Admin access required.", "FORBIDDEN", 403)
        g.seller_id = payload["seller_id"]
        g.seller_role = payload["role"]
        return f(*args, **kwargs)
    return decorated
