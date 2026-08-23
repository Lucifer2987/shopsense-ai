import logging

from flask import Blueprint, request

from app.schemas.common import error, success
from app.services import recommendation_service, context_service

logger = logging.getLogger(__name__)
recommendations_bp = Blueprint("recommendations", __name__)


@recommendations_bp.get("/recommendations/<user_id>")
def get_recommendations(user_id: str):
    try:
        ctx = context_service.get_active_context(user_id)
        ctx_data = ctx["context_data"] if ctx else None
        limit = int(request.args.get("limit", 10))
        recs = recommendation_service.get_recommendations(user_id, context=ctx_data, limit=limit)
        return success(data={"recommendations": recs, "count": len(recs)})
    except Exception as exc:
        logger.error("Recommendations error: %s", exc)
        return error("Failed to generate recommendations.", "RECOMMENDATION_ERROR", 503)
