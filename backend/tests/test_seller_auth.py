from unittest.mock import MagicMock, patch

import pytest

SELLER = {
    "id": "seller-uuid-1",
    "email": "seller@example.com",
    "password_hash": "$2b$12$fakehash",
    "role": "seller",
    "is_active": True,
    "created_at": "2024-01-01T00:00:00Z",
}
SAFE_SELLER = {k: v for k, v in SELLER.items() if k != "password_hash"}


# ── Registration ──────────────────────────────────────────────────────────────

def test_register_success(client):
    with patch("app.services.auth_service.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        mock_sb.table.return_value.insert.return_value.execute.return_value.data = [SELLER]
        response = client.post(
            "/api/seller/auth/register",
            json={"email": "seller@example.com", "password": "securepass123"},
        )
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True
    assert "password_hash" not in data["data"]["seller"]


def test_register_duplicate_email(client):
    with patch("app.services.auth_service.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [SELLER]
        response = client.post(
            "/api/seller/auth/register",
            json={"email": "seller@example.com", "password": "securepass123"},
        )
    assert response.status_code == 409
    assert response.get_json()["error"]["code"] == "EMAIL_EXISTS"


def test_register_short_password(client):
    response = client.post(
        "/api/seller/auth/register",
        json={"email": "test@example.com", "password": "short"},
    )
    assert response.status_code == 422


def test_register_invalid_email(client):
    response = client.post(
        "/api/seller/auth/register",
        json={"email": "notanemail", "password": "securepass123"},
    )
    assert response.status_code == 422


def test_register_cannot_set_admin_role(client):
    """Public registration must ignore any role field — always creates seller."""
    with patch("app.services.auth_service.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        mock_sb.table.return_value.insert.return_value.execute.return_value.data = [SELLER]
        response = client.post(
            "/api/seller/auth/register",
            json={"email": "hacker@example.com", "password": "securepass123", "role": "admin"},
        )
    assert response.status_code == 201
    data = response.get_json()
    assert data["data"]["seller"]["role"] == "seller"


# ── Login ─────────────────────────────────────────────────────────────────────

def test_login_success(client):
    import bcrypt
    hashed = bcrypt.hashpw(b"securepass123", bcrypt.gensalt()).decode()
    seller_with_hash = {**SELLER, "password_hash": hashed}

    with patch("app.services.auth_service.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [seller_with_hash]
        response = client.post(
            "/api/seller/auth/login",
            json={"email": "seller@example.com", "password": "securepass123"},
        )
    assert response.status_code == 200
    data = response.get_json()
    assert "token" in data["data"]
    assert "password_hash" not in data["data"]["seller"]


def test_login_wrong_password(client):
    import bcrypt
    hashed = bcrypt.hashpw(b"correctpassword", bcrypt.gensalt()).decode()
    seller_with_hash = {**SELLER, "password_hash": hashed}

    with patch("app.services.auth_service.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [seller_with_hash]
        response = client.post(
            "/api/seller/auth/login",
            json={"email": "seller@example.com", "password": "wrongpassword"},
        )
    assert response.status_code == 401
    assert response.get_json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_login_unknown_email(client):
    with patch("app.services.auth_service.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        response = client.post(
            "/api/seller/auth/login",
            json={"email": "nobody@example.com", "password": "password123"},
        )
    assert response.status_code == 401


def test_login_inactive_seller(client):
    import bcrypt
    hashed = bcrypt.hashpw(b"securepass123", bcrypt.gensalt()).decode()
    inactive = {**SELLER, "password_hash": hashed, "is_active": False}

    with patch("app.services.auth_service.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [inactive]
        response = client.post(
            "/api/seller/auth/login",
            json={"email": "seller@example.com", "password": "securepass123"},
        )
    assert response.status_code == 403
    assert response.get_json()["error"]["code"] == "ACCOUNT_INACTIVE"


# ── /me ───────────────────────────────────────────────────────────────────────

def _make_token(seller_id="seller-uuid-1", role="seller"):
    from app.utils.auth import create_token
    return create_token(seller_id, role)


def test_me_success(client):
    token = _make_token()
    with patch("app.services.auth_service.supabase") as mock_sb:
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [SAFE_SELLER]
        response = client.get(
            "/api/seller/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 200
    assert response.get_json()["data"]["seller"]["email"] == "seller@example.com"


def test_me_no_token(client):
    response = client.get("/api/seller/auth/me")
    assert response.status_code == 401


def test_me_invalid_token(client):
    response = client.get(
        "/api/seller/auth/me",
        headers={"Authorization": "Bearer thisisnotavalidtoken"},
    )
    assert response.status_code == 401


# ── Unauthorized access ───────────────────────────────────────────────────────

def test_seller_route_without_token(client):
    response = client.get("/api/seller/products")
    assert response.status_code == 401
