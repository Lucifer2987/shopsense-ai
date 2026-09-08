import logging
from typing import Optional

from app.services.supabase_service import supabase
from app.utils.errors import APIError

logger = logging.getLogger(__name__)


def get_store_for_seller(seller_id: str) -> dict:
    """Return the seller's first active store (default single-store flow)."""
    result = (
        supabase.table("stores")
        .select("*")
        .eq("seller_id", seller_id)
        .eq("is_active", True)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise APIError(
            "No active store found for this seller. Create a store first.",
            "STORE_NOT_FOUND",
            404,
        )
    return result.data[0]


def get_stores_for_seller(seller_id: str) -> list[dict]:
    """Return all active stores for a seller (multi-store capable)."""
    result = (
        supabase.table("stores")
        .select("*")
        .eq("seller_id", seller_id)
        .eq("is_active", True)
        .execute()
    )
    return result.data


def get_store_by_id(store_id: str, seller_id: str) -> dict:
    """Return a specific store, verifying it belongs to the authenticated seller."""
    result = (
        supabase.table("stores")
        .select("*")
        .eq("id", store_id)
        .eq("seller_id", seller_id)
        .eq("is_active", True)
        .execute()
    )
    if not result.data:
        raise APIError("Store not found.", "STORE_NOT_FOUND", 404)
    return result.data[0]



def get_inventory(store_id: str, page: int = 1, per_page: int = 50) -> dict:
    offset = (page - 1) * per_page
    result = (
        supabase.table("inventory")
        .select("*, products(id, name, category, brand, price, is_active)")
        .eq("store_id", store_id)
        .range(offset, offset + per_page - 1)
        .execute()
    )
    return {"items": result.data, "page": page, "per_page": per_page}


def get_inventory_by_product(store_id: str, product_id: str) -> Optional[dict]:
    result = (
        supabase.table("inventory")
        .select("*, products(id, name, category, brand, price, is_active)")
        .eq("store_id", store_id)
        .eq("product_id", product_id)
        .execute()
    )
    return result.data[0] if result.data else None


def create_inventory(store_id: str, product_id: str, quantity: int, minimum_stock: int) -> dict:
    existing = (
        supabase.table("inventory")
        .select("id")
        .eq("store_id", store_id)
        .eq("product_id", product_id)
        .execute()
    )
    if existing.data:
        raise APIError("Inventory record already exists for this product.", "ALREADY_EXISTS", 409)

    result = (
        supabase.table("inventory")
        .insert({
            "store_id": store_id,
            "product_id": product_id,
            "quantity": quantity,
            "minimum_stock": minimum_stock,
        })
        .execute()
    )
    return result.data[0]


def _ensure_inventory_exists(store_id: str, product_id: str) -> dict:
    inv = get_inventory_by_product(store_id, product_id)
    if not inv:
        raise APIError("No inventory record found for this product.", "INVENTORY_NOT_FOUND", 404)
    return inv


def stock_in(store_id: str, product_id: str, seller_id: str, quantity: int, note: Optional[str]) -> dict:
    _ensure_inventory_exists(store_id, product_id)
    return _call_atomic_update(store_id, product_id, seller_id, "STOCK_IN", quantity, note)


def stock_out(store_id: str, product_id: str, seller_id: str, quantity: int, note: Optional[str]) -> dict:
    _ensure_inventory_exists(store_id, product_id)
    # Negative delta for stock out.
    return _call_atomic_update(store_id, product_id, seller_id, "STOCK_OUT", -quantity, note)


def adjust_stock(store_id: str, product_id: str, seller_id: str, target_quantity: int, note: Optional[str]) -> dict:
    _ensure_inventory_exists(store_id, product_id)
    # For ADJUSTMENT, p_delta is the absolute target quantity (handled in the SQL function).
    return _call_atomic_update(store_id, product_id, seller_id, "ADJUSTMENT", target_quantity, note)


def get_low_stock(store_id: str) -> list[dict]:
    """Products where quantity > 0 but quantity < minimum_stock."""
    result = (
        supabase.table("inventory")
        .select("*, products(id, name, category, brand, price)")
        .eq("store_id", store_id)
        .gt("quantity", 0)
        .execute()
    )
    return [row for row in result.data if row["quantity"] < row["minimum_stock"]]


def get_out_of_stock(store_id: str) -> list[dict]:
    result = (
        supabase.table("inventory")
        .select("*, products(id, name, category, brand, price)")
        .eq("store_id", store_id)
        .eq("quantity", 0)
        .execute()
    )
    return result.data


def get_transactions(store_id: str, product_id: str, page: int = 1, per_page: int = 50) -> dict:
    offset = (page - 1) * per_page
    result = (
        supabase.table("inventory_transactions")
        .select("*")
        .eq("store_id", store_id)
        .eq("product_id", product_id)
        .order("created_at", desc=True)
        .range(offset, offset + per_page - 1)
        .execute()
    )
    return {"transactions": result.data, "page": page, "per_page": per_page}


def update_minimum_stock(store_id: str, product_id: str, minimum_stock: int) -> dict:
    _ensure_inventory_exists(store_id, product_id)
    result = (
        supabase.table("inventory")
        .update({"minimum_stock": minimum_stock})
        .eq("store_id", store_id)
        .eq("product_id", product_id)
        .execute()
    )
    return result.data[0]


def _call_atomic_update(
    store_id: str,
    product_id: str,
    seller_id: str,
    tx_type: str,
    delta: int,
    note: Optional[str],
) -> dict:
    """
    Delegates the stock mutation + transaction-log insert to the
    atomic_inventory_update Postgres function so that both happen
    inside a single DB transaction, preventing read-modify-write races.
    """
    try:
        result = supabase.rpc(
            "atomic_inventory_update",
            {
                "p_store_id": store_id,
                "p_product_id": product_id,
                "p_seller_id": seller_id,
                "p_type": tx_type,
                "p_delta": delta,
                "p_note": note,
            },
        ).execute()
    except Exception as exc:
        msg = str(exc)
        if "INSUFFICIENT_STOCK" in msg:
            raise APIError("Insufficient stock for this operation.", "INSUFFICIENT_STOCK", 409)
        if "INVENTORY_NOT_FOUND" in msg:
            raise APIError("No inventory record found.", "INVENTORY_NOT_FOUND", 404)
        if "INVALID_QUANTITY" in msg:
            raise APIError("Invalid quantity for this operation.", "INVALID_QUANTITY", 400)
        if "INVALID_TYPE" in msg:
            raise APIError("Invalid transaction type.", "INVALID_TYPE", 400)
        logger.error("Inventory RPC error (%s): %s", tx_type, exc)
        raise APIError("Inventory update failed.", "DB_ERROR", 503)

    return result.data
