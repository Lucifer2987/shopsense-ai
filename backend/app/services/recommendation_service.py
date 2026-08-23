import logging
from datetime import datetime, timezone
from typing import Optional

from app.services.supabase_service import supabase
from app.services.history_service import get_purchase_frequency
from app.services.product_service import get_products

logger = logging.getLogger(__name__)

_CURRENT_MONTH = datetime.now(timezone.utc).month

# Rough season mapping for India
_SEASONS: dict[str, list[int]] = {
    "summer": [3, 4, 5, 6],
    "monsoon": [7, 8, 9],
    "winter": [11, 12, 1, 2],
}


def _current_season() -> str:
    for season, months in _SEASONS.items():
        if _CURRENT_MONTH in months:
            return season
    return "spring"


def _history_score(freq_data: dict) -> tuple[float, list[str]]:
    reasons: list[str] = []
    score = 0.0
    if freq_data.get("avg_gap_days"):
        gap = freq_data["avg_gap_days"]
        since = freq_data["days_since_last"]
        score += min(since / gap, 1.5) * 0.4
        if since >= gap:
            reasons.append(f"You usually buy this every {int(gap)} days — overdue by {since - int(gap)} days.")
        else:
            reasons.append(f"You usually buy this every {int(gap)} days (last: {since} days ago).")
    return score, reasons


def get_recommendations(user_id: str, context: Optional[dict] = None, limit: int = 10) -> list[dict]:
    freq_map = get_purchase_frequency(user_id)
    all_products = get_products(in_stock=True)

    current_season = _current_season()

    scored: list[tuple[float, dict, list[str]]] = []
    for product in all_products:
        pid = str(product["id"])
        score = 0.0
        reasons: list[str] = []

        # History signal
        if pid in freq_map:
            h_score, h_reasons = _history_score(freq_map[pid])
            score += h_score
            reasons.extend(h_reasons)
            count = freq_map[pid]["purchase_count"]
            if count >= 3:
                reasons.append(f"Purchased {count} times before.")

        # Availability signal
        if product.get("stock", 0) > 0:
            score += 0.1
            reasons.append("Currently in stock.")

        # Season signal
        product_season = (product.get("season") or "").lower()
        if product_season and product_season == current_season:
            score += 0.15
            reasons.append(f"Seasonal pick for {current_season}.")

        # Context signal
        if context:
            ctx_type = context.get("type", "")
            people = context.get("people", 1) or 1
            budget = context.get("budget")

            if ctx_type in ("party", "guests") and product.get("category") in (
                "Beverages", "Snacks", "Dairy", "Fruits"
            ):
                score += 0.2
                reasons.append(f"Good for {ctx_type} with {people} people.")

            if ctx_type in ("healthy_shopping",) and "organic" in (
                " ".join(product.get("tags") or [])
            ).lower():
                score += 0.2
                reasons.append("Matches healthy shopping preference.")

            if budget and product["price"] <= budget / max(people, 1):
                score += 0.1
                reasons.append("Fits within budget.")

        if score > 0:
            scored.append((score, product, reasons))

    scored.sort(key=lambda x: x[0], reverse=True)

    return [
        {
            "product": item,
            "score": round(score, 3),
            "reason": reasons,
        }
        for score, item, reasons in scored[:limit]
    ]
