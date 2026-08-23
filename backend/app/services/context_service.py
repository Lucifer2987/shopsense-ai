import logging
from datetime import datetime, timezone
from typing import Optional

from app.services.supabase_service import supabase

logger = logging.getLogger(__name__)


def create_context(user_id: str, context_type: str, context_data: dict, expires_at: Optional[str] = None) -> dict:
    payload = {
        "user_id": user_id,
        "context_type": context_type,
        "context_data": context_data,
    }
    if expires_at:
        payload["expires_at"] = expires_at

    result = supabase.table("shopping_context").insert(payload).execute()
    return result.data[0]


def get_context(user_id: str) -> list[dict]:
    now = datetime.now(timezone.utc).isoformat()
    result = (
        supabase.table("shopping_context")
        .select("*")
        .eq("user_id", user_id)
        .or_(f"expires_at.is.null,expires_at.gt.{now}")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


def delete_context(context_id: str) -> bool:
    result = supabase.table("shopping_context").delete().eq("id", context_id).execute()
    return bool(result.data)


def get_active_context(user_id: str) -> Optional[dict]:
    contexts = get_context(user_id)
    return contexts[0] if contexts else None
