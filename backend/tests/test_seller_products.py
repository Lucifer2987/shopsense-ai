from unittest.mock import MagicMock, call, patch

PRODUCT = {
    "id": "prod-uuid-1",
    "name": "Milk",
    "category": "Dairy",
    "brand": "Amul",
    "price": 62.0,
    "stock": False,   # New products always start with stock=False (no inventory yet)
    "is_active": True,
    "tags": [],
}


def _token():
    from app.utils.auth import create_token
    return create_token("seller-uuid-1", "seller")


def _auth():
    return {"Authorization": f"Bearer {_token()}"}


def _mock_product_table(mock_sb, data):
    chain = mock_sb.table.return_value
    chain.select.return_value = chain
    chain.insert.return_value = chain
    chain.update.return_value = chain
    chain.eq.return_value = chain
    chain.ilike.return_value = chain
    chain.order.return_value = chain
    chain.range.return_value = chain
    chain.execute.return_value.data = data
    return chain


# ── Listing ───────────────────────────────────────────────────────────────────

def test_seller_list_products(client):
    with patch("app.routes.seller_products.supabase") as mock_sb:
        _mock_product_table(mock_sb, [PRODUCT])
        response = client.get("/api/seller/products", headers=_auth())
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert len(data["data"]["products"]) == 1


def test_seller_list_products_no_auth(client):
    response = client.get("/api/seller/products")
    assert response.status_code == 401


# ── Create ────────────────────────────────────────────────────────────────────

def test_seller_create_product(client):
    """Seller creates a product successfully — HTTP 201 returned."""
    with patch("app.routes.seller_products.supabase") as mock_sb:
        chain = _mock_product_table(mock_sb, [PRODUCT])
        response = client.post(
            "/api/seller/products",
            json={"name": "Milk", "category": "Dairy", "price": 62.0},
            headers=_auth(),
        )
    assert response.status_code == 201
    assert response.get_json()["success"] is True


def test_seller_create_product_stock_false_is_active_true(client):
    """Newly created product must have stock=False and is_active=True.

    products.stock is a boolean Phase 1 availability flag.
    New products have no inventory, so stock MUST be inserted as False.
    is_active=True so the product is visible in the seller dashboard.
    """
    with patch("app.routes.seller_products.supabase") as mock_sb:
        chain = _mock_product_table(mock_sb, [PRODUCT])
        client.post(
            "/api/seller/products",
            json={"name": "Milk", "category": "Dairy", "price": 62.0},
            headers=_auth(),
        )
        # Capture what was passed to .insert()
        insert_call_args = chain.insert.call_args
        assert insert_call_args is not None, "insert() was never called"
        inserted_payload = insert_call_args[0][0]  # first positional arg
        assert inserted_payload.get("stock") is False, (
            "stock must be False for a new product (no inventory yet)"
        )
        assert inserted_payload.get("is_active") is True, (
            "is_active must be True so the product is visible"
        )


def test_seller_create_product_missing_fields(client):
    response = client.post(
        "/api/seller/products",
        json={"name": "Milk"},
        headers=_auth(),
    )
    assert response.status_code == 422


def test_seller_create_product_negative_price(client):
    response = client.post(
        "/api/seller/products",
        json={"name": "Milk", "category": "Dairy", "price": -10},
        headers=_auth(),
    )
    assert response.status_code == 422


# ── Update ────────────────────────────────────────────────────────────────────

def test_seller_update_product(client):
    with patch("app.routes.seller_products.supabase") as mock_sb:
        _mock_product_table(mock_sb, [PRODUCT])
        response = client.patch(
            "/api/seller/products/prod-uuid-1",
            json={"price": 70.0},
            headers=_auth(),
        )
    assert response.status_code == 200


def test_seller_update_no_changes(client):
    response = client.patch(
        "/api/seller/products/prod-uuid-1",
        json={},
        headers=_auth(),
    )
    assert response.status_code == 400
    assert response.get_json()["error"]["code"] == "NO_CHANGES"


def test_seller_update_not_found(client):
    with patch("app.routes.seller_products.supabase") as mock_sb:
        _mock_product_table(mock_sb, [])
        response = client.patch(
            "/api/seller/products/nonexistent",
            json={"price": 70.0},
            headers=_auth(),
        )
    assert response.status_code == 404


# ── Activate / Deactivate ─────────────────────────────────────────────────────

def test_seller_deactivate_product(client):
    updated = {**PRODUCT, "is_active": False}
    with patch("app.routes.seller_products.supabase") as mock_sb:
        _mock_product_table(mock_sb, [updated])
        response = client.post(
            "/api/seller/products/prod-uuid-1/deactivate",
            headers=_auth(),
        )
    assert response.status_code == 200
    assert response.get_json()["data"]["is_active"] is False


def test_seller_activate_product(client):
    with patch("app.routes.seller_products.supabase") as mock_sb:
        _mock_product_table(mock_sb, [PRODUCT])
        response = client.post(
            "/api/seller/products/prod-uuid-1/activate",
            headers=_auth(),
        )
    assert response.status_code == 200
    assert response.get_json()["data"]["is_active"] is True


def test_seller_activate_not_found(client):
    with patch("app.routes.seller_products.supabase") as mock_sb:
        _mock_product_table(mock_sb, [])
        response = client.post(
            "/api/seller/products/nonexistent/activate",
            headers=_auth(),
        )
    assert response.status_code == 404
