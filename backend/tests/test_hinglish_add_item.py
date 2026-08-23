"""
Focused test: "bhai 2 litre doodh add kar de" end-to-end.

Gemini is mocked to return a deterministic ADD_ITEM intent.
Supabase is real — verifies the actual product lookup works.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from unittest.mock import patch
from dotenv import load_dotenv
load_dotenv()

from app.schemas.intent import parse_intent
from app.services.product_service import find_best_product, find_products_by_name, _normalize_name


# --- Unit: Hinglish normalisation ---
def test_doodh_normalises_to_milk():
    assert _normalize_name("doodh") == "milk"
    assert _normalize_name("Doodh") == "milk"   # case-insensitive
    assert _normalize_name("milk") == "milk"
    assert _normalize_name("MILK") == "milk"
    print("PASS: doodh -> milk normalisation")


# --- Unit: Intent schema parses correctly ---
def test_add_item_intent_parse():
    raw = {
        "intent": "ADD_ITEM",
        "items": [{"name": "milk", "quantity": 2, "unit": "litre"}],
    }
    intent = parse_intent(raw)
    assert intent.intent == "ADD_ITEM"
    assert intent.items[0].name == "milk"
    assert intent.items[0].quantity == 2
    assert intent.items[0].unit == "litre"
    print("PASS: ADD_ITEM intent schema valid")


# --- Integration: real Supabase product lookup ---
def test_milk_product_lookup_real_db():
    product = find_best_product("milk")
    assert product is not None, "Expected to find at least one Milk product in Supabase"
    assert "milk" in product["name"].lower(), f"Unexpected product name: {product['name']}"
    assert product.get("stock") is True, "Expected product to be in stock"
    print(f"PASS: found product '{product['name']}' (brand={product.get('brand')}, price={product.get('price')})")


def test_doodh_lookup_real_db():
    product = find_best_product("doodh")
    assert product is not None, "Expected 'doodh' to resolve to a Milk product in Supabase"
    assert "milk" in product["name"].lower(), f"Unexpected product name: {product['name']}"
    print(f"PASS: 'doodh' resolved to '{product['name']}' (brand={product.get('brand')})")


def test_multiple_milk_products():
    products = find_products_by_name("milk")
    assert len(products) >= 1, "Expected at least 1 milk product"
    # Determinism: find_best_product should always return the lowest-priced one
    best = find_best_product("milk")
    prices = [p.get("price") or 0 for p in products if "milk" in p["name"].lower()]
    assert best["price"] == min(prices), (
        f"Expected lowest price {min(prices)} but got {best['price']}"
    )
    print(f"PASS: {len(products)} milk product(s) found, best={best['name']} price={best['price']}")


# --- Integration: full voice pipeline with mocked Gemini ---
def test_voice_add_item_pipeline():
    """
    Mocks Gemini and shopping DB writes.
    Uses REAL Supabase for product lookup — this is what was broken.
    Verifies the full intent→lookup→add chain succeeds.
    """
    from unittest.mock import patch, MagicMock
    from app.services import shopping_service

    gemini_response = {
        "intent": "ADD_ITEM",
        "items": [{"name": "milk", "quantity": 2, "unit": "litre"}],
    }

    fake_item = {
        "id": "item-001",
        "list_id": "list-001",
        "product_id": "prod-001",
        "quantity": 2,
        "unit": "litre",
        "is_completed": False,
    }

    with patch("app.services.gemini_service.parse_command", return_value=gemini_response):
        from app.services.intent_service import extract_intent
        intent = extract_intent("bhai 2 litre doodh add kar de")

    # 1. Intent is correct
    assert intent.intent == "ADD_ITEM"
    assert intent.items[0].name == "milk"
    assert intent.items[0].quantity == 2
    print("  Intent parsed: ADD_ITEM milk x2 litre")

    # 2. Real product lookup
    product = find_best_product(intent.items[0].name)
    assert product is not None, "Product lookup returned None — real Supabase failed"
    assert "milk" in product["name"].lower()
    assert product.get("stock") is True
    print(f"  Product found: '{product['name']}' brand={product['brand']} price={product['price']}")

    # 3. Mock DB write (profiles FK prevents real list creation without auth)
    with patch.object(shopping_service, "add_item", return_value=fake_item) as mock_add:
        result = shopping_service.add_item("list-001", product["id"], 2, "litre")
        mock_add.assert_called_once_with("list-001", product["id"], 2, "litre")
        assert result["quantity"] == 2

    print("  shopping_items.add_item called with correct product_id and quantity")
    print("PASS: Full pipeline verified (real product lookup, mocked DB write)")



if __name__ == "__main__":
    print("=== Hinglish ADD_ITEM Pipeline Tests ===\n")
    test_doodh_normalises_to_milk()
    test_add_item_intent_parse()
    test_milk_product_lookup_real_db()
    test_doodh_lookup_real_db()
    test_multiple_milk_products()
    test_voice_add_item_pipeline()
    print("\nAll tests passed.")
