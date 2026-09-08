from unittest.mock import MagicMock, patch

STORE = {"id": "store-uuid-1", "seller_id": "seller-uuid-1", "name": "Test Store", "is_active": True}
PRODUCT = {"id": "prod-uuid-1", "name": "Milk", "category": "Dairy", "price": 62.0, "is_active": True}
INV = {"id": "inv-uuid-1", "store_id": "store-uuid-1", "product_id": "prod-uuid-1", "quantity": 20, "minimum_stock": 5}


def _token():
    from app.utils.auth import create_token
    return create_token("seller-uuid-1", "seller")


def _auth():
    return {"Authorization": f"Bearer {_token()}"}


def _patch_store(mock_svc):
    mock_svc.get_store_for_seller.return_value = STORE


# ── List / Get ────────────────────────────────────────────────────────────────

def test_list_inventory(client):
    with patch("app.routes.seller_inventory.inventory_service") as mock_svc:
        _patch_store(mock_svc)
        mock_svc.get_inventory.return_value = {"items": [INV], "page": 1, "per_page": 20}
        response = client.get("/api/seller/inventory", headers=_auth())
    assert response.status_code == 200
    assert response.get_json()["success"] is True


def test_get_inventory_by_product(client):
    with patch("app.routes.seller_inventory.inventory_service") as mock_svc:
        _patch_store(mock_svc)
        mock_svc.get_inventory_by_product.return_value = INV
        response = client.get("/api/seller/inventory/prod-uuid-1", headers=_auth())
    assert response.status_code == 200


def test_get_inventory_not_found(client):
    with patch("app.routes.seller_inventory.inventory_service") as mock_svc:
        _patch_store(mock_svc)
        mock_svc.get_inventory_by_product.return_value = None
        response = client.get("/api/seller/inventory/nonexistent", headers=_auth())
    assert response.status_code == 404


# ── Stock In ──────────────────────────────────────────────────────────────────

def test_stock_in_success(client):
    updated = {**INV, "quantity": 30}
    with patch("app.routes.seller_inventory.inventory_service") as mock_svc:
        _patch_store(mock_svc)
        mock_svc.stock_in.return_value = updated
        response = client.post(
            "/api/seller/inventory/prod-uuid-1/stock-in",
            json={"quantity": 10},
            headers=_auth(),
        )
    assert response.status_code == 200
    assert response.get_json()["success"] is True


def test_stock_in_syncs_stock_flag_to_true(client):
    """After stock-in, inventory_service.stock_in is called and must sync products.stock=True.

    We test the service layer directly: after a successful _call_atomic_update with
    resulting quantity > 0, _sync_stock_flag must set stock=True.
    """
    rpc_result = {**INV, "quantity": 10}  # quantity > 0 after stock-in

    with patch("app.services.inventory_service.supabase") as mock_sb:
        # Mock the inventory existence check
        inv_chain = mock_sb.table.return_value
        inv_chain.select.return_value = inv_chain
        inv_chain.eq.return_value = inv_chain
        inv_chain.execute.return_value.data = [INV]

        # Mock the RPC call
        mock_sb.rpc.return_value.execute.return_value.data = rpc_result

        # Mock the products.stock update
        products_chain = MagicMock()
        products_chain.update.return_value = products_chain
        products_chain.eq.return_value = products_chain
        products_chain.execute.return_value.data = []

        # Make table() return different mocks per table name
        def table_side_effect(name):
            if name == "products":
                return products_chain
            return inv_chain

        mock_sb.table.side_effect = table_side_effect

        from app.services.inventory_service import stock_in
        stock_in("store-uuid-1", "prod-uuid-1", "seller-uuid-1", 10, None)

        # Verify products.stock was updated to True
        products_chain.update.assert_called_once_with({"stock": True})
        products_chain.eq.assert_called_once_with("id", "prod-uuid-1")


def test_stock_in_zero_quantity(client):
    response = client.post(
        "/api/seller/inventory/prod-uuid-1/stock-in",
        json={"quantity": 0},
        headers=_auth(),
    )
    assert response.status_code == 422


def test_stock_in_negative_quantity(client):
    response = client.post(
        "/api/seller/inventory/prod-uuid-1/stock-in",
        json={"quantity": -5},
        headers=_auth(),
    )
    assert response.status_code == 422


# ── Stock Out ─────────────────────────────────────────────────────────────────

def test_stock_out_success(client):
    updated = {**INV, "quantity": 13}
    with patch("app.routes.seller_inventory.inventory_service") as mock_svc:
        _patch_store(mock_svc)
        mock_svc.stock_out.return_value = updated
        response = client.post(
            "/api/seller/inventory/prod-uuid-1/stock-out",
            json={"quantity": 7},
            headers=_auth(),
        )
    assert response.status_code == 200


def test_stock_out_zero_quantity_syncs_stock_flag_to_false(client):
    """When stock-out reduces inventory to 0, products.stock must be synced to False."""
    rpc_result = {**INV, "quantity": 0}  # quantity hits 0 after stock-out

    with patch("app.services.inventory_service.supabase") as mock_sb:
        inv_chain = mock_sb.table.return_value
        inv_chain.select.return_value = inv_chain
        inv_chain.eq.return_value = inv_chain
        inv_chain.execute.return_value.data = [INV]

        mock_sb.rpc.return_value.execute.return_value.data = rpc_result

        products_chain = MagicMock()
        products_chain.update.return_value = products_chain
        products_chain.eq.return_value = products_chain
        products_chain.execute.return_value.data = []

        def table_side_effect(name):
            if name == "products":
                return products_chain
            return inv_chain

        mock_sb.table.side_effect = table_side_effect

        from app.services.inventory_service import stock_out
        stock_out("store-uuid-1", "prod-uuid-1", "seller-uuid-1", 20, None)

        # Verify products.stock was updated to False (quantity == 0)
        products_chain.update.assert_called_once_with({"stock": False})
        products_chain.eq.assert_called_once_with("id", "prod-uuid-1")


def test_stock_out_insufficient_stock(client):
    from app.utils.errors import APIError
    with patch("app.routes.seller_inventory.inventory_service") as mock_svc:
        _patch_store(mock_svc)
        mock_svc.stock_out.side_effect = APIError(
            "Insufficient stock.", "INSUFFICIENT_STOCK", 409
        )
        response = client.post(
            "/api/seller/inventory/prod-uuid-1/stock-out",
            json={"quantity": 999},
            headers=_auth(),
        )
    assert response.status_code == 409
    assert response.get_json()["error"]["code"] == "INSUFFICIENT_STOCK"


# ── Adjustment ────────────────────────────────────────────────────────────────

def test_adjust_stock(client):
    updated = {**INV, "quantity": 12}
    with patch("app.routes.seller_inventory.inventory_service") as mock_svc:
        _patch_store(mock_svc)
        mock_svc.adjust_stock.return_value = updated
        response = client.post(
            "/api/seller/inventory/prod-uuid-1/adjust",
            json={"quantity": 12},
            headers=_auth(),
        )
    assert response.status_code == 200


def test_adjust_negative_quantity_rejected(client):
    response = client.post(
        "/api/seller/inventory/prod-uuid-1/adjust",
        json={"quantity": -1},
        headers=_auth(),
    )
    assert response.status_code == 422


# ── Low-stock / Out-of-stock ──────────────────────────────────────────────────

def test_low_stock(client):
    low = {**INV, "quantity": 3, "minimum_stock": 5}
    with patch("app.routes.seller_inventory.inventory_service") as mock_svc:
        _patch_store(mock_svc)
        mock_svc.get_low_stock.return_value = [low]
        response = client.get("/api/seller/inventory/low-stock", headers=_auth())
    assert response.status_code == 200
    data = response.get_json()
    assert data["data"]["count"] == 1


def test_out_of_stock(client):
    oos = {**INV, "quantity": 0}
    with patch("app.routes.seller_inventory.inventory_service") as mock_svc:
        _patch_store(mock_svc)
        mock_svc.get_out_of_stock.return_value = [oos]
        response = client.get("/api/seller/inventory/out-of-stock", headers=_auth())
    assert response.status_code == 200
    assert response.get_json()["data"]["count"] == 1


def test_low_stock_not_treated_as_product_id(client):
    """Ensure /low-stock is routed as a static path, not as <product_id>."""
    with patch("app.routes.seller_inventory.inventory_service") as mock_svc:
        _patch_store(mock_svc)
        mock_svc.get_low_stock.return_value = []
        response = client.get("/api/seller/inventory/low-stock", headers=_auth())
    assert response.status_code == 200


# ── Transaction history ───────────────────────────────────────────────────────

def test_get_transactions(client):
    tx = {
        "id": "tx-uuid-1",
        "store_id": "store-uuid-1",
        "product_id": "prod-uuid-1",
        "transaction_type": "STOCK_IN",
        "quantity_change": 10,
        "quantity_before": 20,
        "quantity_after": 30,
    }
    with patch("app.routes.seller_inventory.inventory_service") as mock_svc:
        _patch_store(mock_svc)
        mock_svc.get_transactions.return_value = {"transactions": [tx], "page": 1, "per_page": 20}
        response = client.get(
            "/api/seller/inventory/prod-uuid-1/transactions",
            headers=_auth(),
        )
    assert response.status_code == 200
    data = response.get_json()
    assert len(data["data"]["transactions"]) == 1


# ── Authorization guard ───────────────────────────────────────────────────────

def test_inventory_no_auth(client):
    response = client.get("/api/seller/inventory")
    assert response.status_code == 401
