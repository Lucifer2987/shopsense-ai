import logging
from typing import Optional

from app.services.supabase_service import supabase
from app.services.shopping_service import get_list_items
from app.services.product_service import find_substitutes

logger = logging.getLogger(__name__)


def optimize_basket(list_id: str, budget: Optional[float]) -> dict:
    items = get_list_items(list_id)
    if not items:
        return {"current_total": 0, "suggestions": [], "message": "Shopping list is empty."}

    current_total = sum(
        (item.get("products") or {}).get("price", 0) * item["quantity"]
        for item in items
    )

    if budget is None or current_total <= budget:
        return {
            "current_total": round(current_total, 2),
            "within_budget": True,
            "suggestions": [],
            "message": "Basket is within budget." if budget else "No budget set.",
        }

    overage = current_total - budget
    suggestions = []

    items_sorted = sorted(
        items,
        key=lambda i: (i.get("products") or {}).get("price", 0),
        reverse=True,
    )

    for item in items_sorted:
        if overage <= 0:
            break
        product = item.get("products")
        if not product:
            continue

        substitutes = find_substitutes(product, max_price=product["price"] - 1)
        if substitutes:
            best_sub = substitutes[0]
            saving = (product["price"] - best_sub["price"]) * item["quantity"]
            suggestions.append({
                "current_product": product["name"],
                "replacement": best_sub["name"],
                "replacement_price": best_sub["price"],
                "current_price": product["price"],
                "saving": round(saving, 2),
                "reason": best_sub.get("reasons", ["Lower price"]),
            })
            overage -= saving

    optimized_total = current_total - sum(s["saving"] for s in suggestions)
    return {
        "current_total": round(current_total, 2),
        "optimized_total": round(optimized_total, 2),
        "savings": round(current_total - optimized_total, 2),
        "within_budget": optimized_total <= budget,
        "suggestions": suggestions,
    }
