import logging

from flask import Blueprint, request

from app.schemas.common import error, success
from app.services import history_service

logger = logging.getLogger(__name__)
history_bp = Blueprint("history", __name__)


@history_bp.post("/history")
def record_purchase():
    body = request.get_json(force=True) or {}
    user_id = body.get("user_id", "").strip()
    product_id = body.get("product_id", "").strip()
    quantity = body.get("quantity")
    price = body.get("price")

    if not user_id or not product_id or quantity is None or price is None:
        return error("user_id, product_id, quantity, and price are required.", "MISSING_PARAM")

    try:
        quantity = float(quantity)
        price = float(price)
        if quantity <= 0 or price < 0:
            raise ValueError
    except (TypeError, ValueError):
        return error("quantity must be positive; price must be non-negative.", "INVALID_PARAM")

    try:
        record = history_service.record_purchase(user_id, product_id, quantity, price)
        return success(data=record, message="Purchase recorded.", code=201)
    except Exception as exc:
        logger.error("History record error: %s", exc)
        return error("Failed to record purchase.", "DB_ERROR", 503)


@history_bp.get("/history/<user_id>")
def get_history(user_id: str):
    try:
        limit = int(request.args.get("limit", 50))
        records = history_service.get_history(user_id, limit=limit)
        freq = history_service.get_purchase_frequency(user_id)
        return success(data={"history": records, "frequency": freq, "count": len(records)})
    except Exception as exc:
        logger.error("History fetch error: %s", exc)
        return error("Failed to fetch history.", "DB_ERROR", 503)
