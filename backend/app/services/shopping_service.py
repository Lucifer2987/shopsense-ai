import logging
from typing import Optional

from app.services.supabase_service import supabase

logger = logging.getLogger(__name__)


def create_list(user_id: str, name: str) -> dict:
    result = (
        supabase.table("shopping_lists")
        .insert({"user_id": user_id, "name": name})
        .execute()
    )
    return result.data[0]


def get_list(list_id: str) -> Optional[dict]:
    result = (
        supabase.table("shopping_lists")
        .select("*, shopping_items(*, products(*))")
        .eq("id", list_id)
        .execute()
    )
    return result.data[0] if result.data else None


def delete_list(list_id: str) -> bool:
    supabase.table("shopping_items").delete().eq("list_id", list_id).execute()
    result = supabase.table("shopping_lists").delete().eq("id", list_id).execute()
    return bool(result.data)


def add_item(list_id: str, product_id: str, quantity: float, unit: str) -> dict:
    existing = (
        supabase.table("shopping_items")
        .select("*")
        .eq("list_id", list_id)
        .eq("product_id", product_id)
        .execute()
    )
    if existing.data:
        item = existing.data[0]
        result = (
            supabase.table("shopping_items")
            .update({"quantity": item["quantity"] + quantity})
            .eq("id", item["id"])
            .execute()
        )
    else:
        result = (
            supabase.table("shopping_items")
            .insert({
                "list_id": list_id,
                "product_id": product_id,
                "quantity": quantity,
                "unit": unit,
                "is_completed": False,
            })
            .execute()
        )
    return result.data[0]


def update_item(item_id: str, quantity: Optional[float], is_completed: Optional[bool]) -> Optional[dict]:
    updates: dict = {}
    if quantity is not None:
        updates["quantity"] = quantity
    if is_completed is not None:
        updates["is_completed"] = is_completed
    if not updates:
        return None
    result = (
        supabase.table("shopping_items")
        .update(updates)
        .eq("id", item_id)
        .execute()
    )
    return result.data[0] if result.data else None


def delete_item(item_id: str) -> bool:
    result = supabase.table("shopping_items").delete().eq("id", item_id).execute()
    return bool(result.data)


def get_list_items(list_id: str) -> list[dict]:
    result = (
        supabase.table("shopping_items")
        .select("*, products(*)")
        .eq("list_id", list_id)
        .execute()
    )
    return result.data
