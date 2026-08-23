import logging
from typing import Optional

from app.services.supabase_service import supabase

logger = logging.getLogger(__name__)

# Small deterministic Hinglish→English product name map.
# Gemini already translates most terms; this handles common misses.
_HINGLISH_MAP: dict[str, str] = {
    "doodh": "milk",
    "dudh": "milk",
    "dudha": "milk",
    "atta": "flour",
    "aata": "flour",
    "chawal": "rice",
    "chini": "sugar",
    "namak": "salt",
    "tel": "oil",
    "ghee": "ghee",
    "dahi": "yogurt",
    "paneer": "paneer",
    "sabzi": "vegetables",
    "seb": "apple",
    "kela": "banana",
    "santara": "orange",
    "tamatar": "tomato",
    "aloo": "potato",
    "pyaaz": "onion",
    "lahsun": "garlic",
    "adrak": "ginger",
    "chai": "tea",
    "paani": "water",
    "anda": "eggs",
    "makkhan": "butter",
    "bread": "bread",
}


def _normalize_name(name: str) -> str:
    """Translate a Hinglish product name to English if a mapping exists."""
    lower = name.strip().lower()
    return _HINGLISH_MAP.get(lower, lower)


def get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    max_price: Optional[float] = None,
    min_price: Optional[float] = None,
    in_stock: Optional[bool] = None,
) -> list[dict]:
    query = supabase.table("products").select("*")

    if search:
        query = query.ilike("name", f"%{search}%")
    if category:
        query = query.eq("category", category)
    if brand:
        query = query.ilike("brand", f"%{brand}%")
    if max_price is not None:
        query = query.lte("price", max_price)
    if min_price is not None:
        query = query.gte("price", min_price)
    if in_stock is True:
        query = query.eq("stock", True)

    return query.execute().data


def get_product_by_id(product_id: str) -> Optional[dict]:
    result = supabase.table("products").select("*").eq("id", product_id).execute()
    return result.data[0] if result.data else None


def find_best_product(name: str, brand: Optional[str] = None) -> Optional[dict]:
    """
    Find the best matching product for a given name.

    Selection priority:
    1. Normalise Hinglish name to English.
    2. ilike search on name (case-insensitive substring).
    3. If brand specified, prefer brand match.
    4. Among remaining ties, prefer lowest price (deterministic).
    Returns None only if no product matches at all.
    """
    normalised = _normalize_name(name)
    logger.info("Product lookup: %r -> normalised %r", name, normalised)

    candidates = (
        supabase.table("products")
        .select("*")
        .ilike("name", f"%{normalised}%")
        .eq("stock", True)
        .execute()
        .data
    )

    if not candidates:
        logger.warning("No products found for name=%r (normalised=%r)", name, normalised)
        return None

    if brand:
        brand_lower = brand.lower()
        brand_matches = [p for p in candidates if brand_lower in (p.get("brand") or "").lower()]
        if brand_matches:
            candidates = brand_matches

    # Deterministic tie-break: lowest price
    candidates.sort(key=lambda p: p.get("price") or 0)
    logger.info(
        "Matched %d product(s) for %r — selected %r (brand=%r, price=%s)",
        len(candidates),
        normalised,
        candidates[0]["name"],
        candidates[0].get("brand"),
        candidates[0].get("price"),
    )
    return candidates[0]


def find_products_by_name(name: str) -> list[dict]:
    """Return all in-stock products matching name (for presenting alternatives)."""
    normalised = _normalize_name(name)
    return (
        supabase.table("products")
        .select("*")
        .ilike("name", f"%{normalised}%")
        .eq("stock", True)
        .execute()
        .data
    )


# Keep backward-compat alias used by recommendation/context services
def find_product_by_name(name: str) -> Optional[dict]:
    return find_best_product(name)


def find_substitutes(product: dict, max_price: Optional[float] = None) -> list[dict]:
    query = (
        supabase.table("products")
        .select("*")
        .eq("category", product.get("category", ""))
        .neq("id", product["id"])
        .eq("stock", True)
    )
    if max_price is not None:
        query = query.lte("price", max_price)

    candidates = query.order("price").limit(5).execute().data

    results = []
    for c in candidates:
        reasons = ["Same category", "In stock"]
        if max_price and c["price"] <= max_price:
            reasons.append("Fits price constraint")
        if c["price"] < product.get("price", 0):
            reasons.append(f"Cheaper by Rs.{product['price'] - c['price']:.0f}")
        results.append({**c, "reasons": reasons})
    return results
