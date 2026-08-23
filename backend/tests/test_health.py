from unittest.mock import MagicMock, patch


def test_health_healthy(client):
    mock_response = MagicMock()
    mock_response.data = [{"id": "abc"}]

    with patch("app.routes.health.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.limit.return_value.execute.return_value = mock_response
        response = client.get("/api/health")

    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_health_unhealthy(client):
    with patch("app.routes.health.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.limit.return_value.execute.side_effect = Exception("DB down")
        response = client.get("/api/health")

    assert response.status_code == 503
    data = response.get_json()
    assert data["status"] == "unhealthy"
    assert data["database"] == "error"
