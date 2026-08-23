import logging
from datetime import datetime, timezone
from statistics import mean
from typing import Optional

from app.services.supabase_service import supabase

logger = logging.getLogger(__name__)


def record_purchase(user_id: str, product_id: str, quantity: float, price: float) -> dict:
    result = (
        supabase.table("shopping_history")
        .insert({
            "user_id": user_id,
            "product_id": product_id,
            "quantity": quantity,
            "price": price,
            "purchased_at": datetime.now(timezone.utc).isoformat(),
        })
        .execute()
    )
    return result.data[0]


def get_history(user_id: str, limit: int = 50) -> list[dict]:
    result = (
        supabase.table("shopping_history")
        .select("*, products(*)")
        .eq("user_id", user_id)
        .order("purchased_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


def get_purchase_frequency(user_id: str) -> dict[str, dict]:
    """
    Returns per-product frequency stats: average days between purchases
    and days since last purchase.
    """
    records = (
        supabase.table("shopping_history")
        .select("product_id, purchased_at, products(name)")
        .eq("user_id", user_id)
        .order("purchased_at", desc=False)
        .execute()
        .data
    )

    by_product: dict[str, list[datetime]] = {}
    for r in records:
        pid = r["product_id"]
        dt = datetime.fromisoformat(r["purchased_at"].replace("Z", "+00:00"))
        by_product.setdefault(pid, []).append(dt)

    freq: dict[str, dict] = {}
    now = datetime.now(timezone.utc)
    for pid, dates in by_product.items():
        if len(dates) < 2:
            avg_gap = None
        else:
            gaps = [(dates[i] - dates[i - 1]).days for i in range(1, len(dates))]
            avg_gap = mean(gaps)
        last = dates[-1]
        freq[pid] = {
            "avg_gap_days": avg_gap,
            "days_since_last": (now - last).days,
            "purchase_count": len(dates),
        }
    return freq
