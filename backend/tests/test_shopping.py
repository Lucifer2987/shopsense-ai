from unittest.mock import MagicMock, patch


def test_create_list(client):
    mock_result = {"id": "list-1", "user_id": "user-1", "name": "Weekly"}
    with patch("app.services.shopping_service.supabase") as mock_sb:
        mock_sb.table.return_value.insert.return_value.execute.return_value.data = [mock_result]
        response = client.post("/api/shopping-lists", json={"user_id": "user-1", "name": "Weekly"})
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True
    assert data["data"]["name"] == "Weekly"


def test_create_list_missing_fields(client):
    response = client.post("/api/shopping-lists", json={"user_id": "user-1"})
    assert response.status_code == 422
    data = response.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "VALIDATION_ERROR"


def test_add_item_invalid_quantity(client):
    response = client.post(
        "/api/shopping-lists/list-1/items",
        json={"product_id": "prod-1", "quantity": -5, "unit": "kg"},
    )
    assert response.status_code == 422
    data = response.get_json()
    assert data["success"] is False


def test_get_list_not_found(client):
    with patch("app.services.shopping_service.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        response = client.get("/api/shopping-lists/nonexistent")
    assert response.status_code == 404
    data = response.get_json()
    assert data["error"]["code"] == "LIST_NOT_FOUND"
