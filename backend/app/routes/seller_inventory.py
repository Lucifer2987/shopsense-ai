import logging

from flask import Blueprint, g, request
from pydantic import ValidationError

from app.schemas.common import error, success
from app.schemas.seller import (
    AdjustStockRequest,
    CreateInventoryRequest,
    StockInRequest,
    StockOutRequest,
    UpdateMinStockRequest,
)
from app.services import inventory_service
from app.utils.auth import require_seller
from app.utils.errors import APIError

logger = logging.getLogger(__name__)
seller_inventory_bp = Blueprint("seller_inventory", __name__)


def _get_store():
    return inventory_service.get_store_for_seller(g.seller_id)


# ── Static routes must be registered BEFORE dynamic <product_id> routes ───────

@seller_inventory_bp.get("/seller/inventory/low-stock")
@require_seller
def low_stock():
    store = _get_store()
    try:
        items = inventory_service.get_low_stock(store["id"])
        return success(data={"items": items, "count": len(items)})
    except Exception as exc:
        logger.error("Low-stock query error: %s", exc)
        return error("Failed to fetch low-stock items.", "DB_ERROR", 503)


@seller_inventory_bp.get("/seller/inventory/out-of-stock")
@require_seller
def out_of_stock():
    store = _get_store()
    try:
        items = inventory_service.get_out_of_stock(store["id"])
        return success(data={"items": items, "count": len(items)})
    except Exception as exc:
        logger.error("Out-of-stock query error: %s", exc)
        return error("Failed to fetch out-of-stock items.", "DB_ERROR", 503)


# ── Collection route ──────────────────────────────────────────────────────────

@seller_inventory_bp.get("/seller/inventory")
@require_seller
def list_inventory():
    params = request.args
    try:
        page = max(1, int(params.get("page", 1)))
        per_page = min(100, max(1, int(params.get("per_page", 20))))
    except ValueError:
        return error("Invalid pagination parameters.", "INVALID_PARAM", 400)
    store = _get_store()
    try:
        data = inventory_service.get_inventory(store["id"], page, per_page)
        return success(data=data)
    except APIError:
        raise
    except Exception as exc:
        logger.error("Inventory list error: %s", exc)
        return error("Failed to fetch inventory.", "DB_ERROR", 503)


@seller_inventory_bp.post("/seller/inventory")
@require_seller
def create_inventory():
    try:
        body = CreateInventoryRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)
    store = _get_store()
    try:
        record = inventory_service.create_inventory(
            store["id"], body.product_id, body.quantity, body.minimum_stock
        )
        return success(data=record, message="Inventory record created.", code=201)
    except APIError:
        raise
    except Exception as exc:
        logger.error("Inventory create error: %s", exc)
        return error("Failed to create inventory record.", "DB_ERROR", 503)


# ── Product-specific inventory routes ─────────────────────────────────────────

@seller_inventory_bp.get("/seller/inventory/<product_id>")
@require_seller
def get_inventory(product_id: str):
    store = _get_store()
    try:
        record = inventory_service.get_inventory_by_product(store["id"], product_id)
        if not record:
            return error("No inventory record found for this product.", "INVENTORY_NOT_FOUND", 404)
        return success(data=record)
    except Exception as exc:
        logger.error("Inventory get error: %s", exc)
        return error("Failed to fetch inventory.", "DB_ERROR", 503)


@seller_inventory_bp.post("/seller/inventory/<product_id>/stock-in")
@require_seller
def stock_in(product_id: str):
    try:
        body = StockInRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)
    store = _get_store()
    try:
        result = inventory_service.stock_in(store["id"], product_id, g.seller_id, body.quantity, body.note)
        return success(data=result, message=f"Stocked in {body.quantity} unit(s).")
    except APIError:
        raise
    except Exception as exc:
        logger.error("Stock-in error: %s", exc)
        return error("Stock-in failed.", "DB_ERROR", 503)


@seller_inventory_bp.post("/seller/inventory/<product_id>/stock-out")
@require_seller
def stock_out(product_id: str):
    try:
        body = StockOutRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)
    store = _get_store()
    try:
        result = inventory_service.stock_out(store["id"], product_id, g.seller_id, body.quantity, body.note)
        return success(data=result, message=f"Stocked out {body.quantity} unit(s).")
    except APIError:
        raise
    except Exception as exc:
        logger.error("Stock-out error: %s", exc)
        return error("Stock-out failed.", "DB_ERROR", 503)


@seller_inventory_bp.post("/seller/inventory/<product_id>/adjust")
@require_seller
def adjust_stock(product_id: str):
    try:
        body = AdjustStockRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)
    store = _get_store()
    try:
        result = inventory_service.adjust_stock(
            store["id"], product_id, g.seller_id, body.quantity, body.note
        )
        return success(data=result, message=f"Inventory adjusted to {body.quantity}.")
    except APIError:
        raise
    except Exception as exc:
        logger.error("Adjust error: %s", exc)
        return error("Stock adjustment failed.", "DB_ERROR", 503)


@seller_inventory_bp.patch("/seller/inventory/<product_id>/minimum-stock")
@require_seller
def update_minimum_stock(product_id: str):
    try:
        body = UpdateMinStockRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)
    store = _get_store()
    try:
        result = inventory_service.update_minimum_stock(store["id"], product_id, body.minimum_stock)
        return success(data=result, message="Minimum stock threshold updated.")
    except APIError:
        raise
    except Exception as exc:
        logger.error("Min-stock update error: %s", exc)
        return error("Failed to update minimum stock.", "DB_ERROR", 503)


@seller_inventory_bp.get("/seller/inventory/<product_id>/transactions")
@require_seller
def get_transactions(product_id: str):
    params = request.args
    try:
        page = max(1, int(params.get("page", 1)))
        per_page = min(100, max(1, int(params.get("per_page", 20))))
    except ValueError:
        return error("Invalid pagination parameters.", "INVALID_PARAM", 400)
    store = _get_store()
    try:
        data = inventory_service.get_transactions(store["id"], product_id, page, per_page)
        return success(data=data)
    except Exception as exc:
        logger.error("Transactions error: %s", exc)
        return error("Failed to fetch transaction history.", "DB_ERROR", 503)
