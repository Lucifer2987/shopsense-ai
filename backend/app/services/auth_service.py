import logging
from typing import Optional

import bcrypt

from app.services.supabase_service import supabase
from app.utils.auth import create_token
from app.utils.errors import APIError

logger = logging.getLogger(__name__)


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def register_seller(email: str, password: str) -> dict:
    existing = (
        supabase.table("sellers")
        .select("id")
        .eq("email", email.lower().strip())
        .execute()
    )
    if existing.data:
        raise APIError("Email already registered.", "EMAIL_EXISTS", 409)

    result = (
        supabase.table("sellers")
        .insert({
            "email": email.lower().strip(),
            "password_hash": _hash_password(password),
            "role": "seller",  # Public registration always creates a seller, never admin.
        })
        .execute()
    )
    seller = result.data[0]
    # Automatically create a default store for the new seller.
    store_result = (
        supabase.table("stores")
        .insert({"seller_id": seller["id"], "name": f"{email.split('@')[0]}'s Store"})
        .execute()
    )
    return _safe_seller(seller)


def login_seller(email: str, password: str) -> dict:
    result = (
        supabase.table("sellers")
        .select("*")
        .eq("email", email.lower().strip())
        .execute()
    )
    if not result.data:
        raise APIError("Invalid credentials.", "INVALID_CREDENTIALS", 401)

    seller = result.data[0]
    if not seller.get("is_active"):
        raise APIError("Account is deactivated.", "ACCOUNT_INACTIVE", 403)
    if not _verify_password(password, seller["password_hash"]):
        raise APIError("Invalid credentials.", "INVALID_CREDENTIALS", 401)

    token = create_token(seller["id"], seller["role"])
    return {"token": token, "seller": _safe_seller(seller)}


def get_seller_by_id(seller_id: str) -> Optional[dict]:
    result = (
        supabase.table("sellers")
        .select("id, email, role, is_active, created_at")
        .eq("id", seller_id)
        .execute()
    )
    return result.data[0] if result.data else None


def _safe_seller(seller: dict) -> dict:
    """Return a seller dict with the password hash stripped out."""
    return {k: v for k, v in seller.items() if k != "password_hash"}
