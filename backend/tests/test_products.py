from unittest.mock import MagicMock, patch

SAMPLE_PRODUCTS = [
    {"id": "1", "name": "Milk", "category": "Dairy", "price": 62, "brand": "Amul", "stock": 50, "tags": []},
    {"id": "2", "name": "Butter", "category": "Dairy", "price": 55, "brand": "Amul", "stock": 30, "tags": []},
]


def test_get_all_products(client):
    with patch("app.services.product_service.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.execute.return_value.data = SAMPLE_PRODUCTS
        response = client.get("/api/products")

    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "products" in data["data"]


def test_search_products(client):
    milk_only = [SAMPLE_PRODUCTS[0]]
    with patch("app.services.product_service.supabase") as mock_sb:
        chain = mock_sb.table.return_value.select.return_value
        chain.ilike.return_value = chain
        chain.execute.return_value.data = milk_only
        response = client.get("/api/products?search=milk")

    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True


def test_get_product_not_found(client):
    with patch("app.services.product_service.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        response = client.get("/api/products/nonexistent-id")

    assert response.status_code == 404
    data = response.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "PRODUCT_NOT_FOUND"


def test_invalid_price_filter(client):
    response = client.get("/api/products?max_price=notanumber")
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
