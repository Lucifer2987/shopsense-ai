import logging

from flask import Blueprint, request

from app.schemas.common import error, success
from app.services import basket_service

logger = logging.getLogger(__name__)
basket_bp = Blueprint("basket", __name__)


@basket_bp.post("/basket/optimize")
def optimize():
    body = request.get_json(force=True) or {}
    list_id = body.get("list_id", "").strip()
    if not list_id:
        return error("list_id is required.", "MISSING_PARAM")

    budget = body.get("budget")
    if budget is not None:
        try:
            budget = float(budget)
            if budget <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return error("budget must be a positive number.", "INVALID_PARAM")

    try:
        result = basket_service.optimize_basket(list_id, budget)
        return success(data=result)
    except Exception as exc:
        logger.error("Basket optimize error: %s", exc)
        return error("Failed to optimize basket.", "DB_ERROR", 503)
