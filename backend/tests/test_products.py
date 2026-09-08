from unittest.mock import MagicMock, patch

SAMPLE_PRODUCTS = [
    {"id": "1", "name": "Milk", "category": "Dairy", "price": 62, "brand": "Amul", "stock": 50, "is_active": True, "tags": []},
    {"id": "2", "name": "Butter", "category": "Dairy", "price": 55, "brand": "Amul", "stock": 30, "is_active": True, "tags": []},
]


def _fluent_chain(data):
    """Return a MagicMock where every chained call returns itself, ending in execute().data = data."""
    chain = MagicMock()
    chain.select.return_value = chain
    chain.eq.return_value = chain
    chain.neq.return_value = chain
    chain.ilike.return_value = chain
    chain.lte.return_value = chain
    chain.gte.return_value = chain
    chain.order.return_value = chain
    chain.range.return_value = chain
    chain.limit.return_value = chain
    chain.execute.return_value.data = data
    return chain


def test_get_all_products(client):
    with patch("app.services.product_service.supabase") as mock_sb:
        mock_sb.table.return_value = _fluent_chain(SAMPLE_PRODUCTS)
        response = client.get("/api/products")

    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "products" in data["data"]


def test_search_products(client):
    milk_only = [SAMPLE_PRODUCTS[0]]
    with patch("app.services.product_service.supabase") as mock_sb:
        mock_sb.table.return_value = _fluent_chain(milk_only)
        response = client.get("/api/products?search=milk")

    assert response.status_code == 200
    assert response.get_json()["success"] is True


def test_get_product_not_found(client):
    with patch("app.services.product_service.supabase") as mock_sb:
        mock_sb.table.return_value = _fluent_chain([])
        response = client.get("/api/products/nonexistent-id")

    assert response.status_code == 404
    data = response.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "PRODUCT_NOT_FOUND"


def test_invalid_price_filter(client):
    response = client.get("/api/products?max_price=notanumber")
    assert response.status_code == 400
    assert response.get_json()["success"] is False
